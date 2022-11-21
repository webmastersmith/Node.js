import express from 'express';
import {
  getOverview,
  getTour,
  getLogin,
  getAccount,
} from '../controllers/viewController';
import {
  login,
  protect,
  isLoggedIn,
  logout,
} from '../controllers/authController';

// Website Views
const router = express.Router();
router.use(isLoggedIn);
router.route('/').get(isLoggedIn, getOverview);
router.route('/tour/:tourName').get(isLoggedIn, getTour);
router.route('/login').get(isLoggedIn, getLogin).post(login);
router.route('/logout').get(logout);
router.route('/me').get(protect, getAccount);

export default router;
