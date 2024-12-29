import { Router } from "express";
import { createReview, deleteReview, getAllReviews, getReview, setTourAndUser, updateReview } from "../controllers/reviewController.js";
import { protect, restrictTo } from "../controllers/authController.js";

const router = Router({mergeParams: true});
router.use(protect);

router.route('/')
    .get(getAllReviews)
    .post(protect,restrictTo('user'),setTourAndUser,createReview);

router.route('/:id')
    .get(getReview).delete( restrictTo('user', 'admin'), deleteReview)
    .patch( restrictTo('user', 'admin'), updateReview);
export default router;

