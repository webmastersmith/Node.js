import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  sanitizeUserInput,
} from '../controllers/userController';
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  approvedRoles,
  onlyMe,
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

// everything after this line, user will have to be logged in.
router.use(protect);
// update user info
router
  .route('/me')
  .get(onlyMe, getUserById)
  .patch(onlyMe, updateUser)
  .delete(onlyMe, deleteUser);

// all routes below this must be an 'admin'.
router.use(approvedRoles('admin'));
// get all Users -admin only
router.route('/').get(getAllUsers);

// updateUser Info
router
  .route('/:id')
  .get(getUserById)
  .patch(sanitizeUserInput, updateUser)
  .delete(deleteUser);

export default router;
