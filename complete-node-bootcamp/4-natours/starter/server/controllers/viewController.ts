import catchAsync from '../utils/catchAsyncError';
import { Tour } from '../model/TourSchema';
import ExpressError from '../utils/Error_Handling';
// import ApiFeatures from '../utils/ApiFeatures';
// import { Document } from 'mongoose';

export const getOverview = catchAsync(400, async (req, res, next) => {
  const tours = await Tour.find({});
  if (!tours) return next(new ExpressError(400, 'Natours tours not found'));

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

export const getTour = catchAsync(400, async (req, res, next) => {
  const { tourName } = req.params;
  if (!tourName) return next(new ExpressError(400, 'TourName not found'));
  const tour = await Tour.findOne({ slug: tourName }).populate({
    path: 'reviews',
  });
  if (!tour) return next(new ExpressError(400, 'Natours Tour not found'));

  console.log({ tour });
  // @ts-ignore
  console.log({ reviews: tour.reviews });

  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
    tour,
  });
});
