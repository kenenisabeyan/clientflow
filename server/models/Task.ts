const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  project: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['todo', 'inProgress', 'done'], default: 'todo' },
  date: { type: String, required: true },
  avatar: { type: String, default: 'U' },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
