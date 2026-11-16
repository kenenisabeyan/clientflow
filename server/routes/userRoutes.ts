const express = require('express');
const { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  updateUserRole, 
  deleteUser 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(authorize('admin'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

router.put('/:id/role', authorize('admin'), updateUserRole);

module.exports = router;
