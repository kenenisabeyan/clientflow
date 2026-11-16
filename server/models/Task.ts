const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  project: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['todo', 'inProgress', 'done'], default: 'todo' },
  date: { type: String, required: true },
  avatar: { type: String, default: 'U' },
}, { timestamps: true });

// Performance indexes for sprint Kanban and developer backlog
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ status: 1 });

module.exports = mongoose.model('Task', taskSchema);
