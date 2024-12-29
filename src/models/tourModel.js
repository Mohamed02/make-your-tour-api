import mongoose from "mongoose";
import slugify from 'slugify';
import UserModel from "./userModel.js";
import ReviewModel from "./reviewModel.js";
const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true,'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour name must have less or equal to 40 characters'],
      minlength: [10, 'A tour name must have more or equal to 10 characters'],
      validate: {validator:function(v) {
        return /^[A-Za-z\s]+$/.test(v);  // Only letters and spaces
      } , message: 'Tour name must only contain characters'}
    },
    slug: String,
    duration:{
        type: Number,
        required: [true,'A tour must have a duration']
    },
    maxGroupSize:{
        type: Number,
        required: [true,'A tour must have a group size']
    },
    difficulty:{
        type: String,
        required:[true, 'A tour must have difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficult is either easy,medium or difficult'
        },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    price: {
      type: Number,
      required:[true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator:function(val){ 
                // this  only points to current doc on NEW document creation and not on document update.
                return val <this.price;
            },
            message: "Discount price {VALUE} should be below the regular price"
        }
    },
    summary: {
        type:String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    startLocation:{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations:[
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
      
    ],
    secretTour: {
        type: Boolean,
        default: false
    },
    guides:[
      {
        type: mongoose.Schema.ObjectId,
        ref: UserModel
      }
    ]
  },{
    toJSON: { virtuals: true},
    toObject: {virtuals: true}
  });
  // tourSchema.index({ price:1 });
  tourSchema.index({ price:1, ratingsAverage: -1 });
  tourSchema.index({ slug: 1 });
  tourSchema.index({startLocation: '2dsphere'})

  tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
  });
  
  tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
  });

  // DOCUMENT MIDDLEWARE: runs before .save() and .create()
  tourSchema.pre('save', function(){
    console.log(this);
  });
  tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower:true});
    next();
  });

  tourSchema.pre('save', async function(next){
    const guidesPromises = this.guides.map(guideId => UserModel.findById(guideId));
    this.guideId = await Promise.all(guidesPromises);
    next();
  });
  // QUERY MIDDLEWARE: runs before find()

    // pre or before find query
    tourSchema.pre(/^find/, function(next){
        this.find({secretTour: {$ne: true}});
        this.start = Date.now();
        next();
    });
    // pre or before find query
    tourSchema.pre(/^find/, function(next){
      this.populate({
        path: 'guides',
        select: '-__v -passwordCreatedAt'
      });
      next();
    });
        // post or after find query
    tourSchema.post(/^find/, function(docs,next){
        console.log(`The query took ${Date.now()  - this.start} milliseconds`);
        next();
    });
    tourSchema.post('findById', function(docs,next){
      docs.populate('reviews')
      next();
  });

// AGGREGATION MIDDLEWARE
// commented the below piplelien as $geoNear has to be first pipelinein aggregate method
    // tourSchema.pre('aggregate',function(next){
    //     this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
    //     console.log('*****aggregation middle ware executed');
    //     next();
    // })

  const TourModel  = mongoose.model('Tour', tourSchema);
   export default TourModel;