import { Schema, model, Types } from 'mongoose';

export interface BookingType {
  _id: Types.ObjectId;
  id: string;
  tour: Types.ObjectId;
  user: Types.ObjectId;
  price: number;
  createdAt: Date;
  paid: boolean;
}
const bookingSchema = new Schema<BookingType>({
  tour: {
    type: Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour.'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User.'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required.'],
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  // 'this' points to current document.
  this.populate({ path: 'user', select: 'name photo' });
  this.populate({
    path: 'tour',
    select: 'name price guides',
  });
  return next();
});

export const Booking = model<BookingType>('Booking', bookingSchema);
