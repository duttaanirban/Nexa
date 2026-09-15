const {
  getActivities,
} = require("../services/activityService");

const getRecentActivity = async (req, res) => {
  try {
    const activities = await getActivities();

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error("Get activity error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity history",
    });
  }
};

module.exports = {
  getRecentActivity,
};