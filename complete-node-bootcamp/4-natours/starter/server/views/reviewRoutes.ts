import express from 'express';
import {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  sanitizeReviewInput,
  sanitizeAddUserIdAndTourId,
} from '../controllers/reviewController';
import { protect, approvedRoles } from '../controllers/authController';

const router = express.Router({ mergeParams: true });

// POST '/:tourId/reviews'
// POST '/' // both routes will go to same place.
router.route('/').get(getAllReviews);

// id = reviewId
router
  .route('/:id')
  .patch(protect, sanitizeReviewInput, updateReview)
  .post(
    protect,
    approvedRoles('user'),
    sanitizeAddUserIdAndTourId,
    createReview
  )
  .delete(protect, deleteReview);

export default router;
