const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null, // null for global actions (e.g., user management)
    },
    action: {
      type: String,
      required: true,
    },
    details: {
      type: Object,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
activitySchema.index({ project: 1, timestamp: -1 });
activitySchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);