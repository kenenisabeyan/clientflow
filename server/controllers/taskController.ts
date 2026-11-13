const Task = require('../models/Task');

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find();
    
    const formatted = { todo: [], inProgress: [], done: [] };
    
    tasks.forEach(t => {
      const taskData = {
        id: t._id,
        title: t.title,
        project: t.project,
        priority: t.priority,
        date: t.date,
        avatar: t.avatar
      };
      if (formatted[t.status]) {
        formatted[t.status].push(taskData);
      } else {
        formatted.todo.push(taskData);
      }
    });

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({
      id: task._id,
      title: task.title,
      project: task.project,
      priority: task.priority,
      date: task.date,
      avatar: task.avatar
    });
  } catch (err) {
    next(err);
  }
};
