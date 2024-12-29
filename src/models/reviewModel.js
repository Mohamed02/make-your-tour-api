import mongoose from "mongoose";
import UserModel from "./userModel.js";
import TourModel from "./tourModel.js";
import { stat } from "fs";

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

/*
    The Below Index to ensure that combination of tour and user 
    are unique for a particular review- that is an user cannnot post more than one review
    for a particluar tour
*/
reviewSchema.index({tour:1, user:1}, {unique: true});

reviewSchema.pre(/^find/,function(next){
    this.populate({
        path: 'user',
        select: 'name'
    });
    next();
});
reviewSchema.statics.calcAverageRatings = async function(tourId){

   const stats = await this.aggregate([
    {$match: {tour:tourId}},
    {$group: {
        _id: '$tour',
        nRating: {$sum:1},
        averageRating: {$avg: '$rating'}
    }},
   ]);
   if(stats.length>0){
        const tour = await TourModel.findByIdAndUpdate(tourId, {
        ratingsAverage: stats[0].averageRating,
        ratingsQuantity: stats[0].nRating,
    
        })
   }else{
        const tour = await TourModel.findByIdAndUpdate(tourId, {
        ratingsAverage: 4.5,
        ratingsQuantity: 0,
    
        })
   }
 
   return stats
}
reviewSchema.post('save', async function(){
    console.log('this.tour', this.tour._id);
    const stats = await this.constructor.calcAverageRatings(this.tour._id);

   
});
// TO update the ratings average and ratingQuanity of TOur during findbyIDUpdate and FindByIDDelete 
// of review
reviewSchema.pre(/^findBy/,async function(next){
    this.r = await this.findOne();
    next();
});

//followed by below code 
reviewSchema.post(/^findBy/,async function(){
   const stats= this.r.constructor.calcAverageRatings(this.r.tour._id);
 
});

const ReviewModel = mongoose.model('Review', reviewSchema);
export default ReviewModel