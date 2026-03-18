const Project = require('../models/Project');
const User = require('../models/User');
const logActivity = require('../utils/logger');
const { validateProjectInput } = require('../utils/validators');
const path = require('path');
const fs = require('fs');

// @desc    Get all projects (admin sees all, clients see only theirs)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      // Admin: populate client details
      projects = await Project.find().populate('client', 'name email');
    } else {
      // Client: only projects where client = req.user.id
      projects = await Project.find({ client: req.user.id }).populate('client', 'name email');
    }
    res.json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID (with access control)
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name role' },
      })
      .populate({
        path: 'activityLogs',
        options: { sort: { timestamp: -1 }, limit: 20 },
        populate: { path: 'user', select: 'name' },
      });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check access: admin or the assigned client
    if (req.user.role !== 'admin' && project.client._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project (admin only)
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res, next) => {
  try {
    const { title, description, status, clientId } = req.body;

    // Validate input
    const errors = validateProjectInput(title, clientId);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    // Verify client exists and is actually a client
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') {
      return res.status(400).json({ success: false, message: 'Invalid client ID' });
    }

    const project = await Project.create({
      title,
      description,
      status: status || 'pending',
      client: clientId,
    });

    // Log activity
    await logActivity(req.user.id, project._id, 'created project', { title });

    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project (admin only for most fields, but status can be updated by devs later)
// @route   PUT /api/projects/:id
// @access  Private (admin can update anything; clients can update only if allowed? We'll restrict to admin for simplicity)
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only admin can update project details (including status)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can update projects' });
    }

    const { title, description, status } = req.body;

    // Keep track of changes for logging
    const changes = {};
    if (title && title !== project.title) changes.title = { from: project.title, to: title };
    if (description && description !== project.description) changes.description = { from: project.description, to: description };
    if (status && status !== project.status) changes.status = { from: project.status, to: status };

    // Update fields
    project.title = title || project.title;
    project.description = description || project.description;
    project.status = status || project.status;

    await project.save();

    // Log activity if any changes
    if (Object.keys(changes).length > 0) {
      await logActivity(req.user.id, project._id, 'updated project', changes);
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project (admin only)
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Optionally delete associated files from disk
    if (project.files && project.files.length > 0) {
      project.files.forEach(file => {
        const filePath = path.join(__dirname, '../public/uploads', path.basename(file.path));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await project.deleteOne(); // This will also remove references (comments, activities) – we may want to clean them separately

    // Log activity
    await logActivity(req.user.id, null, 'deleted project', { projectId: req.params.id, title: project.title });

    res.json({ success: true, message: 'Project removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload file to a project
// @route   POST /api/projects/:id/files
// @access  Private (admin or assigned client)
const uploadFile = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check access: admin or the assigned client
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to upload to this project' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Add file info to project
    const fileData = {
      filename: req.file.originalname,
      path: req.file.path, // full path
      uploadedBy: req.user.id,
    };
    project.files.push(fileData);
    await project.save();

    // Log activity
    await logActivity(req.user.id, project._id, 'uploaded file', { filename: req.file.originalname });

    res.json({ success: true, file: fileData });
  } catch (error) {
    next(error);
  }
};

// @desc    Download a file from a project
// @route   GET /api/projects/:id/files/:filename
// @access  Private (admin or assigned client)
const downloadFile = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Access control
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Find the file in project.files array
    const file = project.files.find(f => f.filename === req.params.filename);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Send file
    res.download(file.path, file.filename);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  uploadFile,
  downloadFile,
};