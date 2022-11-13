import { Request, Response, NextFunction } from 'express';
import { Tour, TourType } from '../model/TourSchema';
import catchAsync from '../utils/catchAsyncError';
import {
  factoryDeleteOne,
  factoryGetAll,
  factoryUpdateOne,
  factoryCreateOne,
  factoryGetOneById,
} from '../utils/factories';

// aliasTopTours manipulate the req.query url to include logic for top 5 tours.
export const aliasTopTours = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // limit=5&sort=
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  return next();
};

export const sanitizeTourInput = catchAsync(404, async (req, res, next) => {
  const {
    name,
    duration,
    maxGroupSize,
    difficulty,
    ratingsAverage,
    ratingsQuantity,
    price,
    summary,
    description,
    imageCover,
    images,
    startDates,
    secretTour,
    startLocation,
    locations,
    guides,
  } = req.body as TourType;

  const data = {} as TourType;

  if (name) data.name = name;
  if (duration) data.duration = duration;
  if (maxGroupSize) data.maxGroupSize = maxGroupSize;
  if (difficulty) data.difficulty = difficulty;
  if (ratingsAverage) data.ratingsAverage = ratingsAverage;
  if (ratingsQuantity) data.ratingsQuantity = ratingsQuantity;
  if (price) data.price = price;
  if (summary) data.summary = summary;
  if (description) data.description = description;
  if (imageCover) data.imageCover = imageCover;
  if (images) data.images = images;
  if (startDates) data.startDates = startDates;
  if (secretTour) data.secretTour = secretTour;
  if (startLocation) data.startLocation = startLocation;
  if (locations) data.locations = locations;
  if (guides) data.guides = guides;

  req.body = data;

  next();
});
export const getAllTours = factoryGetAll(Tour);
export const updateTour = factoryUpdateOne(Tour); // sanitize input
export const createTour = factoryCreateOne(Tour); // sanitize input
export const deleteTour = factoryDeleteOne(Tour);
export const getTourById = factoryGetOneById(Tour, 'reviews');

export const getTourStats = catchAsync(404, async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, // field to group by.
        numTours: { $count: {} }, // counts the number in each group.
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { minPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, // search through again and filter.
    // },
  ]);
  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: stats,
  });
});

export const monthlyTourPlan = catchAsync(404, async (req, res, next) => {
  // count the tours each month.
  const year: number = +req.params?.year || 2022;
  const stats = await Tour.aggregate([
    {
      $unwind: { path: '$startDates' },
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $count: {} }, // counts the number in each group.
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTours: -1, month: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: stats,
  });
});
