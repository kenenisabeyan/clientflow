const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const {
  createProject,
  getProjects
} = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");

// =======================
// CREATE PROJECT
// =======================
router.post("/", authMiddleware, createProject);

// =======================
// GET PROJECTS
// =======================
router.get("/", authMiddleware, getProjects);

// =======================
// FILE UPLOAD
// =======================
router.post(
  "/:id/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    res.json({ message: "File uploaded" });
  }
);

module.exports = router;