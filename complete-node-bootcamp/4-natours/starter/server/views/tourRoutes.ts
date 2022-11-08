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
  // checkId,
  // validateReqBody,
} from '../controllers/tourController';

const router = express.Router();

// add new route with custom logic built in.
router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router.route('/stats').get(getTourStats);
router.route('/plan/:year').get(monthlyTourPlan);

router.route('/').get(getAllTours).post(createTour);

// router.param('id', checkId);
router.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);

export default router;
