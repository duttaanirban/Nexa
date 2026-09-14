const { GoogleGenAI, Type } = require("@google/genai");
const { pool } = require("../config/database");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate AI Health Analysis for a Project
 * POST /api/ai/project-analysis/:projectId
 */
const analyzeProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const projectResult = await pool.query(
      `SELECT id, name, description, progress, status FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const project = projectResult.rows[0];

    const tasksResult = await pool.query(
      `SELECT id, title, due, priority, status FROM tasks WHERE project_id = $1`,
      [projectId]
    );

    const tasks = tasksResult.rows;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY environment variable is not set",
      });
    }

    const prompt = `
      Analyze this project and its tasks:
      Project: ${project.name} (Status: ${project.status}, Progress: ${project.progress}%)
      Description: ${project.description}
      Tasks: ${JSON.stringify(tasks)}

      Return JSON matching this exact structure:
      {
        "health": "Healthy" | "At Risk" | "Critical",
        "summary": "Short summary",
        "risks": ["Risk 1", "Risk 2"],
        "recommendations": ["Recommendation 1"],
        "priorityTasks": [
          { "taskId": "Task ID", "reason": "Reason for priority" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const analysis = JSON.parse(response.text);

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("AI Project Analysis Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Unable to generate AI project analysis",
    });
  }
};

/**
 * Generate AI Task Prioritization
 * POST /api/ai/task-prioritization/:projectId
 */
const prioritizeTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    let tasks = [];
    let projectContext = "";

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY environment variable is not set",
      });
    }

    // 1. Fetch tasks dynamically (All projects vs. Single project)
    if (projectId === "all") {
      const tasksResult = await pool.query(
        `SELECT t.id, t.title, p.name AS project, t.due, t.priority, t.status, t.created_at 
         FROM tasks t 
         JOIN projects p ON p.id = t.project_id`
      );
      tasks = tasksResult.rows;
      projectContext = "All Workspace Projects";
    } else {
      const projectResult = await pool.query(
        `SELECT id, name, description, progress, status FROM projects WHERE id = $1`,
        [projectId]
      );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      const project = projectResult.rows[0];
      projectContext = `Project: ${project.name} (Status: ${project.status}, Progress: ${project.progress}%)`;

      const tasksResult = await pool.query(
        `SELECT id, title, due, priority, status, created_at FROM tasks WHERE project_id = $1`,
        [projectId]
      );
      tasks = tasksResult.rows;
    }

    // 2. Filter for incomplete tasks before sending to Gemini
    const incompleteTasks = tasks.filter((t) => t.status !== "done");

    if (incompleteTasks.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          summary: "There are no incomplete tasks available for prioritization across the selected scope.",
          prioritizedTasks: [],
        },
      });
    }

    // 3. Prompt construction
    const prompt = `
      You are Nexa AI, an assistant inside a project management application.
      Analyze only the project/task data supplied below.
      Do not invent facts. Do not modify task data.

      Today's date: ${new Date().toISOString().split("T")[0]}
      Scope: ${projectContext}

      Task Data (Real PostgreSQL Records):
      ${JSON.stringify(incompleteTasks, null, 2)}

      Prioritize these incomplete tasks in order of execution priority based on:
      - Overdue status or approaching due dates
      - Priority level (High > Medium > Low)
      - Status (e.g., 'blocked', 'in-progress', 'in review', 'todo')
      - Impact on overall workflow

      Do not include completed ('done') tasks.
    `;

    // 4. Request JSON from Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "Analyze the tasks and return a prioritized list in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Short explanation of the current task priorities.",
            },
            prioritizedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskId: { type: Type.STRING },
                  rank: { type: Type.INTEGER },
                  recommendedPriority: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  urgency: {
                    type: Type.STRING,
                    enum: ["High", "Medium", "Low"],
                  },
                },
                required: ["taskId", "rank", "recommendedPriority", "reason", "urgency"],
              },
            },
          },
          required: ["summary", "prioritizedTasks"],
        },
      },
    });

    const prioritizationData = JSON.parse(response.text);

    return res.status(200).json({
      success: true,
      data: prioritizationData,
    });
  } catch (error) {
    console.error("AI Task Prioritization Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Unable to analyze project tasks",
    });
  }
};

/**
 * Generate AI Suggested Tasks from User Requirement
 * POST /api/ai/generate-tasks/:projectId
 */
const generateTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Requirement description is required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY environment variable is not set",
      });
    }

    // 1. Fetch target project from PostgreSQL
    const projectResult = await pool.query(
      `SELECT id, name, description, status FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const project = projectResult.rows[0];

    // 2. Fetch existing task titles to prevent duplicate suggestions
    const existingTasksResult = await pool.query(
      `SELECT title FROM tasks WHERE project_id = $1 LIMIT 30`,
      [projectId]
    );
    const existingTitles = existingTasksResult.rows.map((t) => t.title);

    // 3. Construct prompt
    const prompt = `
      You are Nexa AI, an assistant inside a project management application.
      Convert the user's requirement into a practical set of software development tasks.

      Project Name: ${project.name}
      Project Goal: ${project.description}

      User Requirement:
      "${description.trim()}"

      Existing Tasks in Project (Do NOT generate duplicates of these):
      ${JSON.stringify(existingTitles)}

      Instructions:
      - Generate 4 to 8 actionable, specific, non-vague implementation tasks.
      - Do not invent task IDs, timestamps, or assignees.
      - Return only valid JSON matching the specified schema.
    `;

    // 4. Request Structured Output from Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "Convert project requirements into actionable tasks in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Short explanation of the implementation plan.",
            },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  priority: {
                    type: Type.STRING,
                    enum: ["High", "Medium", "Low"],
                  },
                  reason: { type: Type.STRING },
                },
                required: ["title", "priority", "reason"],
              },
            },
          },
          required: ["summary", "tasks"],
        },
      },
    });

    const generatedData = JSON.parse(response.text);

    return res.status(200).json({
      success: true,
      data: generatedData,
    });
  } catch (error) {
    console.error("AI Task Generation Error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Unable to generate tasks right now",
    });
  }
};

module.exports = {
  analyzeProject,
  prioritizeTasks,
  generateTasks,
};