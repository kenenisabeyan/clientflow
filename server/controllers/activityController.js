const Activity = require('../models/Activity');
const Project = require('../models/Project');

const getActivities = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    let query = {};

    // If a specific project is requested, check access
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
      // Admin or the project's client can view its activity
      if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      query.project = projectId;
    } else {
      // No projectId – return all activity the user is allowed to see
      if (req.user.role === 'admin') {
        // Admin sees everything
        query = {};
      } else {
        // Client sees only activity from projects they are assigned to
        const clientProjects = await Project.find({ client: req.user.id }).select('_id');
        const projectIds = clientProjects.map(p => p._id);
        query.project = { $in: projectIds };
      }
    }

    // Pagination (optional)
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
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities };