const { notifications } = require("../data/notificationData");

const getNotifications = (req, res) => {
  const userNotifications = notifications
    .filter(
      (notification) =>
        notification.userId === req.user.id
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

  res.status(200).json({
    success: true,
    count: userNotifications.length,
    unreadCount: userNotifications.filter(
      (notification) => !notification.read
    ).length,
    data: userNotifications,
  });
};

const markNotificationAsRead = (req, res) => {
  const notification = notifications.find(
    (item) =>
      item.id === req.params.id &&
      item.userId === req.user.id
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  notification.read = true;

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
};

const markAllNotificationsAsRead = (req, res) => {
  notifications.forEach((notification) => {
    if (notification.userId === req.user.id) {
      notification.read = true;
    }
  });

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};