const { pool } = require("../config/database");

const addActivity = async ({
  type,
  title,
  description,
  project,
  user,
}) => {
  const result = await pool.query(
    `
    INSERT INTO activities (
      id,
      type,
      title,
      description,
      project,
      user_name
    )
    VALUES (
      'ACT-' || LPAD(
        nextval('activities_id_seq')::TEXT,
        4,
        '0'
      ),
      $1,
      $2,
      $3,
      $4,
      $5
    )
    RETURNING
      id,
      type,
      title,
      description,
      project,
      user_name AS "user",
      created_at AS "timestamp"
    `,
    [
      type,
      title,
      description || "",
      project || null,
      user || null,
    ]
  );

  return result.rows[0];
};

const getActivities = async () => {
  const result = await pool.query(
    `
    SELECT
      id,
      type,
      title,
      description,
      project,
      user_name AS "user",
      created_at AS "timestamp"
    FROM activities
    ORDER BY created_at DESC
    LIMIT 50
    `
  );

  return result.rows;
};

module.exports = {
  addActivity,
  getActivities,
};