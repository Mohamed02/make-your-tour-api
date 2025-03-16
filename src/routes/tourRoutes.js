import {Router} from 'express';
import {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlans,
  getToursWithin,
  getDistancesFromPoint
} from '../controllers/tourController.js';
import { protect, restrictTo } from '../controllers/authController.js';
import reviewRoute from './reviewRoutes.js';
import { createReview } from '../controllers/reviewController.js';
import { UserRole } from '../constants.js';

const router = Router();
router.route('/')
  .get(getAllTours)
  .post(protect, restrictTo([UserRole.ADMIN,UserRole.LEAD_GUIDE]), createTour);

router.route('/top-5-cheap').get(aliasTopTours,getAllTours);
router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plans/:year')
  .get(protect, restrictTo([UserRole.ADMIN, UserRole.GUIDE, UserRole.LEAD_GUIDE]),getMonthlyPlans);
  
router.route('/:id')
  .get(getTour)
  .patch(protect, restrictTo([UserRole.ADMIN,UserRole.LEAD_GUIDE]),updateTour)
  .delete(protect, restrictTo([UserRole.ADMIN,UserRole.LEAD_GUIDE]) ,deleteTour); 


router.get('/tours-within/:distance/centre/:latlong/unit/:unit',getToursWithin);
router.route('/distances/:latlong/unit/:unit').get(getDistancesFromPoint)
// Route for creating a review for a particlular tour
router.use('/:tourId/reviews', reviewRoute);

export default router;
