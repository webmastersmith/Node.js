import express from 'express';
import { getOverview, getTour, getLogin } from '../controllers/viewController';
import { login, protect } from '../controllers/authController';

// Website Views
const router = express.Router();

router.route('/').get(getOverview);
router.route('/tour/:tourName').get(protect, getTour);
router.route('/login').get(getLogin).post(login);

export default router;
