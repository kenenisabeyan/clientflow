const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    files: [
      {
        filename: String,
        path: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    activityLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);