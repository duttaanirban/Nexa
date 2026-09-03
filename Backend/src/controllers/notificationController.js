const { pool } = require("../config/database");

const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        user_id AS "userId",
        type,
        title,
        description,
        project,
        read,
        created_at AS "createdAt"
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    const unreadCount = result.rows.filter(
      (notification) => !notification.read
    ).length;

    res.status(200).json({
      success: true,
      count: result.rows.length,
      unreadCount,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const result = await pool.query(
      `
      UPDATE notifications
      SET read = TRUE
      WHERE id = $1
        AND user_id = $2
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
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE notifications
      SET read = TRUE
      WHERE user_id = $1
      `,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};