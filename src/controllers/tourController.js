import fs from 'fs';
import path from 'path';
import Tour from '../models/tourModel.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { APIFeature } from '../utils/apiFeatures.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';
import factory from './handlerFactory.js';
import handlerfactory from './handlerFactory.js';
// Get the current file's URL (equivalent of `import.meta.url`)
const __filename = fileURLToPath(import.meta.url);

// Calculate __dirname by getting the directory name from the filename
const __dirname = dirname(__filename);

const dataFilePath = path.resolve(__dirname, '../dev-data/data/tours-simple.json'); 
export const tours = JSON.parse(
  fs.readFileSync(dataFilePath,'utf-8'),
);

export const aliasTopTours = (req,res,next)=>{
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}
export const getAllTours = catchAsync(async (req, res, next) => {
  const query =  Tour.find();
    let apiFeatures={};
    if(req.query){
      apiFeatures = new APIFeature(query, req.query).filter().sort().fieldLimit().pagination();
    }else{
      apiFeatures["query"]= query;
    }
    const AllTours = await query;
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      results: AllTours.length,
      data: AllTours,
    });
});
export const getTour = handlerfactory.getOne(Tour,'reviews');


export const createTour = catchAsync(async (req, res, next) => {
      const newTour = await Tour.create({
        ...req.body
      });
        res.status(201).json({
                status: 'success',
                data: newTour,
              });
});
export const updateTour= handlerfactory.updateOne(Tour);
export const deleteTour =  factory.deleteOne(Tour)

export const getTourStats = catchAsync(async(req, res, next)=>{
    const stats = await Tour.aggregate([
      {$match: {ratingsAverage: {$gte: 4.5}}},
      {$group: { 
        _id: {$toUpper:'$difficulty'},
        numOfTours: {$sum: 1},
        numOfRating: {$sum: '$ratingsQuantity'},
        avgRating:{$avg:'$ratingsAverage'},
        avgPrice:{$avg: '$price'},
        minPrie: {$min: '$price'},
        maxPrice: {$max: '$price'},

      }},
      {$sort: { numOfRating:1}},
      {$match: { _id: {$eq: 'DIFFICULT'}}}
    ]);

    res.status(200).json({
      status: 'success',
      data: stats
    })
});

export const getMonthlyPlans =async (req, res, next)=>{
  const year = req.params.year * 1;
  const monthNames = ["","January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const tourPlan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {$gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`)}
      }
    },
    {
      $group: {
        _id: {$arrayElemAt: [monthNames, {$month: '$startDates'}]},
        noOfTours: {$sum:1},
        tours:{$push: '$name'}
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort:{noOfTours:1}
    },
    {
      $limit:12
    }
  ]);
  res.status(200).json({
    status: 'success',
    results: tourPlan.length,
    data: tourPlan
  })
}