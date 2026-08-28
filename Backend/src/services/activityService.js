const activities = [];

const addActivity = ({
  type,
  title,
  description,
  project,
  user,
}) => {
  const activity = {
    id: `ACT-${Date.now()}`,
    type,
    title,
    description,
    project: project || null,
    user: user || null,
    timestamp: new Date().toISOString(),
  };

  activities.unshift(activity);

  // Keep only the latest 50 activities
  if (activities.length > 50) {
    activities.length = 50;
  }

  return activity;
};

const getActivities = () => {
  return activities;
};

module.exports = {
  addActivity,
  getActivities,
};