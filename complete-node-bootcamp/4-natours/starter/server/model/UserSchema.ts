import { Schema, model } from 'mongoose';
import validator from 'validator';

const userSchema = new Schema({
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
  password: {
    type: String,
    required: [true, 'Password is required.'],
    // unique: true,
    trim: true,
    maxLength: [40, 'Password cannot be over 40 characters.'],
    minLength: [8, 'Password cannot be less than 10 characters.'],
    validate: {
      validator: validator.isStrongPassword,
      message: (props: { value: string }) =>
        `Password requirements: minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1.`,
    },
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password is required.'],
    // unique: true,
    trim: true,
    maxLength: [40, 'Password cannot be over 40 characters.'],
    minLength: [8, 'Password cannot be less than 10 characters.'],
    validate: {
      validator: validator.isStrongPassword,
      message: (props: { value: string }) =>
        `Password requirements: minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1.`,
    },
  },
});

export const User = model('User', userSchema);
