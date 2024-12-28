import mongoose from "mongoose";
import UserModel from "./userModel.js";
import TourModel from "./tourModel.js";

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: ['true', 'Review cannot be empty'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: ['true', 'Rating Cannot be empty']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour'
    }
});
reviewSchema.pre(/^find/,function(next){
    this.populate({
        path: 'user',
        select: 'name'
    });
    next();
});
const ReviewModel = mongoose.model('Review', reviewSchema);
export default ReviewModel