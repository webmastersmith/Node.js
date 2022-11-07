import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import tourRouter from './tours';
import userRouter from './users';
import ExpressError from '../utils/Error_Handling';
import MainErrorHandler from '../controllers/errorController';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${process.cwd()}/public`));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// custom middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  return next();
});

// ROUTES
// Tours
app.use('/api/v1/tours', tourRouter);
// Users
app.use('/api/v1/users', userRouter);

// all unhandled routes -if placed at top of list, would always match route.
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  // if something passed into next(), express automatically knows it's an error.
  next(new ExpressError(404, `Cannot find ${req.originalUrl}`));
});

// error handling middleware
app.use(MainErrorHandler);

export default app;
