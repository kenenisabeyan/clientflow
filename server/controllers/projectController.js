const Project = require('../models/Project');
const User = require('../models/User');
const logActivity = require('../utils/logger');

exports.getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find().populate('client', 'name email');
    } else {
      projects = await Project.find({ client: req.user.id }).populate('client', 'name email');
    }
    res.json({ success: true, projects });
  } catch (err) { next(err); }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email')
      .populate({ path: 'comments', populate: { path: 'user', select: 'name role' } })
      .populate({ path: 'activityLogs', options: { sort: { createdAt: -1 }, limit: 20 }, populate: { path: 'user', select: 'name' } });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (req.user.role !== 'admin' && project.client._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, project });
  } catch (err) { next(err); }
};

exports.createProject = async (req, res, next) => {
  try {
    const { title, description, status, clientId } = req.body;
    if (!title || !clientId) return res.status(400).json({ success: false, message: 'Title and client required' });
    const client = await User.findById(clientId);
    if (!client || client.role !== 'client') return res.status(400).json({ success: false, message: 'Invalid client' });
    const project = await Project.create({ title, description, status, client: clientId });
    await logActivity(req.user.id, project._id, 'created project', { title });
    res.status(201).json({ success: true, project });
  } catch (err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only admin can update' });
    const { title, description, status } = req.body;
    const changes = {};
    if (title && title !== project.title) changes.title = { from: project.title, to: title };
    if (description && description !== project.description) changes.description = { from: project.description, to: description };
    if (status && status !== project.status) changes.status = { from: project.status, to: status };
    project.title = title || project.title;
    project.description = description || project.description;
    project.status = status || project.status;
    await project.save();
    if (Object.keys(changes).length) await logActivity(req.user.id, project._id, 'updated project', changes);
    res.json({ success: true, project });
  } catch (err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await project.deleteOne();
    await logActivity(req.user.id, null, 'deleted project', { projectId: req.params.id, title: project.title });
    res.json({ success: true, message: 'Project removed' });
  } catch (err) { next(err); }
};

exports.uploadFile = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const fileData = {
      filename: req.file.originalname,
      path: req.file.path,
      uploadedBy: req.user.id,
    };
    project.files.push(fileData);
    await project.save();
    await logActivity(req.user.id, project._id, 'uploaded file', { filename: req.file.originalname });
    res.json({ success: true, file: fileData });
  } catch (err) { next(err); }
};

exports.downloadFile = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const file = project.files.find(f => f.filename === req.params.filename);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });
    res.download(file.path, file.filename);
  } catch (err) { next(err); }
};