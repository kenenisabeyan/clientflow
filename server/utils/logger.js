const Activity = require('../models/Activity');

/**
 * Log an activity
 * @param {ObjectId} userId - ID of the user performing the action
 * @param {ObjectId} projectId - Optional project ID (null if global)
 * @param {string} action - Description of the action
 * @param {Object} details - Additional metadata
 * @returns {Promise<Object>} - The created activity document
 */
const logActivity = async (userId, projectId, action, details = {}) => {
  try {
    const activity = await Activity.create({
      user: userId,
      project: projectId,
      action,
      details,
    });

    if (projectId) {
      const Project = require('../models/Project');
      await Project.findByIdAndUpdate(projectId, {
        $push: { activityLogs: activity._id },
      });
    }

    return activity;
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw; we don't want activity logging to break the main flow
  }
};

module.exports = logActivity;