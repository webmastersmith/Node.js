import mongoose, { Schema, model } from 'mongoose';
import { UserType } from './UserSchema';
import { Tour } from './TourSchema';

export interface ReviewType {
  _id: string;
  review: string;
  rating: number;
  createdAt: Date;
  tour: typeof Tour;
  user: UserType;
}

const reviewSchema = new Schema<ReviewType>(
  {
    review: {
      type: String,
      required: [true, 'Review is required.'],
      trim: true,
      maxLength: [300, 'User name cannot be over 300 characters.'],
      minLength: [10, 'User name cannot be less than 10 characters.'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required.'],
      trim: true,
      max: [5, 'Enter value 1 to 5 stars.'],
      min: [1, 'Enter value 1 to 5 stars.'],
    },
    createdAt: {
      type: Date,
      // prettier-ignore
      default: new Date,
    },
    tour: {
      type: mongoose.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a Tour.'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// perform function only on output results.
reviewSchema.virtual('yourMadeUpKeyName').get(function () {
  return this.rating + 10;
});

// // attach method
// reviewSchema.methods.hasPasswordChanged = async function (
//   jwtTimestamp: number
// ): Promise<boolean> {
//   return true;
// };
// // check for password change
// reviewSchema.pre('save', async function (next) {
//   // if password not modified, just return.
//   if (!this.isModified('password')) return next();
//   return next();
// });
// populate any tour find query with 'guides'
reviewSchema.pre(/^find/, function (next) {
  // 'this' points to current document.
  this.populate({ path: 'user', select: 'name photo' });
  this.populate({
    path: 'tour',
    select: 'name price guides',
  });
  return next();
});
export const Review = model('Review', reviewSchema);
