import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import userRouter from './routes/userRoutes.js';
import connectDB from './config/mongodb.js';

const app=express();
const PORT = process.env.port || 4000;

app.use(express.json());
app.use(cors());
await connectDB()// connecting the mongodb database

app.use('/api/user' , userRouter)
app.get((req,res) => (
    res.send("API Working ") // this will sends a request that API is working 
))


app.listen(PORT , ()=>
console.log('Server is running on port' + PORT)
)