const upload = require("../middleware/uploadMiddleware");

const authorize = require("../middleware/roleMiddleware");
const express = require("express");
const router = express.Router();

// const protect = require("../middleware/authMiddleware");

const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");


// ===============================
// CREATE PROJECT
// ===============================
// ===============================
// UPLOAD FILE TO PROJECT
// ===============================
router.post(
  "/:id/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Only admin or assigned user
      if (
        req.user.role !== "admin" &&
        project.user.toString() !== req.user.id
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      project.files.push(req.file.filename);

      await project.save();

      res.json({
        message: "File uploaded successfully",
        file: req.file.filename
      });

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



// ===============================
// ADD COMMENT TO PROJECT
// ===============================
router.post(
  "/:id/comment",
  authMiddleware,
  async (req, res) => {
    try {
      const { text } = req.body;

      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Only admin or assigned user can comment
      if (
        req.user.role !== "admin" &&
        project.user.toString() !== req.user.id
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      const newComment = {
        text,
        user: req.user.id
      };

      project.comments.push(newComment);

      await project.save();

      res.status(201).json(project);

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);