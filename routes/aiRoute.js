import express from 'express';
import { sendPrompt, testPrompt } from '../controller/aiController.js';
import path from 'path';
import fs from 'fs';

const airoute = express.Router();

airoute.post('/ask', sendPrompt); // Now it is requiring token from the jwt that we have generated 
airoute.get('/test', testPrompt);




/* Streaming video code to the frontend is starting from here  */
airoute.get('/video/:uniqueId', (req, res) => { 
  // ":uniqueId" is dynamic in nature and here the real path will be added by express
  const uniqueId = req.params.uniqueId;
  const videoPath = path.join(process.cwd(), 'videos', `anim_${uniqueId}.mp4`); 
  // anim is just a fixed word that is added in front of the file name 

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({success: false, message: 'Video not found or has expired',});
  }

  const stat =fs.statSync(videoPath); // statSync helps to read metadata without loading video here 
  const fileSize=stat.size; // it tells the total file size 
  const range=req.headers.range; // this is so browser downloads smaller chunks rather than complete video at once, finished it ahead

  // here i am implementing if we have range then just split the data 
  if (range) {
    const parts=range.replace(/bytes=/, '').split('-');
    const start= parseInt(parts[0], 10);
    const end =parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize =end-start + 1;

    res.writeHead(206, {'Content-Range': `bytes ${start}-${end}/${fileSize}`,'Accept-Ranges': 'bytes', 'Content-Length': chunkSize,'Content-Type': 'video/mp4',});
    // Stream only the requested chunk (for fast seeking)
    // createReadStream reads the video in small chunks rather then complete 
    // pipe - sirectly raking each chunk and sending to the browser
    fs.createReadStream(videoPath, { start, end }).pipe(res);
  } else {
    // No range send the full video
    // Prevents caching issues during development
    res.writeHead(200, { 'Content-Length': fileSize,'Content-Type': 'video/mp4','Cache-Control': 'no-cache', 
    });

    // Stream the entire video file efficiently
    fs.createReadStream(videoPath).pipe(res);
  }

  //  Delete the video file after streaming completes (saves disk space)
  // Uncomment when you're ready to auto-cleanup immediately after viewing
  // res.on('finish', () => {
  //   fs.unlink(videoPath, (err) => {
  //     if (err) console.error('Cleanup failed:', err);
  //     else console.log(`Deleted video: anim_${uniqueId}.mp4`);
  //   });
  // });
});

export default airoute;