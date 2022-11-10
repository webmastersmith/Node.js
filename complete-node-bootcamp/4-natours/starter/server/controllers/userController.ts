import { Request, Response, NextFunction } from 'express';
import { User, UserType } from '../model/UserSchema';
import catchAsync from '../utils/catchAsyncError';
import ApiFeatures from '../utils/ApiFeatures';
import { Document } from 'mongoose';
import ExpressError from '../utils/Error_Handling';

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
export const getUser = catchAsync( 400, async (req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    status: 'error',
    data: 'This route is under construction.',
  });
});

// prettier-ignore
export const updateUser = catchAsync( 400, async (req: Request, res: Response, next: NextFunction) => {
  console.log('updateUser');
  const {name, email} = req.body;
  // prettier-ignore
  const user = req.user as Document<unknown, any, UserType> & UserType & Required<{ _id: string; }>;

  if (name)  user.name = name;
  if (email) user.email = email;
  await user.save({ validateModifiedOnly: true });

  
  res.status(200).json({
    status: 'success',
    data: {user},
  });
});

// prettier-ignore
export const deleteUser = catchAsync( 400, async (req: Request, res: Response, next: NextFunction) => {
  // prettier-ignore
  await User.findByIdAndUpdate(req.user.id, {active: false});

  res.status(204).json({
    status: 'success',
    data: null
  });
});
