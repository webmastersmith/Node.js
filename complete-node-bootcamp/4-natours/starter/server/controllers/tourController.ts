import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import { Data } from '../@types/types';
// import { Tour } from '../model/Mongoose_Schema';

const tours = JSON.parse(
  fs.readFileSync(process.cwd() + '/dev-data/data/tours-simple.json', 'utf-8')
);

// Route Handlers
export const validateReqBody = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body?.name || !req.body?.price) {
    return res.status(400).json({
      status: 'error',
      data: 'New tours need name and price.',
    });
  }
  next();
};
export const checkId = (
  req: Request,
  res: Response,
  next: NextFunction,
  value: string
) => {
  const id = +value;
  console.log('checkID ' + id);

  if (tours.findIndex((el: Data) => el.id === id) < 0) {
    return res.status(404).json({
      status: 'error',
      data: 'ID not found',
    });
  }
  return next();
};
export const getAllTours = (req: Request, res: Response) => {
  console.log(req.requestTime);
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
};
export const createTour = (req: Request, res: Response) => {
  // curl -i -d '{ "username": "bob", "password":"secret", "website": "stack.com" }' -X POST http://localhost:8080/api/v1/tours -H 'content-type:application/json'
  const newTourId = tours.length;
  const newTour = { id: newTourId, ...req.body };
  tours.push(newTour);
  fs.writeFile(
    process.cwd() + '/dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      if (err) {
        console.log(err);
        res.status(400).send('Error');
        return;
      }
      res.status(200).json({
        status: 'success',
        results: tours.length,
        data: 'Tour successfully added.',
      });
    }
  );
};

// need id
export const getTour = (req: Request, res: Response) => {
  // console.log( req.params.id);
  const data = tours.find((el: Data) => el.id === +req.params.id);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data,
  });
};
export const updateTour = (req: Request, res: Response) => {
  // curl -i -d '{ "username": "bobby" }' -X PATCH http://localhost:8080/api/v1/tours/9 -H 'content-type:application/json'
  const id = +req.params.id;
  const dataIndex = tours.findIndex((el: Data) => el.id === id);
  const [data] = tours.splice(dataIndex, 1);
  const newData = { ...data, ...req.body };
  tours.splice(dataIndex, 0, newData);
  fs.writeFile(
    process.cwd() + '/dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      if (err) {
        console.log(err);
        res.status(400).send('Error');
        return;
      }
      res.status(200).json({
        status: 'success',
        results: tours.length,
        data: 'Thank you!',
      });
    }
  );
};
export const deleteTour = (req: Request, res: Response) => {
  // curl -i -X DELETE http://localhost:8080/api/v1/tours/9
  const id = +req.params.id;
  const dataId = tours.findIndex((el: Data) => el.id === id);
  tours.splice(dataId, 1);
  fs.writeFile(
    process.cwd() + '/dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      if (err) {
        console.log(err);
        res.status(400).json({
          status: 'error',
          results: tours.length,
          data: 'Could not delete tour.',
        });
        return;
      }
      res.status(204).json({
        status: 'success',
        results: tours.length,
        data: `Tour ${id} was deleted.`,
      });
    }
  );
};
