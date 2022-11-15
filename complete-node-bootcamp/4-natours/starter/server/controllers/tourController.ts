import { Request, Response, NextFunction } from 'express';
import { Tour, TourType } from '../model/TourSchema';
import catchAsync from '../utils/catchAsyncError';
import ExpressError from '../utils/Error_Handling';
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

// geo spatial. Return Tours within a radius.
export const getTourWithIn = catchAsync(404, async (req, res, next) => {
  const { unit, distance, latlng } = req.params;
  const [lat, lng] = latlng.split(',');
  // needs to be in radian. which is distance / radius of earth.
  // unit if not miles, must be kilometers.
  const radians = unit === 'mi' ? +distance / 3963.2 : +distance / 6378.1;
  if (!unit || !distance || !lat || !lng)
    return next(new ExpressError(400, 'Provide distance, latlng, units. '));
  // console.log({ lat, lng, unit, distance, latlng });
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radians] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { data: tours },
  });
});

// geo spatial. Return Tours distance away from your location.
export const getDistance = catchAsync(404, async (req, res, next) => {
  const { unit, latlng } = req.params;
  const [lat, lng] = latlng.split(',');
  // needs to be in radian. which is distance / radius of earth.
  // unit if not miles, must be kilometers.
  if (!unit || !lat || !lng)
    return next(new ExpressError(400, 'Provide latlng, units. '));
  // console.log({ lat, lng, unit, latlng });
  // miles or kilometers
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: { data: distances },
  });
});

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
