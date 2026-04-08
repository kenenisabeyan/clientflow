const express = require('express');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  uploadFile,
  downloadFile,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('admin'), createProject);

router.route('/:id')
  .get(getProjectById)
  .put(authorize('admin'), updateProject)
  .delete(authorize('admin'), deleteProject);

router.post('/:id/files', upload.single('file'), uploadFile);
router.get('/:id/files/:filename', downloadFile);

module.exports = router;