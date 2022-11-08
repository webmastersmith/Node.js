import { Request, Response, NextFunction } from 'express';
import { User } from '../model/UserSchema';
import catchAsync from '../utils/catchAsyncError';
import ApiFeatures from '../utils/ApiFeatures';

// User Handlers
// prettier-ignore
export const getAllUsers = catchAsync( 400, async (req: Request, res: Response, next: NextFunction) => {
  // curl -i -X GET http://127.0.0.1:8080/api/v1/users
  const feature = new ApiFeatures(User, req.query)
    .filter()
    .sort()
    .fields()
    .pageLimit();
  const users = (await feature.query) as typeof User[];
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
  });
});

// prettier-ignore
export const getUser = catchAsync( 400, async (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    data: 'This route is under construction.',
  });
});

// prettier-ignore
export const updateUser = catchAsync( 400, async (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    data: 'This route is under construction.',
  });
});

// prettier-ignore
export const deleteUser = catchAsync( 400, async (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    data: 'This route is under construction.',
  });
});
