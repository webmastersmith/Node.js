import { User } from '../model/UserSchema';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsyncError';
import 'dotenv/config';
import JWT from 'jsonwebtoken';
import { encrypt, decrypt } from '../utils/JWT';

// import ApiFeatures from '../utils/ApiFeatures';

// prettier-ignore
export const signup = catchAsync(400, async (req: Request, res: Response, next: NextFunction) => {
  // console.log('reqBody', req.body);
  // breakdown body so injection is harder.
  const {name, email, password} = req.body;
  
  // returns user or throws ValidationError.
  const user = await User.create({name, email, password});

  const JWT_KEY = process.env.JWT_SECRET
  let token;
  if (JWT_KEY) {
    const KEY = Buffer.from(JWT_KEY, 'hex')
    token = JWT.sign({id: user._id}, KEY, {expiresIn: '2h'})
    console.log('token=', token)
    if (user.salt) {
      const encryptedToken = await encrypt(token, Buffer.from(user.salt, 'hex'), KEY)
      console.log('encryptedToken=', encryptedToken);
      const decryptedToken = await decrypt(encryptedToken, Buffer.from(user.salt, 'hex'), KEY)
      console.log('decryptedToken=', decryptedToken);
      console.log(token === decryptedToken);
    }
  }

  res.status(201).json({
    status: 'success',
    token,
    results: await User.count(),
    data: {user},
  });
});
