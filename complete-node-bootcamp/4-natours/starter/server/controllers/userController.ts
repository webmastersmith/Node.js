import { Request, Response } from 'express';
import { User } from '../model/UserSchema';
import catchAsync from '../utils/catchAsyncError';

// User Handlers
// prettier-ignore
export const getAllUsers = catchAsync( 400, async (req: Request, res: Response) => {
  // curl -i -X GET http://127.0.0.1:8080/api/v1/users
  res.status(500).json({
    status: 'error',
    data: 'This route is under construction.',
  });
});

// prettier-ignore
export const createUser = catchAsync( 400, async (req: Request, res: Response) => {
  console.log('reqBody', req.body);
  // returns user throws error.
  const user = await User.create(req.body);
  console.log('createUser', user);

  res.status(201).json({
    status: 'success',
    results: await User.count(),
    data: `${req.body?.name ?? 'User'} successfully added.`,
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
