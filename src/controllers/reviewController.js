import Review from "../models/reviewModel.js"
import { catchAsync } from "../utils/catchAsync.js"
import handlerfactory from "./handlerFactory.js";
export const setTourAndUser =(req,res,next)=>{
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
}
export const createReview = handlerfactory.createOne(Review);
export const getReview = handlerfactory.getOne(Review);
export const getAllReviews = handlerfactory.getAll(Review);
export const deleteReview = handlerfactory.deleteOne(Review);
export const updateReview = handlerfactory.updateOne(Review);