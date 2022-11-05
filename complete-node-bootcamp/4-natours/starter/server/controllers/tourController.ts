import { Request, Response, NextFunction } from 'express';
import { Tour } from '../model/Mongoose_Schema';
import ApiFeatures from '../utils/ApiFeatures';

// Route Handlers
// export const validateReqBody = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (!req.body?.name || !req.body?.price) {
//     return res.status(400).json({
//       status: 'error',
//       data: 'New tours need name and price.',
//     });
//   }
//   next();
// };
// export const checkId = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   value: string
// ) => {
//   const id = +value;
//   console.log('checkID ' + id);

//   if (tours.findIndex((el: Data) => el.id === id) < 0) {
//     return res.status(404).json({
//       status: 'error',
//       data: 'ID not found',
//     });
//   }
//   return next();
// };

// aliasTopTours manipulate the url to include logic for top 5 tours.
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

export const getAllTours = async (req: Request, res: Response) => {
  // curl -i -X GET http://localhost:8080/api/v1/tours
  try {
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
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({
        status: 'error',
        results: 0,
        data: e.message,
      });
      console.log(e.message);
    } else {
      console.log(String(e));
    }
  }
};
export const createTour = async (req: Request, res: Response) => {
  // curl -i -d '{ "name": "The Jolly Rancher", "price":"497", "rating": "4.3" }' -X POST http://localhost:8080/api/v1/tours -H 'content-type:application/json'

  try {
    await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      results: await Tour.count(),
      data: `${req.body?.name ?? 'Tour'} successfully added.`,
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      res.status(400).json({
        status: 'error',
        results: 0,
        data: e.message,
      });
    } else {
      console.log(String(e));
    }
  }
};

// need id
export const getTour = async (req: Request, res: Response) => {
  // curl -i http://localhost:8080/api/v1/tours/636195d2f2b523404ef1faf8
  // console.log( req.params.id);
  try {
    const tour = await Tour.findById(req.params.id).exec();

    res.status(200).json({
      status: 'success',
      results: 1,
      data: tour,
    });
  } catch (e) {
    if (e instanceof Error) {
      res.status(404).json({
        status: 'error',
        results: 0,
        data: e.message,
      });
      console.log(e.message);
    } else {
      console.log(String(e));
    }
  }
};
export const updateTour = async (req: Request, res: Response) => {
  // curl -i -d '{ "name": "The Forest Hiker2" }' -X PATCH http://localhost:8080/api/v1/tours/636195d2f2b523404ef1faf8 -H 'content-type:application/json'
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    }).exec();

    res.status(200).json({
      status: 'success',
      results: 1,
      data: `${tour?.name ?? 'Tour'} successfully updated.`,
    });
  } catch (e) {
    if (e instanceof Error) {
      res.status(404).json({
        status: 'error',
        results: 0,
        data: e.message,
      });
      console.log(e.message);
    } else {
      console.log(String(e));
    }
  }
};
export const deleteTour = async (req: Request, res: Response) => {
  // curl -i -X DELETE http://localhost:8080/api/v1/tours/6362aaaea834e079676c0432
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    console.log(deletedTour);

    res.status(200).json({
      status: 'success',
      results: 1,
      data: `${deletedTour?.name || 'Tour'} was deleted.`,
    });
  } catch (e) {
    if (e instanceof Error) {
      res.status(404).json({
        status: 'error',
        results: 0,
        data: e.message,
      });
      console.log(e.message);
    } else {
      console.log(String(e));
    }
  }
};

export const getTourStats = async (req: Request, res: Response) => {
  try {
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
  } catch (e) {
    if (e instanceof Error) {
      res.status(404).json({
        status: 'error',
        results: 0,
        data: e.message,
      });

      console.log(e.message);
    } else {
      console.log(String(e));
    }
  }
};

export const monthlyTourPlan = async (req: Request, res: Response) => {
  try {
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
  } catch (e) {
    if (e instanceof Error) {
      res.status(404).json({
        status: 'error',
        results: 0,
        data: e.message,
      });
      console.log(e.message);
    } else {
      console.log(String(e));
    }
  }
};
