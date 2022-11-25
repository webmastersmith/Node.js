// import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import catchAsync from '../utils/catchAsyncError';
import ExpressError from '../utils/Error_Handling';
import { Tour } from '../model/TourSchema';
import Stripe from 'stripe';
import { Booking } from '../model/BookingSchema';

export const checkoutSession = catchAsync(404, async (req, res, next) => {
  const { tourId } = req.params;
  if (!tourId)
    return next(new ExpressError(400, 'Tour Id needed for bookings'));
  const { user } = req;
  if (!user)
    return next(new ExpressError(400, 'Must be valid user for bookings'));
  // 1) get current booked tour.
  const tour = await Tour.findById(tourId);
  if (!tour) return next(new ExpressError(400, 'Tour for bookings not found.'));
  // 2) create checkout session.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2022-11-15',
  });
  // 3) send checkout session to client.
  const session: Stripe.Checkout.Session =
    await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${
        tour.id
      }&user=${user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: tourId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: `${tour.summary}`,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            },
            unit_amount: tour.price * 100,
          },
        },
      ],
    });

  res.status(200).json({
    status: 'success',
    session,
  });
});

// booking route
export const createBookingCheckout = catchAsync(404, async (req, res, next) => {
  // This is temporary because UNSECURE.
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();

  console.log({ tour, user, price });
  await Booking.create({ tour, user, price });

  return res.redirect(`${req.originalUrl.split('?')[0]}`);
});
