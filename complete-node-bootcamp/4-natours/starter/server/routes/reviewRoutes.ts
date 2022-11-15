import express from 'express';
import {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  sanitizeReviewInput,
  setUserIdAndTourId,
  getReviewById,
  setReviewId,
} from '../controllers/reviewController';
import { protect, approvedRoles, onlyMe } from '../controllers/authController';

const router = express.Router({ mergeParams: true });

router.use(protect);
// POST '/tours/:tourId/reviews'
// POST '/' // both routes will go to same place.
router
  .route('/')
  .get(getAllReviews)
  .post(onlyMe, sanitizeReviewInput, setUserIdAndTourId, createReview);

// id = reviewId
router
  .route('/me/:reviewId?')
  .get(onlyMe, setReviewId, getAllReviews)
  .patch(onlyMe, sanitizeReviewInput, updateReview)
  .delete(onlyMe, deleteReview);

router.use(approvedRoles('admin'));
router
  .route('/:id')
  .get(getReviewById)
  .patch(sanitizeReviewInput, updateReview)
  .delete(deleteReview);

export default router;
