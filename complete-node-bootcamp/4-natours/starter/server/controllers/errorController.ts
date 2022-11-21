import { NextFunction, Request, Response } from 'express';
import ExpressError from '../utils/Error_Handling';
// import { Err} from 'mongodb';
import { MongooseError } from 'mongoose';

const expressError = (err: ExpressError, res: Response) => {
  // check if validation error
  if (err.originalError?.name === 'ValidationError') {
    console.log('ValidationError');

    const message = Object.values(
      err.originalError?.errors as typeof MongooseError
    )
      .map((obj) => obj?.message)
      .join(' ');

    return res.status(err.statusCode).json({
      status: err.status,
      message: message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : '',
      error: process.env.NODE_ENV === 'development' ? err : '',
    });
  }
  // normal error
  console.log('normal error');

  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message.replace(/^.*: /g, ''),
    stack: process.env.NODE_ENV === 'development' ? err.stack : '',
    error: process.env.NODE_ENV === 'development' ? err : '',
  });
};

export default (
  err: ExpressError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.originalUrl.startsWith('/api')) {
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
    } else {
      // catch anything not from express.
      console.log('GenericError');

      res.status(400).json({
        status: err.name,
        message: err.message,
        error: err,
      });
    }
  } else {
    // must be a webpage. render webpage error.
    if (err instanceof ExpressError) {
      res.status(err.statusCode || 500).render('error', {
        title: 'Something went wrong!',
        msg: err.msg,
      });
    } else {
      res.status(400).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    }
  }
};
