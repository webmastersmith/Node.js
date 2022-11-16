import express from 'express';
import { getOverview, getTour } from '../controllers/viewController';

// Website Views
const router = express.Router();

router.route('/').get(getOverview);
router.route('/tour/:tourName').get(getTour);

export default router;
