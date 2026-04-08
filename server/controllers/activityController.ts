const Activity = require('../models/Activity');
const Project = require('../models/Project');

exports.getActivities = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    let query = {};

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
      if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      query.project = projectId;
    } else {
      if (req.user.role !== 'admin') {
        const clientProjects = await Project.find({ client: req.user.id }).select('_id');
        const ids = clientProjects.map(p => p._id);
        query.project = { $in: ids };
      }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const activities = await Activity.find(query)
      .populate('user', 'name')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments(query);
    res.json({ success: true, activities, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};