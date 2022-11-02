import express from 'express';
import {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
  // checkId,
  // validateReqBody,
} from '../controllers/tourController';

const router = express.Router();

router.route('/').get(getAllTours).post(createTour);

// check if id valid before continue
// router.param('id', checkId);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;
