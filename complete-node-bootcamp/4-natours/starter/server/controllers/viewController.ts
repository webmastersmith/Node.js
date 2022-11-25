import catchAsync from '../utils/catchAsyncError';
import { Tour } from '../model/TourSchema';
import ExpressError from '../utils/Error_Handling';
import { Booking } from '../model/BookingSchema';

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

export const getAccount = catchAsync(400, async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your Account',
    user: req.user,
  });
});

// login page
export const getLogin = catchAsync(400, async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

// protected show all your bookings
export const myTours = catchAsync(404, async (req, res, next) => {
  const { user } = req;
  if (!user) return next(new ExpressError(400, 'Login to see your tours'));

  // 1) get all bookings
  const bookings = await Booking.find({ user: user.id });
  if (!bookings) {
    res.status(200).json({
      status: 'success',
      data: 'No bookings found :-(',
    });
    return;
  }
  // console.log(bookings);

  // 2) get all tours matching bookings.
  const toursIds = bookings.map((booking) => booking.tour.id);
  const tours = await Tour.find({ _id: { $in: toursIds } });

  // console.log(tours);

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
