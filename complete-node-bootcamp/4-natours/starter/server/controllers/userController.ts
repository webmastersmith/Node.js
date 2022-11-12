import { Request, Response, NextFunction } from 'express';
import { User } from '../model/UserSchema';
import catchAsync from '../utils/catchAsyncError';
// import ApiFeatures from '../utils/ApiFeatures';
// import { Document } from 'mongoose';
// import ExpressError from '../utils/Error_Handling';
import {
  factoryDeleteOne,
  factoryGetAll,
  factoryUpdateOne,
  factoryGetOneById,
} from '../utils/factories';

// User Handlers

// custom middleware to updateUser
export const sanitizeUserInput = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    type DataType = {
      name?: string;
      email?: string;
    };
    const { name, email } = req.body;
    const data: DataType = {};
    if (name) data.name = name;
    if (email) data.email = email;
    req.body = data;
    next();
  }
);
export const updateUser = factoryUpdateOne(User);
export const deleteUser = factoryDeleteOne(User);
export const getAllUsers = factoryGetAll(User);
export const getUserById = factoryGetOneById(User);
