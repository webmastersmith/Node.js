import catchAsync from './catchAsyncError';
import 'dotenv/config';
import ExpressError from './Error_Handling';
import { Document, Model } from 'mongoose';
import ApiFeatures from './ApiFeatures';
import { UserType } from '../model/UserSchema';

// delete
export const factoryDeleteOne = (Model: Model<any>) =>
  catchAsync(400, async (req, res, next) => {
    const { id } = req.params;
    if (!id) return next(new ExpressError(400, 'No id found.'));
    // user is attached to req object from the 'protect' middleware
    // prettier-ignore
    const user = req.user as (Document<unknown, any, UserType> & UserType & Required<{ _id: string }>)|null;
    if (!user) return next(new ExpressError(401, 'Please login to delete.'));

    // find document
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) return next(new ExpressError(400, 'No document found.'));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const factoryGetAll = (Model: Model<any>) =>
  catchAsync(400, async (req, res, next) => {
    // this does not need error if found nothing, because nothing should be returned.
    const filter: any = {};
    if (req.params.tourId) filter.tour = req.params.tourId;
    if (req.params.reviewId) filter.user = req.params.reviewId;
    // console.log('factoryGetAll', { filter, tourId: req.params.tourId });

    const feature = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pageLimit();
    // console.log('factoryGetAll', feature);
    const docs = (await feature.query) as typeof Model[];

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { data: docs },
    });
  });

// prettier-ignore
export const factoryUpdateOne = (Model: Model<any>) => catchAsync( 400, async (req, res, next) => {
  // body should be sanitized with custom middleware.
  // patch review as user.
  if (req.params.reviewId) req.params.id = req.params.reviewId
  
  // console.log('factoryUpdateOne id', req.params.id);  
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  }).exec();
  if (!doc) return next(new ExpressError(404, 'No document found with that ID.'))  

  res.status(200).json({
    status: 'success',
    data: {data: doc},
  });
});

export const factoryCreateOne = (Model: Model<any>) =>
  catchAsync(400, async (req, res, next) => {
    // body should be sanitized with custom middleware.
    const doc = await Model.create(req.body);
    if (!doc) return next(new ExpressError(404, 'Document not created!.'));

    res.status(201).json({
      status: 'success',
      data: { data: doc },
    });
  });

export const factoryGetOneById = (Model: Model<any>, populate?: string) =>
  catchAsync(400, async (req, res, next) => {
    // body should be sanitized with custom middleware.
    const { id } = req.params;
    if (!id) return next(new ExpressError(400, 'Please input the id.'));
    const query = Model.findById(id);
    if (populate) query.populate(populate);
    const doc = await query.exec();
    if (!doc)
      return next(new ExpressError(404, 'No document found with that ID.'));

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });
