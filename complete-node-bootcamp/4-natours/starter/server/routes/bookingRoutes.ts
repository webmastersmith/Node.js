import express from 'express';
import { protect, approvedRoles, onlyMe } from '../controllers/authController';
import { checkoutSession } from '../controllers/bookingController';

const router = express.Router();

router.use(protect);
router.route('/checkout-session/:tourId').get(checkoutSession);
//   .post(onlyMe, sanitizeReviewInput, setUserIdAndTourId, createReview);

export default router;
