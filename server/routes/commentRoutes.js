const express = require('express');
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // all comment routes require auth

router.post('/', addComment);
router.get('/:projectId', getComments);

module.exports = router;