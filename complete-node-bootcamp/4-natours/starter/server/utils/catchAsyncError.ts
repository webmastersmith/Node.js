import { Request, Response, NextFunction } from 'express';
import ExpressError from './Error_Handling';

export default (
  errorCode: number,
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return function (req: Request, res: Response, next: NextFunction) {
    fn(req, res, next).catch((e) => {
      next(new ExpressError(errorCode, e.message, e));
      // console.log(e.message);
    });
  };
};
