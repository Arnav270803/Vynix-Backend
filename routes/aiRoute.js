import express from 'express'
import {sendPrompt , testPrompt} from '../controller/aiController.js'
import path from 'path'
import fs from 'fs';

const airoute = express.Router();

airoute.post('/ask' , sendPrompt);// Now it is requiting token from the jwt that we have generated 
airoute.get('/test' , testPrompt)



{/* Streaming video code to the frontend is starting from here  */}
airoute.get('/video/:uniqueId' , (req,res) => {// ":uniqueId is dynamic in nature and here the real path will be added by express"
    
})

export default airoute;