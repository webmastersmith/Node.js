import { Request, Response, NextFunction } from 'express';
import { User, UserType } from '../model/UserSchema';
import catchAsync from '../utils/catchAsyncError';
import ExpressError from '../utils/Error_Handling';
import sharp from 'sharp';
import multer from 'multer';
import {
  factoryDeleteOne,
  factoryGetAll,
  factoryUpdateOne,
  factoryGetOneById,
} from '../utils/factories';
import fs from 'fs';

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
// only images allowed.
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // console.log('multer req', req);

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
    };
    console.log('sanitizeInput req.body', req.body);
    // console.log('sanitizeInput file before', req.file?.buffer);
    const { name, email } = req.body;
    const data: DataType = Object.create(null);
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
    // req.file is added by multer if photo is passed in 'multipart form data'.
    if (!req.file) return next();
    const filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    // filename is missing from req because file is kept in memory, so add 'filename' to req for the 'updateMe' fn.
    req.file.filename = filename;
    await sharp(req.file?.buffer)
      .resize(100, 100)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${filename}`);

    next();
  }
);

export const updateMe = catchAsync(400, async (req, res, next) => {
  // user is added to req from 'protect' fn.
  const { user } = req;
  // multer adds the body object from multipart form data. body properties will not exist until multer processes multipart-form data.
  // the photo has been written to disk and the filename is all that is needed.
  if (req.file) req.body.photo = req.file?.filename;

  console.log('updateMe req.body', req.body);
  // input has been sanitized.
  const userQuery = await User.findByIdAndUpdate(user.id, req.body, {
    returnDocument: 'after',
  });
  if (!userQuery)
    next(new ExpressError(403, 'Please login to get your profile'));
  const { name, email } = userQuery as UserType;
  // all is well delete old photo
  if (req.body.photo)
    fs.unlink(`${process.cwd()}/public/img/users/${user.photo}`, (err) => {
      if (err) throw err;
      console.log('Deleted image ' + user.photo);
    });
  res.status(200).json({
    status: 'success',
    data: { name, email },
  });
});

// get user
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
