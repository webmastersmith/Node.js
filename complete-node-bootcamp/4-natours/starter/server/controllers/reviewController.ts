import { Review } from '../model/ReviewSchema';
import catchAsync from '../utils/catchAsyncError';
import 'dotenv/config';
import {
  factoryDeleteOne,
  factoryUpdateOne,
  factoryCreateOne,
  factoryGetAll,
  factoryGetOneById,
} from '../utils/factories';

// path should be: POST /tours/:id/reviews
export const getAllReviews = factoryGetAll(Review);

export const setUserIdAndTourId = catchAsync(400, async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.tour = req.params.tourId;
  next();
});
export const createReview = factoryCreateOne(Review);

export const sanitizeReviewInput = catchAsync(400, async (req, res, next) => {
  const { review, rating } = req.body;
  const data: any = {};
  if (review) data.review = review;
  if (rating) data.rating = rating;
  req.body = data;
  next();
});
export const setReviewId = catchAsync(400, async (req, res, next) => {
  req.params.reviewId = req.params.id;
  next();
});
export const updateReview = factoryUpdateOne(Review);
export const deleteReview = factoryDeleteOne(Review);
export const getReviewById = factoryGetOneById(Review);
