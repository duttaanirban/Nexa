const { pool } = require("../config/database");
const { addActivity } = require("../services/activityService");

/*
 * Build the project response in the same shape
 * currently expected by the Nexa frontend.
 */
const getProjectWithTeam = async (projectId) => {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.name,
        p.description,
        p.progress,
        p.status,
        COALESCE(
          ARRAY_AGG(u.initials ORDER BY u.initials)
          FILTER (WHERE u.initials IS NOT NULL),
          '{}'
        ) AS team
      FROM projects p
      LEFT JOIN project_members pm
        ON pm.project_id = p.id
      LEFT JOIN users u
        ON u.id = pm.user_id
      WHERE p.id = $1
      GROUP BY
        p.id,
        p.name,
        p.description,
        p.progress,
        p.status
    `,
    [projectId]
  );

  return result.rows[0] || null;
};

/**
 * Get all projects
 */
const getProjects = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.progress,
        p.status,
        COALESCE(
          ARRAY_AGG(u.initials ORDER BY u.initials)
          FILTER (WHERE u.initials IS NOT NULL),
          '{}'
        ) AS team
      FROM projects p
      LEFT JOIN project_members pm
        ON pm.project_id = p.id
      LEFT JOIN users u
        ON u.id = pm.user_id
      GROUP BY
        p.id,
        p.name,
        p.description,
        p.progress,
        p.status
      ORDER BY p.id
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load projects",
    });
  }
};

/**
 * Get project by ID
 */
const getProjectById = async (req, res) => {
  try {
    const project = await getProjectWithTeam(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load project",
    });
  }
};

/**
 * Generate the next Nexa project ID.
 */
const generateProjectId = async () => {
  const result = await pool.query(`
    SELECT
      'PRJ-' ||
      LPAD(
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
        )::TEXT,
        2,
        '0'
      ) AS id
    FROM projects
    WHERE id LIKE 'PRJ-%'
  `);

  return result.rows[0].id;
};

/**
 * Create project
 */
const createProject = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      name,
      description,
      progress = 0,
      status = "On track",
      team = [],
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    if (
      !Number.isInteger(Number(progress)) ||
      Number(progress) < 0 ||
      Number(progress) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100",
      });
    }

    const validStatuses = [
      "On track",
      "In progress",
      "Blocked",
      "Completed",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project status",
      });
    }

    if (!Array.isArray(team)) {
      return res.status(400).json({
        success: false,
        message: "Team must be an array",
      });
    }

    await client.query("BEGIN");

    const projectId = await generateProjectId();

    await client.query(
      `
        INSERT INTO projects (
          id,
          name,
          description,
          progress,
          status
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        projectId,
        name.trim(),
        description.trim(),
        Number(progress),
        status,
      ]
    );

    /*
     * Resolve team initials to real user IDs.
     * Unknown initials are ignored rather than creating fake users.
     */
    for (const initials of team) {
      const userResult = await client.query(
        `
          SELECT id
          FROM users
          WHERE UPPER(initials) = UPPER($1)
        `,
        [String(initials).trim()]
      );

      if (userResult.rows.length > 0) {
        await client.query(
          `
            INSERT INTO project_members (
              project_id,
              user_id
            )
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `,
          [
            projectId,
            userResult.rows[0].id,
          ]
        );
      }
    }

    await client.query("COMMIT");

    const newProject =
      await getProjectWithTeam(projectId);

    addActivity({
      type: "project-created",
      title: "Created new project",
      description: newProject.name,
      project: newProject.name,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create project",
    });
  } finally {
    client.release();
  }
};

/**
 * Update project
 */
const updateProject = async (req, res) => {
  const client = await pool.connect();

  try {
    const projectId = req.params.id;

    const {
      name,
      description,
      progress = 0,
      status = "On track",
      team = [],
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    if (
      !Number.isInteger(Number(progress)) ||
      Number(progress) < 0 ||
      Number(progress) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100",
      });
    }

    const validStatuses = [
      "On track",
      "In progress",
      "Blocked",
      "Completed",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project status",
      });
    }

    if (!Array.isArray(team)) {
      return res.status(400).json({
        success: false,
        message: "Team must be an array",
      });
    }

    const existingProject = await client.query(
      `
        SELECT id
        FROM projects
        WHERE id = $1
      `,
      [projectId]
    );

    if (existingProject.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await client.query("BEGIN");

    await client.query(
      `
        UPDATE projects
        SET
          name = $1,
          description = $2,
          progress = $3,
          status = $4
        WHERE id = $5
      `,
      [
        name.trim(),
        description.trim(),
        Number(progress),
        status,
        projectId,
      ]
    );

    /*
     * Rebuild project membership from the submitted team.
     */
    await client.query(
      `
        DELETE FROM project_members
        WHERE project_id = $1
      `,
      [projectId]
    );

    for (const initials of team) {
      const userResult = await client.query(
        `
          SELECT id
          FROM users
          WHERE UPPER(initials) = UPPER($1)
        `,
        [String(initials).trim()]
      );

      if (userResult.rows.length > 0) {
        await client.query(
          `
            INSERT INTO project_members (
              project_id,
              user_id
            )
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `,
          [
            projectId,
            userResult.rows[0].id,
          ]
        );
      }
    }

    await client.query("COMMIT");

    const updatedProject =
      await getProjectWithTeam(projectId);

    addActivity({
      type: "project-updated",
      title: "Updated project",
      description: updatedProject.name,
      project: updatedProject.name,
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Update project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update project",
    });
  } finally {
    client.release();
  }
};

/**
 * Delete project
 */
const deleteProject = async (req, res) => {
  const client = await pool.connect();

  try {
    const projectId = req.params.id;

    /*
     * Fetch the project first because the database delete
     * will cascade into project_members and tasks.
     */
    const project = await getProjectWithTeam(
      projectId
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await client.query(
      `
        DELETE FROM projects
        WHERE id = $1
      `,
      [projectId]
    );

    addActivity({
      type: "project-deleted",
      title: "Deleted project",
      description: project.name,
      project: project.name,
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: project,
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete project",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};