import { Schema, model, QueryOptions, Types, Model } from 'mongoose';
import slugify from 'slugify';
import validator from 'validator';
import { UserType } from './UserSchema';

type locationType = {
  _id: Types.ObjectId;
  type: 'Point';
  coordinates: Types.Array<number>;
  address: string;
  description: string;
  day: number;
};
type guideType = { type: Types.ObjectId; ref: UserType };
type startLocationType = {
  type: 'Point';
  coordinates: Types.Array<number>;
  address: string;
  description: string;
};

export interface TourType {
  _id: Types.ObjectId;
  id: string;
  name: string;
  slug?: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount: number;
  summary: string;
  description: string;
  imageCover: string;
  images: Types.Array<string>;
  createdAt: Date;
  startDates: Types.Array<Date>;
  secretTour: boolean;
  startLocation: startLocationType;
  locations: Types.Array<locationType>;
  guides: Types.DocumentArray<guideType>;
}
// export interface TourTypeMethods extends Model<TourType> {
//   calcAverageRatings(): Promise<void>;
// }

const tourSchema = new Schema<TourType>(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      unique: true,
      trim: true,
      maxLength: [40, 'Tour name cannot be over 40 characters.'],
      minLength: [10, 'Tour name cannot be less than 10 characters.'],
      validate: {
        validator: function (val: string) {
          return validator.isAlphanumeric(val, 'en-US', { ignore: ' ' });
        },
        message: (props: { value: string }) =>
          `${props.value} can only contain numbers and letters.`,
      },
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Duration is required.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'MaxGroupSize is required.'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: '({VALUE}). Difficulty should be: (easy | medium | difficult)',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating should be greater than 0.9 '],
      max: [5, 'Rating should be less than 5.1 '],
      set: (val: number) => Math.round(val * 10 ** 1) / 10 ** 1,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price is required.'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        message: (props: { value: number }) =>
          `${props.value} has to be less than price.`,
        // 'this' is actually 'Tour' but don't have access to it yet.
        validator: function (this: TourType, value: number): boolean {
          // 'val' is the value passed into priceDiscount.
          // test if discount is less than price.
          const numVal = +value;
          if (typeof numVal === 'number') {
            return +numVal < this.price;
          }
          return false;
        },
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Summary is required.'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'ImageCover is required.'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: () => Date.now(),
    },
    startDates: {
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // array of numbers
      address: String,
      description: String,
    },
    locations: [
      // array tells mongoose to create an 'embedded Documents'
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// export type TourType = InferSchemaType<typeof tourSchema>;

tourSchema.virtual('durationWeeks').get(function () {
  if (this.duration) return this.duration / 7;
  return;
});
// this data will show up as 'null' unless you use 'populate({path: 'reviews'})' fn on the tourController.
tourSchema.virtual('reviews', {
  ref: 'Review', // Model name
  foreignField: 'tour', //look at the 'Review' model 'tour' field.
  localField: '_id', // if foreignField value match this _id field value, include in output.
});

tourSchema.index({ price: 1, ratingsAverage: -1 });
// if index describes geo spatial data, use '2dsphere'
tourSchema.index({ startLocation: '2dsphere' }); // earth like data points. 'sphere' shaped.

// mongoose middleware

// Model Methods

// DOCUMENT MIDDLEWARE
// only runs with a 'save' event. 'save()', 'create()', but not on 'insertMany()'.
tourSchema.pre('save', function (next) {
  // inject 'slug' into database.
  this.slug = slugify(this.name, { lower: true }); // 'this' points to current document.
  return next();
});
// populate any tour find query with 'guides'
tourSchema.pre(/^find/, function (next) {
  // 'this' points to current document.
  this.populate({ path: 'guides', select: 'name photo role' });
  return next();
});

// Create Embedded Document when adding tour.
// tourSchema.pre('save', async function (next) {
//   // 'this' points to current document.
//   // map user id's to find user and store user as embedded document in the Tour.
//   const guidePromise = this.guides.map((id) => User.findById(id));
//   this.guides = await Promise.all(guidePromise);
//   return next();
// });

// can have multiple middle ware.
// post middleware example
// tourSchema.post('save', function (doc, next) {
//   // access to the document
//   console.log(doc);
//   return next();
// });

// QUERY MIDDLEWARE -run functions before or after query is executed.
// will trigger on all 'find' queries. 'findOne'
tourSchema.pre(/^find/, function (this: QueryOptions, next) {
  // tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } }); // filters all the 'true' secret tours.
  return next();
});

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   // 'this' is the aggregate object
//   // remove all secret tours from aggregate function.
//   console.log('tourSchema aggregate this', this.pipeline());

//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   // console.log(inspect(this, { sorted: true, depth: null }));
//   next();
// });

export const Tour = model<TourType>('Tour', tourSchema);
