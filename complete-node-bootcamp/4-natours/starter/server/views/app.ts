import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import tourRouter from './tourRoutes';
import userRouter from './userRoutes';
import reviewRouter from './reviewRoutes';
import ExpressError from '../utils/Error_Handling';
import MainErrorHandler from '../controllers/errorController';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware
app.use(helmet());
// Apply the rate limiting middleware to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter);
// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Data Sanitize nosQL query injection
app.use(
  mongoSanitize({
    replaceWith: '_',
  })
);
// Data Sanitize XSS
app.use(xss());
// Parameter Pollution
app.use(hpp());

// static content
app.use(express.static(`${process.cwd()}/public`));

// cookies
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// custom middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  return next();
});

// ROUTES
// Tours
app.use('/api/v1/tours', tourRouter);
// Users
app.use('/api/v1/users', userRouter);
// reviews
app.use('/api/v1/reviews', reviewRouter);

// all unhandled routes -if placed at top of list, would always match route.
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  // if something passed into next(), express automatically knows it's an error.
  next(new ExpressError(404, `Cannot find ${req.originalUrl}`));
});

// error handling middleware
app.use(MainErrorHandler);

export default app;
