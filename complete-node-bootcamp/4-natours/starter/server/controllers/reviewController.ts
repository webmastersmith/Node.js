import { Review } from '../model/ReviewSchema';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsyncError';
import 'dotenv/config';
// import ApiFeatures from '../utils/ApiFeatures';
import ExpressError from '../utils/Error_Handling';
import { Document } from 'mongoose';
import { UserType } from '../model/UserSchema';
import {
  factoryDeleteOne,
  factoryUpdateOne,
  factoryCreateOne,
  factoryGetAll,
} from '../utils/factories';

// path should be: POST /tours/:id/reviews
export const getAllReviews = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    // if params, only get reviews matching tourId.
    const { tourId } = req.params;
    console.log('getReviewsByTour', { tourId });
    if (tourId) {
      const reviews = await Review.find({ tour: tourId });
      console.log('getReviewsByTour', { reviews });
      res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: reviews,
      });
      return;
    }
    // no params, get all reviews.
    factoryGetAll(Review);
  }
);

export const sanitizeAddUserIdAndTourId = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    const { review, rating } = req.body;
    const { id } = req.params;
    const user = req.user as
      | (Document<unknown, any, UserType> &
          UserType &
          Required<{ _id: string }>)
      | null;
    if (!user || !id)
      return next(new ExpressError(401, 'To post a review, please login.'));

    const data: any = {};
    if (review) data.review = review;
    if (rating) data.rating = rating;
    data.user = user.id;
    data.tour = id;
    req.body = data;
    next();
  }
);
export const createReview = factoryCreateOne(Review);

export const sanitizeReviewInput = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    const { review, rating } = req.body;
    const data: any = {};
    if (review) data.review = review;
    if (rating) data.rating = rating;
    req.body = data;
    next();
  }
);
export const updateReview = factoryUpdateOne(Review);
export const deleteReview = factoryDeleteOne(Review);
