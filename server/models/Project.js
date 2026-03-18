const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A client must be assigned'],
    },
    files: [
      {
        filename: String,
        path: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    // We'll store comments as references; we can also embed them, but references allow pagination
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    activityLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Project', projectSchema);