const Project = require('../models/Project');
const User = require('../models/User');
const logActivity = require('../utils/logger');

exports.getProjects = async (req, res, next) => {
  try {
    let query: any = {};
    if (req.user.role === 'client') {
      query.client = req.user.id;
    } else if (req.user.role === 'developer') {
      query.$or = [{ developer: req.user.id }, { developer: null }];
    }

    const { status, search } = req.query;
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .populate('client', 'name email company')
      .populate('developer', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (err) { next(err); }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email company phone')
      .populate('developer', 'name email')
      .populate({ path: 'comments', populate: { path: 'user', select: 'name role' } })
      .populate({ path: 'activityLogs', options: { sort: { createdAt: -1 }, limit: 20 }, populate: { path: 'user', select: 'name' } });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    if (req.user.role === 'client' && project.client._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, project });
  } catch (err) { next(err); }
};

exports.createProject = async (req, res, next) => {
  try {
    const { title, description, status, clientId, developerId, budget, deadline, progress } = req.body;
    if (!title || !clientId) return res.status(400).json({ success: false, message: 'Title and client required' });

    const client = await User.findById(clientId);
    if (!client) return res.status(400).json({ success: false, message: 'Invalid client' });

    const project = await Project.create({
      title,
      description: description || '',
      status: status || 'pending',
      client: clientId,
      developer: developerId || null,
      budget: Number(budget) || 0,
      deadline: deadline || null,
      progress: Number(progress) || 0
    });

    await logActivity(req.user.id, project._id, 'created project', { title });
    
    const populated = await Project.findById(project._id)
      .populate('client', 'name email company')
      .populate('developer', 'name email');

    res.status(201).json({ success: true, project: populated });
  } catch (err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    // Clients can't modify project settings; developers can update status and progress
    if (req.user.role === 'client') {
      return res.status(403).json({ success: false, message: 'Clients cannot modify project settings' });
    }

    const { title, description, status, developerId, budget, deadline, progress } = req.body;
    const changes: any = {};

    if (title && title !== project.title) changes.title = { from: project.title, to: title };
    if (status && status !== project.status) changes.status = { from: project.status, to: status };

    if (title !== undefined && req.user.role === 'admin') project.title = title;
    if (description !== undefined && req.user.role === 'admin') project.description = description;
    if (status !== undefined) project.status = status;
    if (developerId !== undefined && req.user.role === 'admin') project.developer = developerId || null;
    if (budget !== undefined && req.user.role === 'admin') project.budget = Number(budget);
    if (deadline !== undefined && req.user.role === 'admin') project.deadline = deadline;
    if (progress !== undefined) project.progress = Number(progress);

    await project.save();
    if (Object.keys(changes).length) await logActivity(req.user.id, project._id, 'updated project', changes);

    const populated = await Project.findById(project._id)
      .populate('client', 'name email company')
      .populate('developer', 'name email');

    res.json({ success: true, project: populated });
  } catch (err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only admin can delete' });

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
