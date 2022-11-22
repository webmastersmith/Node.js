import { Request, Response, NextFunction } from 'express';
import { User, UserType } from '../model/UserSchema';
import catchAsync from '../utils/catchAsyncError';
import ExpressError from '../utils/Error_Handling';
// import ApiFeatures from '../utils/ApiFeatures';
// import { Document } from 'mongoose';
// import ExpressError from '../utils/Error_Handling';
import {
  factoryDeleteOne,
  factoryGetAll,
  factoryUpdateOne,
  factoryGetOneById,
} from '../utils/factories';
import sharp from 'sharp';
import multer from 'multer';

// // this is for handling images without sharp image processing.
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// keep in memory for sharp image processing.
const multerStorage = multer.memoryStorage();
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('You can only upload images.'));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
export const uploadSinglePhoto = upload.single('photo');

// custom middleware to updateUser
export const sanitizeUserInput = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    type DataType = {
      name?: string;
      email?: string;
      photo?: string;
    };
    const { name, email } = req.body;
    const data: DataType = {};
    if (name) data.name = name;
    if (email) data.email = email;
    req.body = data;
    next();
  }
);

// middleware resize photo
export const resizePhoto = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();
    // console.log('fileObj', req.file);
    const filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    req.file.filename = filename;
    sharp(req.file?.buffer)
      .resize(100, 100)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${filename}`);

    next();
  }
);

export const updateMe = catchAsync(400, async (req, res, next) => {
  const { user } = req;
  // console.log({ body: req.body, photo: req.file });
  if (req.file) req.body.photo = req.file?.filename;

  // input has been sanitized.
  const userQuery = await User.findByIdAndUpdate(user.id, req.body, {
    returnDocument: 'after',
  });
  if (!userQuery)
    next(new ExpressError(403, 'Please login to get your profile'));
  const { name, email } = userQuery as UserType;
  res.status(200).json({
    status: 'success',
    data: { name, email },
  });
});
export const getMe = catchAsync(400, async (req, res, next) => {
  const { user } = req;
  if (!user) next(new ExpressError(403, 'Please login to get your profile'));
  res.status(200).json({
    status: 'success',
    data: user,
  });
});
export const updateUser = factoryUpdateOne(User);
export const deleteUser = factoryDeleteOne(User);
export const getAllUsers = factoryGetAll(User);
export const getUserById = factoryGetOneById(User);
