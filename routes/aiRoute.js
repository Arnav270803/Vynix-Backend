import express from 'express'
import {sendPrompt , testPrompt} from '../controller/aiController.js'
import path from 'path'
import fs from 'fs';

const airoute = express.Router();

airoute.post('/ask' , sendPrompt);// Now it is requiting token from the jwt that we have generated 
airoute.get('/test' , testPrompt)



{/* Streaming video code to the frontend is starting from here  */}
airoute.get('/video/:uniqueId' , (req,res) => {// ":uniqueId is dynamic in nature and here the real path will be added by express"
    const uniqueId = req.params.uniqueId
    const videoPath = path.join(process.cwd() , 'videos' , `anim_${uniqueId}.mp4`); // anim is just a fixed word that is added in front of the file name 

      if (!fs.existsSync(videoPath)) {
    return res.status(404).json({success: false, message: 'Video not found or has expired', });
  }

  {/*continue writing from here  */}
})

export default airoute;