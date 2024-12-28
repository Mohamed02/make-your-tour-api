import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js'
import { AppError } from './utils/appError.js';
import { globalErrorHandler } from './controllers/errorController.js';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import helmet from 'helmet';
import hpp from 'hpp'


const app = express();

// Set Security HTTP HEaders
app.use(helmet());

// Body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'})); //Express middle ware

// Data sanitization against NoSQL query injection
  app.use(mongoSanitize());
// Data sanitization agaist XSS
  app.use(xss());


  // Prevent Parameter pollution 
  app.use(hpp({
    whitelist:['duration', 'ratingsQuality', 'ratingsAverage', 'maxGroupSize', 'difficulty']
  }));
// Enable Logging via Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Enable API rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour !'
});
app.use('/api',limiter);

app.use(compression({ level: 5 }));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*',(req,res, next)=>{
    next(  new AppError('Cant find the url on thsi server',404));
});

app.use(globalErrorHandler)

export default app;
