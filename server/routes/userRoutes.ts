const express = require('express');
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.put('/:id', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;