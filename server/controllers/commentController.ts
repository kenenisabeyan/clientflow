const Comment = require('../models/Comment');
const Project = require('../models/Project');
const logActivity = require('../utils/logger');

exports.addComment = async (req, res, next) => {
  try {
    const { text, projectId } = req.body;
    if (!text || !projectId) return res.status(400).json({ success: false, message: 'Text and projectId required' });
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    // Admin, the assigned Client, or the assigned Developer can post comments
    const isAuthorized = req.user.role === 'admin' || 
      project.client?.toString() === req.user.id || 
      (project.developer && project.developer.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to comment on this project' });
    }

    const comment = await Comment.create({ text, user: req.user.id, project: projectId });
    project.comments.push(comment._id);
    await project.save();
    await comment.populate('user', 'name role');
    await logActivity(req.user.id, projectId, 'added comment', { commentId: comment._id });
    res.status(201).json({ success: true, comment });
  } catch (err) { next(err); }
};

exports.getComments = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    const isAuthorized = req.user.role === 'admin' || 
      project.client?.toString() === req.user.id || 
      (project.developer && project.developer.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to view comments on this project' });
    }

    const comments = await Comment.find({ project: req.params.projectId }).populate('user', 'name role').sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (err) { next(err); }
};