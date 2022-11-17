import catchAsync from '../utils/catchAsyncError';
import { Tour } from '../model/TourSchema';
import ExpressError from '../utils/Error_Handling';

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

  res.status(200).render('tour', {
    title: '',
    tour,
  });
});

// login page
export const getLogin = catchAsync(400, async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});
