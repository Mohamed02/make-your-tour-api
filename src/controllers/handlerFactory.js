import { APIFeature } from "../utils/apiFeatures.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
const handlerfactory ={
    deleteOne: (Model) => catchAsync(async (req, res, next) => {
        const deletedTour = await Model.findByIdAndDelete(req.params.id);
        if(!deletedTour) {
          return next(new AppError('No Document found with the given ID'),404);
        }
      
        res.status(204).json({
          status: 'success'
        });
      }),
    updateOne: (Model) => catchAsync( async (req, res, next)=>{
        const updatedDocument = await Model.findByIdAndUpdate(req.params.id,{
          ...req.body
        }, {
          new:true,
          runValidators:true
        })
        res.status(200).json({
          status: 'success',
          message: 'Updated Document Successfully',
          data: {
            data: updatedDocument
          }
        });
    }),
    createOne: (Model) => catchAsync(async (req,res,next) =>{
      const newDoc = await Model.create( {...req.body});
      res.status(200).send({
          status: 'success',
          data: {
              data: newDoc
          }
      })
      
  }),
  getOne: (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query  = Model.findById(req.params.id);
    if(populateOptions){
      query  = query.populate(populateOptions);
    }
    const document = await query;
    if(!document){
      return next(new AppError('No document found with the given ID'),404);
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: document
      },
    });
  
  }),
  getAll: (Model)=> catchAsync(async (req, res, next) => {

    /* Tech debt - added below condtion specific for getrevious
       to support nested GET request of review on tour object.
       */
      let filter ={}
      if(req.params.tourId) filter={tour:req.params.tourId}
    // Tech debt 

    const query =  Model.find(filter);
    let apiFeatures = new APIFeature(query, req.query).filter().sort().fieldLimit().pagination();

      // const docs = await apiFeatures.query.explain();  // use explain to get the statistic of query
      const docs = await apiFeatures.query;
      res.status(200).json({
        status: 'success',
        results: docs.length,
        data: docs,
      });
  }),
}

export default handlerfactory