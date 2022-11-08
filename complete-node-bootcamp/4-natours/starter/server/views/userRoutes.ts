import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { signup } from '../controllers/authController';

// Users
const router = express.Router();

// signup
router.route('/signup').post(signup);

router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
