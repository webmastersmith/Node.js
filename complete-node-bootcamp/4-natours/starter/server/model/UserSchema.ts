import { Schema, model } from 'mongoose';
import validator from 'validator';
// import { NextFunction } from 'express';
import crypto from 'crypto';

export interface UserType {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  password: string;
  passwordChangedAt: Date;
  // passwordConfirm: string;
  salt: string;
  // setPassword: (pw: string) => Promise<void>;
  isValidPassword: (password: string) => Promise<boolean>;
  hasPasswordChangedAfterToken: (jwtTimestamp: number) => Promise<boolean>;
  iat?: number;
  exp?: number;
}

const userSchema = new Schema<UserType>({
  name: {
    type: String,
    required: [true, 'Name is required.'],
    unique: true,
    trim: true,
    maxLength: [40, 'User name cannot be over 40 characters.'],
    minLength: [3, 'User name cannot be less than 3 characters.'],
    validate: {
      validator: function (val: string) {
        // 'this' is the User object
        // console.log('this', this);

        return validator.isAlphanumeric(val, 'en-US', { ignore: ' ' });
      },
      message: (props: { value: string }) =>
        `${props.value} can only contain numbers and letters.`,
    },
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    maxLength: [40, 'Email cannot be over 40 characters.'],
    minLength: [3, 'Valid email cannot be less than 3 characters.'],
    validate: {
      validator: validator.isEmail,
      message: (props: { value: string }) =>
        `${props.value} is not a valid email.`,
    },
  },
  photo: {
    type: String,
    // required: [true, 'Email is required.'],
    // unique: true,
    maxLength: [40, 'Photo name cannot be over 40 characters.'],
    minLength: [3, 'Photo name cannot be less than 3 characters.'],
    // validate: {
    //   validator: validator.isEmail,
    //   message: (props: { value: string }) =>
    //     `${props.value} is not a valid email.`,
    // },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    // unique: true,
    trim: true,
    select: false,
    maxLength: [40, 'Password cannot be over 40 characters.'],
    minLength: [8, 'Password cannot be less than 10 characters.'],
    validate: {
      validator: validator.isStrongPassword,
      message: `Password requirements: minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1.`,
    },
  },
  passwordChangedAt: Date,
  // this should be on the client.
  // passwordConfirm: {
  //   type: String,
  //   required: [true, 'Password is required.'],
  //   // unique: true,
  //   trim: true,
  //   maxLength: [40, 'Password cannot be over 40 characters.'],
  //   minLength: [8, 'Password cannot be less than 10 characters.'],
  //   validate: {
  //     validator: function (this: UserType, val: string) {
  //       return val === this.password;
  //     },
  //     message: `Passwords must match.`,
  //   },
  // },
  salt: String,
});

// https://mongoosejs.com/docs/api/schema.html#schema_Schema-pre

// userSchema.methods.setPassword = async function (
//   password: string
// ): Promise<void> {
//   const { salt, hash } = await setPassword(password);
//   this.salt = salt;
//   this.hash = hash;
// };
async function setPassword(
  password: string
): Promise<{ salt: string; hash: string }> {
  // Creating a unique salt for a particular user
  const salt = crypto.randomBytes(16).toString('hex');
  // Hashing user's salt and password with 1000 iterations,
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return { salt, hash };
}
// check if password was changed after jwt-token was created.
userSchema.methods.hasPasswordChangedAfterToken = async function (
  jwtTimestamp: number
): Promise<boolean> {
  // true is good false bad.
  if (!this.passwordChangedAt) return false;
  // jwtTimestamp is in seconds, passwordChanged is in milliseconds.
  const changedTime = Math.floor(
    (this.passwordChangedAt as Date).getTime() / 1000
  );
  console.log(jwtTimestamp, changedTime, jwtTimestamp - changedTime + 's');
  return jwtTimestamp >= changedTime;
};
// Method to check the entered password is correct or not
userSchema.methods.isValidPassword = async function (
  password: string
): Promise<boolean> {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);

  return this.password === hash;
};

// check for password change
userSchema.pre('save', async function (next) {
  // if password not modified, just return.
  if (!this.isModified('password')) return next();
  // password has been modified.
  const { salt, hash } = await setPassword(this.password);
  this.salt = salt;
  this.password = hash;
  return next();
});

export const User = model('User', userSchema);
