const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  channel: { type: String, default: 'general' }, // 'general' | 'client-support' | 'dev-team'
  content: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
