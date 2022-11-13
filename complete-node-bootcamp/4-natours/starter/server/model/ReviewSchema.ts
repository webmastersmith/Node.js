import { Schema, model, Types, Model } from 'mongoose';
import ExpressError from '../utils/Error_Handling';
import { Tour } from './TourSchema';
// import { UserType } from './UserSchema';

export interface ReviewType {
  _id: Types.ObjectId;
  id: string;
  review: string;
  rating: number;
  createdAt: Date;
  tour: Types.ObjectId;
  user: Types.ObjectId;
}
export interface ReviewTypeMethods extends Model<ReviewType> {
  calcAverageRatings(): Promise<void>;
}

const reviewSchema = new Schema<ReviewType, ReviewTypeMethods>(
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
      type: Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a Tour.'],
    },
    user: {
      type: Schema.Types.ObjectId,
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

reviewSchema.statics.calcAverageRatings = async function (tourId: string) {
  // 'this' is the 'Model.
  const stats: { _id: Types.ObjectId; numTours: number; avgRating: number }[] =
    await this.aggregate([
      {
        $match: { tour: tourId },
      },
      {
        $group: {
          _id: '$tour',
          numTours: { $count: {} },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);
  const tour = await Tour.findById(tourId);
  console.log('tour calcAverageRatings', tour);

  if (!tour) return new ExpressError(400, 'Tour not found.');
  tour.ratingsAverage = stats[0].avgRating;
  tour.ratingsQuantity = stats[0].numTours;
  await tour.save();
};

reviewSchema.post('save', async function (this: any) {
  // this is Document being saved.
  await this.constructor.calcAverageRatings(this.tour);
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
export const Review = model<ReviewType, ReviewTypeMethods>(
  'Review',
  reviewSchema
);
