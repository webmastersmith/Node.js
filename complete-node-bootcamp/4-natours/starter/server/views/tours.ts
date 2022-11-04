import express from 'express';
import {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
  aliasTopTours,
  getTourStats,
  // checkId,
  // validateReqBody,
} from '../controllers/tourController';

const router = express.Router();

router.route('/').get(getAllTours).post(createTour);
// add new route with custom logic built in.
router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router.route('/stats').get(getTourStats);

// router.param('id', checkId);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;
