import { AppError } from "../utils/appError.js";
const handleCastErrorDB =(err)=>{
  console.log('handle cast error DB ');
  const message =   `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}
const handleDuplicatefieldsDB = err =>{
  console.log('handle duplciate fields db');
  const message =   `Duplicate field values`;
  return new AppError(message, 400);
}
const handleValdationErrorDB = err =>{
  console.log('err', err);
  const errorMessage  = Object.values(err.errors).map(errorItem => errorItem.message)
  const message =   `Invalid Input data. ${errorMessage.join('. ')}`;
  return new AppError(message, 400);
}
const handleJWTError = err =>new AppError('Invalid Session. Please Login again', 401);

export const globalErrorHandler = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV === 'development'){
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
      });
    }else if(process.env.NODE_ENV === 'production'){
      //Operational trusted error
      if(err.isOperational){

        res.status(err.statusCode).json({
          status: err.status,
          message: err.message,
      });
      //Programming or other unknownd error: dont leak error details
      }else{
        //1: Log error
        let error={}
        console.log('err.name', err.code);
        if(err.name  === 'CastError') {
          error = handleCastErrorDB(err);
        }else if(err.code === 11000){
          error = handleDuplicatefieldsDB(err);
        }else if(err.name === 'ValidationError'){
          error = handleValdationErrorDB(err);
        }else if(err.name === 'JsonWebTokenError' || err.name ==='TokenExpiredError'){
          error = handleJWTError(err);
        }
        console.log('error.message', error)
        res.status(500).json({
          status: 'error',
          // message: error.message?? 'Something went very wrong!',
          message: error.message
        })
      }
    }
  }
