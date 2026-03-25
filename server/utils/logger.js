const Activity = require('../models/Activity');

const logActivity = async (userId, projectId, action, details = {}) => {
  try {
    const activity = await Activity.create({ user: userId, project: projectId, action, details });
    if (projectId) {
      const Project = require('../models/Project');
      await Project.findByIdAndUpdate(projectId, { $push: { activityLogs: activity._id } });
    }
    return activity;
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

module.exports = logActivity;