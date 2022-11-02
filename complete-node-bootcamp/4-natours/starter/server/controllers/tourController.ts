import { Request, Response } from 'express';
import { Tour } from '../model/Mongoose_Schema';

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
export const getAllTours = async (req: Request, res: Response) => {
  // curl -i -X GET http://localhost:8080/api/v1/tours
  try {
    const tours = await Tour.find(req.query).exec();
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: tours,
    });
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({
        status: 'error',
        results: await Tour.count(),
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
