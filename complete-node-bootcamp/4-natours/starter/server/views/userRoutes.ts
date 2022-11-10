import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  approvedRoles,
} from '../controllers/authController';

// Users
const router = express.Router();

// signup
router.route('/signup').post(signup);
// login
router.route('/login').post(login);
// forgotPassword
router.route('/forgotPassword').post(forgotPassword);
// resetPassword
router.route('/resetPassword/:token').patch(resetPassword);
// updatePassword logged in user.
router.route('/updatePassword').patch(protect, updatePassword);
// update user info
router
  .route('/updateMe')
  .patch(protect, updateUser)
  .delete(protect, deleteUser);

// get all Users -admin only
router.route('/').get(protect, approvedRoles('admin'), getAllUsers);

// updateUser Info
router
  .route('/:id')
  .get(protect, approvedRoles('admin'), getUser)
  .patch(protect, approvedRoles('admin'), updateUser)
  .delete(protect, approvedRoles('admin'), deleteUser);

export default router;
