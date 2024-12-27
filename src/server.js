import mongoose, { mongo } from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
const environment = process.env.NODE_ENV;
console.log('environment', environment);
dotenv.config({ path: `./config/.env.${environment}` });
const DB = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.DATABASE_PWD);

const port = process.env.PORT;
const a =10;

mongoose
  .connect(DB,{
  })
  .then((con) => {
    console.log('connection succesfull');
  })
const server = app.listen(port, () => {
  console.log('app runnign on port 100');
});

process.on('unhandledRejection', (error)=>{
  console.log(error.name, error.message);
  server.close(()=>{
    process.exit(1);
  })
})

process.on('uncaughtException', err =>{
    console.log('UnCAUGHT Exception Shutting donw')
    console.log(err)
    server.close(()=>{
      process.exit(1);
    })
});