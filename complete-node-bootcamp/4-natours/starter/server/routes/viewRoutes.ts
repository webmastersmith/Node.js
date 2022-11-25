import express from 'express';
import {
  getOverview,
  getTour,
  getLogin,
  getAccount,
  myTours,
} from '../controllers/viewController';
import {
  login,
  protect,
  isLoggedIn,
  logout,
} from '../controllers/authController';
import { createBookingCheckout } from '../controllers/bookingController';

// Website Views
const router = express.Router();
router.use(isLoggedIn);
router.route('/').get(createBookingCheckout, isLoggedIn, getOverview);
router.route('/tour/:tourName').get(isLoggedIn, getTour);
router.route('/login').get(isLoggedIn, getLogin).post(login);
router.route('/logout').get(logout);
// protect all these routes
router.use(protect);
router.route('/me').get(getAccount);
router.route('/my-tours').get(myTours);

export default router;
