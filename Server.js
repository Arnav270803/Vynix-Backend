import express from 'express'
import cors from 'cors'
const app=express();

const PORT =  4000;

app.use(express.json());
app.use(cors());

app.listen(PORT , ()=>
console.log('Server is running on port' + PORT)
)