const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  channel: { type: String, default: 'general' }, // 'general' | 'client-support' | 'dev-team'
  content: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

// High-performance indexes for channel discussions and 1-on-1 direct messaging
messageSchema.index({ channel: 1, createdAt: 1 });
messageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
