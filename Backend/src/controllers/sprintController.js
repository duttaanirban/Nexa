const { pool } = require("../config/database");
const { addActivity } = require("../services/activityService");

const VALID_STATUSES = [
  "Active",
  "Upcoming",
  "Completed",
  "Cancelled",
];

/**
 * Generate the next sprint ID.
 */
const generateSprintId = async () => {
  const result = await pool.query(`
    SELECT
      'SPR-' ||
      (
        COALESCE(
          MAX(
            NULLIF(
              SUBSTRING(id FROM 5),
              ''
            )::INTEGER
          ),
          0
        ) + 1
      )::TEXT AS id
    FROM sprints
    WHERE id LIKE 'SPR-%'
  `);

  return result.rows[0].id;
};

/**
 * Get sprint with its related tasks.
 */
const getSprintWithTasks = async (sprintId) => {
  const result = await pool.query(
    `
      SELECT
        s.id,
        s.name,
        s.start_date AS "startDate",
        s.end_date AS "endDate",
        s.status,
        s.goal,
        s.created_at AS "createdAt",

        COALESCE(
          JSON_AGG(
            CASE
              WHEN t.id IS NULL THEN NULL
              ELSE JSON_BUILD_OBJECT(
                'id', t.id,
                'title', t.title,
                'project', p.name,
                'assignee',
                  COALESCE(
                    u.initials,
                    t.assignee_initials,
                    ''
                  ),
                'due', t.due,
                'priority', t.priority,
                'status', t.status,
                'createdAt', t.created_at,
                'completedAt', t.completed_at
              )
            END
            ORDER BY t.id
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) AS tasks

      FROM sprints s

      LEFT JOIN sprint_tasks st
        ON st.sprint_id = s.id

      LEFT JOIN tasks t
        ON t.id = st.task_id

      LEFT JOIN projects p
        ON p.id = t.project_id

      LEFT JOIN users u
        ON u.id = t.assignee_id

      WHERE s.id = $1

      GROUP BY
        s.id,
        s.name,
        s.start_date,
        s.end_date,
        s.status,
        s.goal,
        s.created_at
    `,
    [sprintId]
  );

  return result.rows[0] || null;
};

/**
 * Get all sprints.
 */
const getSprints = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.name,
        s.start_date AS "startDate",
        s.end_date AS "endDate",
        s.status,
        s.goal,
        s.created_at AS "createdAt",

        COUNT(st.task_id)::INTEGER AS "taskCount",

        COUNT(
          CASE
            WHEN t.status = 'done'
            THEN 1
          END
        )::INTEGER AS "completedTaskCount"

      FROM sprints s

      LEFT JOIN sprint_tasks st
        ON st.sprint_id = s.id

      LEFT JOIN tasks t
        ON t.id = st.task_id

      GROUP BY
        s.id,
        s.name,
        s.start_date,
        s.end_date,
        s.status,
        s.goal,
        s.created_at

      ORDER BY s.start_date DESC
    `);

    const sprints = result.rows.map((row) => {
      const total = row.taskCount;
      const completed = row.completedTaskCount;

      return {
        ...row,
        taskCount: total,
        completedTaskCount: completed,
        completionRate: total
          ? Math.round((completed / total) * 100)
          : 0,
      };
    });

    return res.status(200).json({
      success: true,
      count: sprints.length,
      data: sprints,
    });
  } catch (error) {
    console.error("Get sprints error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load sprints",
    });
  }
};

/**
 * Get sprint by ID.
 */
const getSprintById = async (req, res) => {
  try {
    const sprint = await getSprintWithTasks(
      req.params.id
    );

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: sprint,
    });
  } catch (error) {
    console.error("Get sprint by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load sprint",
    });
  }
};

/**
 * Create sprint.
 */
const createSprint = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      name,
      startDate,
      endDate,
      status = "Upcoming",
      goal = "",
    } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Name, start date, and end date are required",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sprint status",
      });
    }

    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before the start date",
      });
    }

    const sprintId =
      await generateSprintId();

    await client.query("BEGIN");

    await client.query(
      `
        INSERT INTO sprints (
          id,
          name,
          start_date,
          end_date,
          status,
          goal
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
      `,
      [
        sprintId,
        name.trim(),
        startDate,
        endDate,
        status,
        goal.trim(),
      ]
    );

    await client.query("COMMIT");

    const sprint =
      await getSprintWithTasks(sprintId);

    addActivity({
      type: "sprint-created",
      title: "Created sprint",
      description: sprint.name,
      project: "",
      user: req.user?.id || "",
    });

    return res.status(201).json({
      success: true,
      message: "Sprint created successfully",
      data: sprint,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create sprint error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create sprint",
    });
  } finally {
    client.release();
  }
};

/**
 * Update sprint.
 */
const updateSprint = async (req, res) => {
  try {
    const sprintId = req.params.id;

    const {
      name,
      startDate,
      endDate,
      status,
      goal = "",
    } = req.body;

    if (!name || !startDate || !endDate || !status) {
      return res.status(400).json({
        success: false,
        message:
          "Name, start date, end date, and status are required",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sprint status",
      });
    }

    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before the start date",
      });
    }

    const result = await pool.query(
      `
        UPDATE sprints
        SET
          name = $1,
          start_date = $2,
          end_date = $3,
          status = $4,
          goal = $5
        WHERE id = $6
        RETURNING id
      `,
      [
        name.trim(),
        startDate,
        endDate,
        status,
        goal.trim(),
        sprintId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sprint not found",
      });
    }

    const sprint =
      await getSprintWithTasks(sprintId);

    addActivity({
      type: "sprint-updated",
      title: "Updated sprint",
      description: sprint.name,
      project: "",
      user: req.user?.id || "",
    });

    return res.status(200).json({
      success: true,
      message: "Sprint updated successfully",
      data: sprint,
    });
  } catch (error) {
    console.error("Update sprint error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update sprint",
    });
  }
};

/**
 * Delete sprint.
 */
const deleteSprint = async (req, res) => {
  try {
    const sprintId = req.params.id;

    const existing = await pool.query(
      `
        SELECT id, name
        FROM sprints
        WHERE id = $1
      `,
      [sprintId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sprint not found",
      });
    }

    const deletedSprint = existing.rows[0];

    await pool.query(
      `
        DELETE FROM sprints
        WHERE id = $1
      `,
      [sprintId]
    );

    addActivity({
      type: "sprint-deleted",
      title: "Deleted sprint",
      description: deletedSprint.name,
      project: "",
      user: req.user?.id || "",
    });

    return res.status(200).json({
      success: true,
      message: "Sprint deleted successfully",
      data: deletedSprint,
    });
  } catch (error) {
    console.error("Delete sprint error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete sprint",
    });
  }
};

/**
 * Add a task to a sprint.
 */
const addTaskToSprint = async (req, res) => {
  try {
    const {
      sprintId,
    } = req.params;

    const {
      taskId,
    } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required",
      });
    }

    const sprint = await pool.query(
      `
        SELECT id
        FROM sprints
        WHERE id = $1
      `,
      [sprintId]
    );

    if (sprint.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sprint not found",
      });
    }

    const task = await pool.query(
      `
        SELECT id
        FROM tasks
        WHERE id = $1
      `,
      [taskId]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await pool.query(
      `
        INSERT INTO sprint_tasks (
          sprint_id,
          task_id
        )
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `,
      [sprintId, taskId]
    );

    const updatedSprint =
      await getSprintWithTasks(sprintId);

    return res.status(200).json({
      success: true,
      message: "Task added to sprint",
      data: updatedSprint,
    });
  } catch (error) {
    console.error(
      "Add task to sprint error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to add task to sprint",
    });
  }
};

/**
 * Remove a task from a sprint.
 */
const removeTaskFromSprint = async (
  req,
  res
) => {
  try {
    const {
      sprintId,
      taskId,
    } = req.params;

    const result = await pool.query(
      `
        DELETE FROM sprint_tasks
        WHERE sprint_id = $1
          AND task_id = $2
        RETURNING task_id
      `,
      [sprintId, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task is not part of this sprint",
      });
    }

    const updatedSprint =
      await getSprintWithTasks(sprintId);

    return res.status(200).json({
      success: true,
      message: "Task removed from sprint",
      data: updatedSprint,
    });
  } catch (error) {
    console.error(
      "Remove task from sprint error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to remove task from sprint",
    });
  }
};

module.exports = {
  getSprints,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  addTaskToSprint,
  removeTaskFromSprint,
};