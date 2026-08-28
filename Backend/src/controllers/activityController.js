const {
  getActivities,
} = require("../services/activityService");

const getRecentActivity = (req, res) => {
  const activities = getActivities();

  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities,
  });
};

module.exports = {
  getRecentActivity,
};