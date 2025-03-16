import { Router } from "express";
import { createReview, deleteReview, getAllReviews, getReview, setTourAndUser, updateReview } from "../controllers/reviewController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import { UserRole } from "../constants.js";

const router = Router({mergeParams: true});
router.use(protect);

router.route('/')
    .get(getAllReviews)
    .post(protect,restrictTo([UserRole.USER]),setTourAndUser,createReview);

router.route('/:id')
    .get(getReview).delete( restrictTo([UserRole.USER,UserRole.ADMIN]), deleteReview)
    .patch( restrictTo([UserRole.USER,UserRole.ADMIN]), updateReview);
export default router;

