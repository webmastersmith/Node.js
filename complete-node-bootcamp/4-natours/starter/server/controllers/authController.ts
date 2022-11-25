import {
  User,
  hashPassword,
  UserType,
  UserTypeMethods,
} from '../model/UserSchema';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsyncError';
import 'dotenv/config';
import { createEncryptedToken, isValidToken } from '../utils/JWT';
import Email from '../utils/email';
import ExpressError from '../utils/Error_Handling';
import { Document, Types } from 'mongoose';

// import ApiFeatures from '../utils/ApiFeatures';

type CookieType = {
  expires: Date;
  httpOnly: boolean;
  secure?: boolean;
};
export const createCookie = async (token: string, res: Response) => {
  const cookieObject: CookieType = {
    // 2 hours = hours,hour,minute,second
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
    httpOnly: true,
  };
  // if (process.env.NODE_ENV === 'production') cookieObject.secure = true;

  res.cookie('jwt', token, cookieObject);
  return;
};

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
    if (!token) return next(new ExpressError(400, 'Invalid User Creation.'));

    await createCookie(token, res);
    await new Email(
      { name, email },
      `${req.protocol}://${req.get('host')}/me`
    ).sendWelcome();

    res.status(201).json({
      status: 'success',
      token,
      results: await User.count(),
      data: { user },
    });
  }
);

export const login = catchAsync(400, async (req, res, next) => {
  console.log('login reqBody', req.body);
  // breakdown body so injection is harder.
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ExpressError(400, 'Please provide email and password.'));
  }

  // returns user or null.
  const user = await User.findOne({ email }).select('+password').exec();
  console.log('login', { user });

  if (!user || !(await user.isValidPassword(password))) {
    return next(new ExpressError(401, 'Email or Password Problem.'));
  }
  // user is valid
  console.log('valid user');
  const token = await createEncryptedToken(user, '2h');
  if (!token) return next(new ExpressError(400, 'Problem creating token'));
  // does not return anything, attaches cookie to response.
  await createCookie(token, res);

  res.status(201).json({
    status: 'success',
    token,
    results: '*',
    data: { user },
  });
});

export const logout = catchAsync(400, async (req, res, next) => {
  const cookieObject: CookieType = {
    // 2 hours = hours,hour,minute,second
    expires: new Date(),
    httpOnly: true,
  };

  res.cookie('jwt', 'loggedout', cookieObject);

  res.status(200).redirect('/');
});

export const protect = catchAsync(400, async (req, res, next) => {
  // console.log('reqBody', req.body);
  // 1. Get token & email
  // console.log('protect cookie', req.cookies);
  // 'Bearer TOKEN...', split to remove 'Bearer' from token.
  let token = '';
  // header token or cookie token?
  if (req.headers.authorization) {
    token = req.headers?.authorization?.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt.replace('jwt=', '');
  }

  // 2. isTokenValid
  if (!token)
    return next(new ExpressError(400, 'Token Invalid. Please login again.'));
  // 3. does user exist?
  if (Array.isArray(token))
    return next(new ExpressError(400, 'Token is Array'));
  // returns user or null
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
  res.locals.user = user;
  return next();
});

// Only for rendered pages. No Errors. Add user to pug locals.
export const isLoggedIn = catchAsync(400, async (req, res, next) => {
  // console.log('reqBody', req.body);
  // 1. Get token
  // 'Bearer TOKEN...', split to remove 'Bearer' from token.
  let token = '';
  // cookie token
  if (req.cookies.jwt) {
    token = req.cookies.jwt.replace('jwt=', '');
  }

  // 2. isTokenValid
  if (!token) return next();
  // 3. does user exist?
  if (Array.isArray(token)) return next();
  // returns user or null
  const user = await isValidToken(token);
  if (!user) return next();

  // 4. Did user change pw after token was issued?
  if (!(await user.hasPasswordChangedAfterToken(user?.iat || Infinity)))
    return next();

  // add user to pug locales
  res.locals.user = user;
  next();
});

export const approvedRoles = (...roles: string[]) =>
  catchAsync(403, async (req: Request, res: Response, next: NextFunction) => {
    // user is already attached to req object.
    const { user } = req;
    if (!user)
      return next(new ExpressError(403, 'Approved Roles need a user.'));
    // console.log('approvedRoles userRole', user.role, roles);
    if (roles.includes(req.user.role)) return next();
    return next(new ExpressError(403, 'Not Authorized.'));
  });

export const forgotPassword = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get User based on posted Email.
    const { email } = req.body;
    if (!email)
      return next(new ExpressError(404, 'Please provide a valid email.'));
    // returns user or null
    const user = await User.findOne({ email });
    if (!user) return next(new ExpressError(404, 'Email not found.'));

    // 2. Generate the random reset token
    const resetToken = await user.createPasswordResetToken();

    // document is modified, but not saved to database.
    // returns user or null
    await user.save({ validateModifiedOnly: true });
    // console.log({ userSaveReturn });

    // 3. Send token as email to user.
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forget your password? Click this link to reset it.\n${resetUrl}`;
    // send email

    try {
      await new Email(
        { email: user.email, name: user.name },
        resetUrl
      ).sendPasswordReset();

      // 4. return success response.
      res.status(201).json({
        status: 'success',
        resetToken,
        results: 'reset token has been sent to your email.',
        data: { resetUrl },
      });
    } catch (e) {
      // email failed, void the token and expiration time.
      user.passwordResetToken = undefined;
      const d = new Date();
      // reset password date 10 days back, to void it.
      user.passwordResetTokenExpires = new Date(d.setDate(d.getDate() - 10));
      await user.save({ validateModifiedOnly: true });
      res.status(500).json({
        status: 'fail',
        results: 'Error sending email. Try again later.',
        data: { resetUrl },
      });
    }
  }
);

export const resetPassword = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    const resetTokenPlusSalt = req.params?.token;

    if (!resetTokenPlusSalt)
      return next(
        new ExpressError(
          400,
          'Something wrong with password reset token, please start over.'
        )
      );
    // 1. get user from reset token
    // resetToken = token + salt.
    const resetToken = resetTokenPlusSalt.slice(0, -24);
    const salt = resetTokenPlusSalt.slice(-24);
    const encryptedToken = await hashPassword(resetToken, salt);

    // 2. get user from token and check if token expired.
    const user = await User.findOne({
      passwordResetToken: encryptedToken,
      passwordResetTokenExpires: { $gte: Date.now() },
    });

    if (!user)
      return next(
        new ExpressError(404, 'Password Reset Token expired or User not found.')
      );

    console.log('resetPassword', {
      user,
      resetTokenPlusSalt,
      salt,
      resetToken,
      encryptedToken,
    });

    // reset password, passwordChangedAt
    user.password = req.body?.password;
    user.passwordChangedAt = new Date();
    // Void passwordResetToken, passwordResetTokenExpires
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = new Date(
      user.passwordResetTokenExpires.setDate(
        user.passwordResetTokenExpires.getDate() - 10
      )
    );
    await user.save({ validateModifiedOnly: true });
    // give them a valid token.
    const token = await createEncryptedToken(user, '2h');

    res.status(200).json({
      status: 'success',
      token,
      results: 'Password has been reset.',
      data: { user },
    });
  }
);
export const updatePassword = catchAsync(400, async (req, res, next) => {
  // 1. get password
  const { password, newPassword } = req.body;
  console.log('updatePassword', { password, newPassword });
  if (!password || !newPassword)
    return next(
      new ExpressError(401, 'Please provide valid password or new password.')
    );

  // 2. get user from req, added from 'protect' function.
  // prettier-ignore
  const user = req.user as (Document<unknown, any, UserType> & UserType & Required<{ _id: Types.ObjectId;}> & UserTypeMethods)
  | null
  // 3. verify password correct.
  if (!user || !(await user.isValidPassword(password)))
    return next(
      new ExpressError(401, 'To update password, please login again.')
    );

  // 4. valid user, now change password.
  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: 'success',
    results: 'Password has been changed.',
    data: { user },
  });
});

// Me routes
export const onlyMe = catchAsync(
  400,
  async (req: Request, res: Response, next: NextFunction) => {
    req.params.id = req.user.id;
    next();
  }
);
