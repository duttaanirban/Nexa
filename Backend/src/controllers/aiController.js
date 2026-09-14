const { GoogleGenAI } = require("@google/genai");
const { pool } = require("../config/database");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const analyzeProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // 1. Fetch project
    const projectResult = await pool.query(
      `SELECT id, name, description, progress, status FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const project = projectResult.rows[0];

    // 2. Fetch tasks
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

    // 3. Request JSON response using gemini-3.6-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash", // <-- UPDATED MODEL HERE
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

module.exports = {
  analyzeProject,
};