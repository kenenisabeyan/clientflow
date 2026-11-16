const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getTasks = async (req, res, next) => {
  try {
    let query: any = {};
    if (req.user.role === 'developer') {
      // Developers see tasks assigned to them or unassigned
      query.$or = [{ assignedTo: req.user.id }, { assignedTo: null }];
    } else if (req.user.role === 'client') {
      // Clients see tasks belonging to their projects
      const clientProjects = await Project.find({ client: req.user.id }).select('_id title');
      const projectIds = clientProjects.map((p: any) => p._id);
      const projectTitles = clientProjects.map((p: any) => p.title);
      query.$or = [
        { projectId: { $in: projectIds } },
        { project: { $in: projectTitles } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 });

    const formatted: any = { todo: [], inProgress: [], done: [] };

    tasks.forEach((t: any) => {
      const taskData = {
        id: t._id,
        _id: t._id,
        title: t.title,
        description: t.description,
        project: t.project,
        projectId: t.projectId,
        assignedTo: t.assignedTo,
        priority: t.priority,
        status: t.status,
        date: t.date,
        avatar: t.avatar
      };
      if (formatted[t.status]) {
        formatted[t.status].push(taskData);
      } else {
        formatted.todo.push(taskData);
      }
    });

    res.json({
      success: true,
      count: tasks.length,
      tasks,
      ...formatted
    });
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, project, projectId, assignedTo, priority, status, date, description, avatar } = req.body;
    if (!title || !project) {
      return res.status(400).json({ success: false, message: 'Title and project are required' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      project,
      projectId: projectId || null,
      assignedTo: assignedTo || null,
      priority: priority || 'Medium',
      status: status || 'todo',
      date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatar: avatar || req.user.name?.charAt(0).toUpperCase() || 'U'
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title status');

    res.status(201).json({ success: true, task: populated, id: populated._id, ...populated.toObject() });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, project, priority, status, date, description, assignedTo } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (project !== undefined) updateData.project = project;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (date !== undefined) updateData.date = date;
    if (description !== undefined) updateData.description = description;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title status');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['todo', 'inProgress', 'done'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { next(err); }
};
