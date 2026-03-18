const Comment = require('../models/Comment');
const Project = require('../models/Project');
const logActivity = require('../utils/logger');

// @desc    Add a comment to a project
// @route   POST /api/comments
// @access  Private (admin or assigned client)
const addComment = async (req, res, next) => {
  try {
    const { text, projectId } = req.body;

    if (!text || !projectId) {
      return res.status(400).json({ success: false, message: 'Text and projectId are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Access control
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to comment on this project' });
    }

    const comment = await Comment.create({
      text,
      user: req.user.id,
      project: projectId,
    });

    // Add comment reference to project
    project.comments.push(comment._id);
    await project.save();

    // Populate user info for response
    await comment.populate('user', 'name role');

    // Log activity
    await logActivity(req.user.id, projectId, 'added comment', { commentId: comment._id });

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a project (already populated in project detail, but can be separate)
// @route   GET /api/comments/:projectId
// @access  Private (admin or assigned client)
const getComments = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Access control
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const comments = await Comment.find({ project: req.params.projectId })
      .populate('user', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, getComments };