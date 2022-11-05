import { Schema, model, QueryOptions } from 'mongoose';
import slugify from 'slugify';
import validator from 'validator';
// import { inspect } from 'node:util';

const tourSchema = new Schema(
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
        message: (props: { value: string }) =>
          `${props.value} has to be less than price.`,
        // 'this' is actually 'Tour' but don't have access to it yet.
        validator: function (this: { price: number }, val: string) {
          // 'val' is the value passed into priceDiscount.
          // test if discount is less than price.
          const numVal = +val;
          if (typeof numVal === 'number') {
            return +val < this.price;
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
      default: Date.now(),
    },
    startDates: {
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// mongoose middleware

// DOCUMENT MIDDLEWARE
// only runs with a 'save' event. 'save()', 'create()', but not on 'insertMany()'.
tourSchema.pre('save', function (next) {
  // inject 'slug' into database.
  this.slug = slugify(this.name, { lower: true }); // 'this' points to current document.
  return next();
});
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
tourSchema.pre('aggregate', function (this, next) {
  // 'this' is the aggregate object
  // remove all secret tours from aggregate function.
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  // console.log(inspect(this, { sorted: true, depth: null }));
  return next();
});

export const Tour = model('Tour', tourSchema);
