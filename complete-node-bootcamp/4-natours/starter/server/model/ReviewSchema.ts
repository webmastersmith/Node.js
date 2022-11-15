import {
  Schema,
  model,
  Types,
  Model,
  QueryOptions,
  HydratedDocument,
  Query,
} from 'mongoose';
// import ExpressError from '../utils/Error_Handling';
import { Tour } from './TourSchema';
// import { UserType } from './UserSchema';
import { inspect } from 'node:util';

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
  calcAverageRatings(tourId: Types.ObjectId, doc: Model<any>): Promise<void>;
}
interface ReviewModel extends Model<ReviewType, {}, ReviewTypeMethods> {
  CAR(tourId: Types.ObjectId): Promise<string>;
}

const reviewSchema = new Schema<ReviewType, ReviewModel, ReviewTypeMethods>(
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

// ensure user can only review same tour once.
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

async function calcAvgRatings(
  tourId: string,
  doc: Model<ReviewType, ReviewTypeMethods>
) {
  // 'this' is the 'Model.
  const stats: { _id: Types.ObjectId; numTours: number; avgRating: number }[] =
    await doc.aggregate([
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
  console.log('stats', stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].numTours,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
}

reviewSchema.method('calcAverageRatings', calcAvgRatings);
reviewSchema.static('CAR', calcAvgRatings);

// update Tour review stats when review added.
reviewSchema.post('save', async function (doc, next) {
  await this.calcAverageRatings(
    doc.tour,
    this.constructor as Model<ReviewType, ReviewTypeMethods>
  );
  next();
});
// update Tour review stats when review modified.
reviewSchema.post(
  /^findOneAnd/,
  async function (
    doc: HydratedDocument<ReviewType, ReviewModel, ReviewTypeMethods>,
    next
  ) {
    await doc.calcAverageRatings(
      doc.tour._id,
      doc.constructor as Model<ReviewType, ReviewTypeMethods>
    );
    next();
  }
);

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
export const Review = model<ReviewType, ReviewModel>('Review', reviewSchema);
