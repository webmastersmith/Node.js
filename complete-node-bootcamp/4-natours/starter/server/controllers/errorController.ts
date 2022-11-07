import { NextFunction, Request, Response } from 'express';
import ExpressError from '../utils/Error_Handling';
// import { MongooseError } from 'mongoose';
// import { MongoError } from 'mongodb';

const expressError = (err: ExpressError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message.replace(/^.*: /g, ''),
    stack: process.env.NODE_ENV === 'development' ? err.stack : '',
    error: process.env.NODE_ENV === 'development' ? err : '',
  });
};

// const mongooseError = (err: MongooseError, res: Response) => {
//   // check for cast error
//   res.status(400).json({
//     status: 'mongoose error',
//     message: err.message,
//     stack: process.env.NODE_ENV === 'development' ? err.stack : '',
//     error: process.env.NODE_ENV === 'development' ? err : '',
//   });
// };
// const mongoError = (err: MongoError, res: Response) => {
//   res.status(400).json({
//     status: 'mongo error',
//     message: err.message,
//     stack: process.env.NODE_ENV === 'development' ? err.stack : '',
//     error: process.env.NODE_ENV === 'development' ? err : '',
//   });
// };

export default (
  err: ExpressError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ExpressError) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.message = err.message || 'unknown error';
    // this logs the stack trace.
    // console.log(err.stack);
  }

  if (err instanceof ExpressError) {
    console.log('ExpressError');
    expressError(err, res);
  }
  // if (err instanceof MongooseError) {
  //   console.log('MongooseError');
  //   mongooseError(err, res);
  // }
  // if (err instanceof MongoError) {
  //   console.log('MongoError');
  //   mongoError(err, res);
  // }
  else {
    // catch anything not from express.
    console.log('GenericError');

    res.status(400).json({
      status: err.name,
      message: err.message,
      error: err,
    });
  }
};
