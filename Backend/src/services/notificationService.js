const { pool } = require("../config/database");

const createNotification = async ({
  userId,
  type,
  title,
  description,
  project = null,
}) => {
  const result = await pool.query(
    `
    INSERT INTO notifications (
      id,
      user_id,
      type,
      title,
      description,
      project,
      read
    )
    VALUES (
      'NOT-' || LPAD(
        nextval('notifications_id_seq')::TEXT,
        3,
        '0'
      ),
      $1,
      $2,
      $3,
      $4,
      $5,
      FALSE
    )
    RETURNING
      id,
      user_id AS "userId",
      type,
      title,
      description,
      project,
      read,
      created_at AS "createdAt"
    `,
    [
      userId,
      type,
      title,
      description,
      project,
    ]
  );

  return result.rows[0];
};

module.exports = {
  createNotification,
};