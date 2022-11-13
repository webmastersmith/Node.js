import express from 'express';
import {
  createTour,
  deleteTour,
  getAllTours,
  getTourById,
  updateTour,
  aliasTopTours,
  getTourStats,
  monthlyTourPlan,
  sanitizeTourInput,
} from '../controllers/tourController';
import { protect, approvedRoles } from '../controllers/authController';
import reviewRouter from '../views/reviewRoutes';

const router = express.Router();
router.use('/:tourId/reviews', reviewRouter); // when you see this route, hand off to reviewRouter.

// add new route with custom logic built in.
router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router.route('/stats').get(getTourStats);
router
  .route('/plan/:year')
  .get(protect, approvedRoles('admin', 'lead-guide'), monthlyTourPlan);

router
  .route('/')
  .get(getAllTours)
  .post(
    protect,
    approvedRoles('admin', 'lead-guide'),
    sanitizeTourInput,
    createTour
  );

// router.param('id', checkId);
router
  .route('/:id')
  .get(getTourById)
  .patch(
    protect,
    approvedRoles('admin', 'lead-guide'),
    sanitizeTourInput,
    updateTour
  )
  .delete(protect, approvedRoles('admin', 'lead-guide'), deleteTour);

export default router;
