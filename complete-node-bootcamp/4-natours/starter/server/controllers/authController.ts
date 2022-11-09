import { User } from '../model/UserSchema';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsyncError';
import 'dotenv/config';
import { createEncryptedToken, isValidToken } from '../utils/JWT';
import ExpressError from '../utils/Error_Handling';

// import ApiFeatures from '../utils/ApiFeatures';

export const signup = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log('reqBody', req.body);
    // destructure body so injection is harder.
    const { name, email, password } = req.body;

    // returns user or throws ValidationError.
    const user = await User.create({
      name,
      email,
      password,
      passwordChangedAt: new Date(),
    });

    const token = await createEncryptedToken(user, '2h');
    if (token) {
      res.status(201).json({
        status: 'success',
        token,
        results: await User.count(),
        data: { user },
      });
    } else {
      return next(new ExpressError(400, 'Invalid User Creation.'));
    }
  }
);

export const login = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log('reqBody', req.body);
    // breakdown body so injection is harder.
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ExpressError(400, 'Please provide email and password.'));
    }

    // returns user or null.
    const user = await User.findOne({ email }).select('+password').exec();
    console.log(user);

    if (!user || !(await user.isValidPassword(password))) {
      return next(new ExpressError(401, 'Email or Password Problem.'));
    }
    // user is valid
    console.log('valid user');
    const token = await createEncryptedToken(user, '2h');

    res.status(201).json({
      status: 'success',
      token,
      results: '*',
      data: { user },
    });
  }
);

export const protect = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log('reqBody', req.body);
    // 1. Get token & email
    const token = req.headers?.authorization?.split(' ')[1];
    // console.log('protect', token);

    // 2. isTokenValid
    if (!token) return next(new ExpressError(400, 'Token Invalid'));
    // 3. does user exist?
    if (Array.isArray(token))
      return next(new ExpressError(400, 'Token is Array'));
    const user = await isValidToken(token);
    if (!user) return next(new ExpressError(401, 'Please login again.'));
    // 4. Did user change pw after token was issued?

    // console.log('user protect', user);
    // console.log('user protect iat', user.iat);
    if (!(await user.hasPasswordChangedAfterToken(user?.iat || Infinity)))
      return next(
        new ExpressError(
          401,
          'Auth Token older than Password. Please login again.'
        )
      );
    // add user to middleware
    req.user = user;
    return next();
  }
);
export const approvedRoles = (...roles: string[]) =>
  catchAsync(403, async (req: Request, res: Response, next: NextFunction) => {
    // user is already attached to req object.

    if (req?.user?.role) {
      if (roles.includes(req.user.role)) return next();
    }
    return next(new ExpressError(403, 'Not Authorized.'));
  });
