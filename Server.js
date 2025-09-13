import express from 'express'
import cors from 'cors'
import connectDB from './config/mongodb.js';

const app=express();
const PORT =  4000;

app.use(express.json());
app.use(cors());
await connectDB()// connecting the mongodb database

app.listen(PORT , ()=>
console.log('Server is running on port' + PORT)
)