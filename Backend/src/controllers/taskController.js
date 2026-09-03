const { pool } = require("../config/database");
const { addActivity } = require("../services/activityService");

/*
 * Convert a database task row into the response
 * shape already expected by the Nexa frontend.
 */
const formatTask = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    project: row.project,
    assignee: row.assignee,
    due: row.due,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    ...(row.completed_at
      ? { completedAt: row.completed_at }
      : {}),
  };
};

/*
 * Base query used throughout the controller.
 *
 * Projects and users are joined here so the API can
 * continue returning project names and assignee initials
 * instead of database foreign-key IDs.
 */
const TASK_SELECT = `
  SELECT
    t.id,
    t.title,
    p.name AS project,
    COALESCE(
      u.initials,
      t.assignee_initials,
      ''
    ) AS assignee,
    t.due,
    t.priority,
    t.status,
    t.created_at,
    t.completed_at
  FROM tasks t
  JOIN projects p
    ON p.id = t.project_id
  LEFT JOIN users u
    ON u.id = t.assignee_id
`;

/**
 * Get all tasks
 */
const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      project,
    } = req.query;

    const conditions = [];
    const values = [];

    if (status) {
      values.push(status);
      conditions.push(
        `t.status = $${values.length}`
      );
    }

    if (priority) {
      values.push(priority);
      conditions.push(
        `t.priority = $${values.length}`
      );
    }

    if (project) {
      values.push(project);
      conditions.push(
        `LOWER(p.name) = LOWER($${values.length})`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const result = await pool.query(
      `
        ${TASK_SELECT}
        ${whereClause}
        ORDER BY t.id
      `,
      values
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(formatTask),
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load tasks",
    });
  }
};

/**
 * Get task by ID
 */
const getTaskById = async (req, res) => {
  try {
    const result = await pool.query(
      `
        ${TASK_SELECT}
        WHERE t.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatTask(result.rows[0]),
    });
  } catch (error) {
    console.error("Get task by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load task",
    });
  }
};

/**
 * Resolve project name -> project ID
 */
const getProjectIdByName = async (projectName) => {
  const result = await pool.query(
    `
      SELECT id
      FROM projects
      WHERE LOWER(name) = LOWER($1)
    `,
    [projectName.trim()]
  );

  return result.rows[0]?.id || null;
};

/**
 * Resolve user initials -> user ID
 */
const getUserByInitials = async (initials) => {
  if (!initials) return null;

  const result = await pool.query(
    `
      SELECT id, initials
      FROM users
      WHERE UPPER(initials) = UPPER($1)
    `,
    [String(initials).trim()]
  );

  return result.rows[0] || null;
};

/**
 * Generate next task ID.
 */
const generateTaskId = async () => {
  const result = await pool.query(`
    SELECT
      'T-' ||
      (
        COALESCE(
          MAX(
            NULLIF(
              SUBSTRING(id FROM 3),
              ''
            )::INTEGER
          ),
          0
        ) + 1
      )::TEXT AS id
    FROM tasks
    WHERE id LIKE 'T-%'
  `);

  return result.rows[0].id;
};

/**
 * Create task
 */
const createTask = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      title,
      project,
      assignee,
      due,
      priority,
      status,
    } = req.body;

    if (
      !title ||
      !project ||
      !assignee ||
      !due ||
      !priority ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, project, assignee, due, priority, and status are required",
      });
    }

    const validPriorities = [
      "High",
      "Medium",
      "Low",
    ];

    const validStatuses = [
      "todo",
      "in-progress",
      "review",
      "blocked",
      "done",
    ];

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    const projectId = await getProjectIdByName(
      project
    );

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project not found",
      });
    }

    const user = await getUserByInitials(assignee);

    /*
     * We preserve the initials even if there isn't
     * currently a matching user record.
     */
    const assigneeId = user?.id || null;
    const assigneeInitials =
      user?.initials ||
      String(assignee).trim().toUpperCase();

    await client.query("BEGIN");

    const taskId = await generateTaskId();

    const createdAt = new Date();
    const completedAt =
      status === "done"
        ? createdAt
        : null;

    await client.query(
      `
        INSERT INTO tasks (
          id,
          title,
          project_id,
          assignee_id,
          assignee_initials,
          due,
          priority,
          status,
          created_at,
          completed_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10
        )
      `,
      [
        taskId,
        title.trim(),
        projectId,
        assigneeId,
        assigneeInitials,
        due,
        priority,
        status,
        createdAt,
        completedAt,
      ]
    );

    await client.query("COMMIT");

    const result = await pool.query(
      `
        ${TASK_SELECT}
        WHERE t.id = $1
      `,
      [taskId]
    );

    const newTask = formatTask(
      result.rows[0]
    );

    addActivity({
      type: "task-created",
      title: "Created new task",
      description: newTask.title,
      project: newTask.project,
      user: newTask.assignee,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create task",
    });
  } finally {
    client.release();
  }
};

/**
 * Update task
 */
const updateTask = async (req, res) => {
  const client = await pool.connect();

  try {
    const taskId = req.params.id;

    const {
      title,
      project,
      assignee,
      due,
      priority,
      status,
    } = req.body;

    if (
      !title ||
      !project ||
      !assignee ||
      !due ||
      !priority ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, project, assignee, due, priority, and status are required",
      });
    }

    const validPriorities = [
      "High",
      "Medium",
      "Low",
    ];

    const validStatuses = [
      "todo",
      "in-progress",
      "review",
      "blocked",
      "done",
    ];

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    const existingTask = await client.query(
      `
        SELECT
          id,
          created_at,
          completed_at
        FROM tasks
        WHERE id = $1
      `,
      [taskId]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const projectId =
      await getProjectIdByName(project);

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project not found",
      });
    }

    const user = await getUserByInitials(
      assignee
    );

    const assigneeId =
      user?.id || null;

    const assigneeInitials =
      user?.initials ||
      String(assignee)
        .trim()
        .toUpperCase();

    const existing =
      existingTask.rows[0];

    let completedAt = null;

    if (status === "done") {
      completedAt =
        existing.completed_at ||
        new Date();
    }

    await client.query("BEGIN");

    await client.query(
      `
        UPDATE tasks
        SET
          title = $1,
          project_id = $2,
          assignee_id = $3,
          assignee_initials = $4,
          due = $5,
          priority = $6,
          status = $7,
          completed_at = $8
        WHERE id = $9
      `,
      [
        title.trim(),
        projectId,
        assigneeId,
        assigneeInitials,
        due,
        priority,
        status,
        completedAt,
        taskId,
      ]
    );

    await client.query("COMMIT");

    const result = await pool.query(
      `
        ${TASK_SELECT}
        WHERE t.id = $1
      `,
      [taskId]
    );

    const updatedTask = formatTask(
      result.rows[0]
    );

    addActivity({
      type: "task-updated",
      title: "Updated task",
      description: updatedTask.title,
      project: updatedTask.project,
      user: updatedTask.assignee,
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Update task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update task",
    });
  } finally {
    client.release();
  }
};

/**
 * Update task status
 */
const updateTaskStatus = async (
  req,
  res
) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;

    const validStatuses = [
      "todo",
      "in-progress",
      "review",
      "blocked",
      "done",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    const existing = await pool.query(
      `
        SELECT id, completed_at
        FROM tasks
        WHERE id = $1
      `,
      [taskId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    let completedAt = null;

    if (status === "done") {
      completedAt =
        existing.rows[0].completed_at ||
        new Date();
    }

    const result = await pool.query(
      `
        UPDATE tasks
        SET
          status = $1,
          completed_at = $2
        WHERE id = $3
        RETURNING id
      `,
      [
        status,
        completedAt,
        taskId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const taskResult = await pool.query(
      `
        ${TASK_SELECT}
        WHERE t.id = $1
      `,
      [taskId]
    );

    const updatedTask = formatTask(
      taskResult.rows[0]
    );

    addActivity({
      type:
        status === "done"
          ? "task-completed"
          : "task-status-changed",
      title:
        status === "done"
          ? "Completed task"
          : "Updated task status",
      description: updatedTask.title,
      project: updatedTask.project,
      user: updatedTask.assignee,
    });

    return res.status(200).json({
      success: true,
      message:
        "Task status updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error(
      "Update task status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update task status",
    });
  }
};

/**
 * Delete task
 */
const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const existing = await pool.query(
      `
        ${TASK_SELECT}
        WHERE t.id = $1
      `,
      [taskId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const deletedTask = formatTask(
      existing.rows[0]
    );

    await pool.query(
      `
        DELETE FROM tasks
        WHERE id = $1
      `,
      [taskId]
    );

    addActivity({
      type: "task-deleted",
      title: "Deleted task",
      description: deletedTask.title,
      project: deletedTask.project,
      user: deletedTask.assignee,
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: deletedTask,
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete task",
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};