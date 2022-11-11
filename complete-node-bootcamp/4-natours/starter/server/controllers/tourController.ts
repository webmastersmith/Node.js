import { Request, Response, NextFunction } from 'express';
import { Tour } from '../model/TourSchema';
import ApiFeatures from '../utils/ApiFeatures';
import catchAsync from '../utils/catchAsyncError';
// import ExpressError from '../utils/Error_Handling';
// import ExpressError from '../utils/Error_Handling';

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

export const getAllTours = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    // curl -i -X GET http://localhost:8080/api/v1/tours
    // this does not need error if found nothing, because nothing should be returned.
    const feature = new ApiFeatures(Tour, req.query)
      .filter()
      .sort()
      .fields()
      .pageLimit();
    const tours = (await feature.query) as typeof Tour[];

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: tours,
    });
  }
);

export const createTour = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    // curl -i -d '{ "name": "The Jolly Rancher", "price":"497", "rating": "4.3" }' -X POST http://localhost:8080/api/v1/tours -H 'content-type:application/json'

    // returns only if tour successfully created.
    await Tour.create(req.body);

    // if (!tour) {
    //   throw new Error(`Tour ${req.params.id} not found :-(`);
    // }

    res.status(201).json({
      status: 'success',
      results: await Tour.count(),
      data: `${req.body?.name ?? 'Tour'} successfully added.`,
    });
  }
);

// need id
export const getTourById = catchAsync(
  404,
  async (req: Request, res: Response, next: NextFunction) => {
    // curl -i http://localhost:8080/api/v1/tours/636195d2f2b523404ef1faf8
    // console.log('getTourById id', req.params.id);
    // returns tour or null
    const tour = await Tour.findById(req.params.id).exec();
    // console.log('getTourById tour', tour);
    if (!tour) {
      throw new Error(`Tour ${req.params.id} not found :-(`);
    }

    res.status(200).json({
      status: 'success',
      results: 1,
      data: tour,
    });
  }
);

// patch
export const updateTour = catchAsync(
  404,
  async (req: Request, res: Response, next: NextFunction) => {
    // curl -i -d '{ "name": "The Forest Hiker2" }' -X PATCH http://localhost:8080/api/v1/tours/636195d2f2b523404ef1faf8 -H 'content-type:application/json'
    // returns tour or null
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    }).exec();

    if (!tour) {
      throw new Error(`Tour ${req.params.id} could not be found.`);
    }

    res.status(200).json({
      status: 'success',
      results: 1,
      data: `${tour?.name ?? 'Tour'} successfully updated.`,
    });
  }
);

export const deleteTour = catchAsync(
  404,
  async (req: Request, res: Response, next: NextFunction) => {
    // curl -i -X DELETE http://localhost:8080/api/v1/tours/6362aaaea834e079676c0432
    console.log('delete tour', req.user, req.params.id);

    // returns tour or null
    const tour = await Tour.findByIdAndDelete(req.params.id);
    console.log('delete tour', tour);

    if (!tour) {
      throw new Error(`Tour ${req.params.id} could not be found.`);
    }
    console.log(tour);

    res.status(200).json({
      status: 'success',
      results: 1,
      data: `${tour?.name || 'Tour'} was deleted.`,
    });
  }
);

export const getTourStats = catchAsync(
  404,
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);

export const monthlyTourPlan = catchAsync(
  404,
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);
