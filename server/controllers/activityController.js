const Activity = require('../models/Activity');
const Project = require('../models/Project');

// @desc    Get activity logs (global for admin, project-specific for clients)
// @route   GET /api/activity
// @query   ?projectId=... (optional)
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    let query = {};

    // If projectId provided, filter by that project
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      // Access control: only admin or assigned client can see project logs
      if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      query.project = projectId;
    } else {
      // Global feed – only admin can see all logs
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to view global activity' });
      }
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const activities = await Activity.find(query)
      .populate('user', 'name')
      .populate('project', 'title')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities };