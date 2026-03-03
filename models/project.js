const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  status: {
    type: String,
    enum: ["pending", "in progress", "completed"],
    default: "pending"
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  files: [
    {
      type: String
    }
  ]
},
{
  timestamps: true
}
);

module.exports = mongoose.model("Project", projectSchema);