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
router.use(authorize('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.put('/:id/role', updateUserRole);

module.exports = router;
