import express from 'express';
import { protect, approvedRoles, onlyMe } from '../controllers/authController';
import { checkoutSession } from '../controllers/bookingController';
import {
  getAllBookings,
  updateBooking,
  createBooking,
  deleteBooking,
  getBookingById,
} from '../controllers/bookingController';

const router = express.Router();

// everything below this is protected.
router.use(protect);
router.route('/checkout-session/:tourId').get(checkoutSession);
//   .post(onlyMe, sanitizeReviewInput, setUserIdAndTourId, createReview);

// everything below this has to be admin or lead-guide
router.use(approvedRoles('admin', 'lead-guide'));
router
  .route('/:id')
  .get(getBookingById)
  .patch(updateBooking)
  .delete(deleteBooking);

router.route('/').get(getAllBookings).post(createBooking);

export default router;
