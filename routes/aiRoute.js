import express from 'express'
import {sendPrompt , testPrompt} from '../controller/aiController.js'


const airoute = express.Router();

airoute.post('/ask' , sendPrompt);// Now it is requiting token from the jwt that we have generated 
airoute.get('/test' , testPrompt)

export default airoute;