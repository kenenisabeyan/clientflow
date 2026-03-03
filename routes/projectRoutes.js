const authorize = require("../middleware/roleMiddleware");
const express = require("express");
const router = express.Router();

// const protect = require("../middleware/authMiddleware");

const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");


// ===============================
// CREATE PROJECT
// ===============================

router.post(
  "/",
  authMiddleware,
  authorize("admin"),
  async (req, res) => {
    try {
      const { title, description, userId } = req.body;

      const newProject = new Project({
        title,
        description,
        user: userId // assigned client
      });

      const savedProject = await newProject.save();

      res.status(201).json(savedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


// ===============================
// GET ALL PROJECTS FOR LOGGED USER
// ===============================
router.get(
  "/dashboard/stats",
  authMiddleware,
  async (req, res) => {
    try {
      let totalProjects;
      let completed;
      let pending;
      let inProgress;

      if (req.user.role === "admin") {
        totalProjects = await Project.countDocuments();
        completed = await Project.countDocuments({ status: "completed" });
        pending = await Project.countDocuments({ status: "pending" });
        inProgress = await Project.countDocuments({ status: "in-progress" });
      } else {
        totalProjects = await Project.countDocuments({ user: req.user.id });
        completed = await Project.countDocuments({
          user: req.user.id,
          status: "completed"
        });
        pending = await Project.countDocuments({
          user: req.user.id,
          status: "pending"
        });
        inProgress = await Project.countDocuments({
          user: req.user.id,
          status: "in-progress"
        });
      }

      res.json({
        totalProjects,
        completed,
        pending,
        inProgress
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


// ===============================
// UPDATE PROJECT
// ===============================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;
    project.status = req.body.status || project.status;

    const updatedProject = await project.save();

    res.json(updatedProject);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// DELETE PROJECT
// ===============================
router.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// VERY IMPORTANT
module.exports = router;