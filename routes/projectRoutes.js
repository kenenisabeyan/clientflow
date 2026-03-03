const authorize = require("../middleware/roleMiddleware");
const express = require("express");
const router = express.Router();

// const protect = require("../middleware/authMiddleware");

const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");


// ===============================
// CREATE PROJECT
// ===============================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    const newProject = new Project({
      title,
      description,
      user: req.user.id
    });

    const savedProject = await newProject.save();

    res.status(201).json(savedProject);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ===============================
// GET ALL PROJECTS FOR LOGGED USER
// ===============================
router.get(
  "/",
  authMiddleware,
  authorize("admin", "client"),
  async (req, res) => {
    try {
  let projects;

  if (req.user.role === "admin") {
    projects = await Project.find(); // admin sees all
  } else {
    projects = await Project.find({ user: req.user.id }); // client sees own
  }

  res.json(projects);
} catch (error) {
  res.status(500).json({ message: error.message });
}


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