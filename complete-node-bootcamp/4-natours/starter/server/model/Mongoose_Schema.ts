import mongoose from 'mongoose';

export const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'Price is required.'],
  },
});

export const Tour = mongoose.model('Tour', tourSchema);
