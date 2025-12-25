import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import animationModel from '../models/animationModel.js';
import { rejects } from 'assert';
import { stderr, stdout } from 'process';

// ----------------------------------------Taking grok reply text and extracting code from that -------------------------------
const extractPython = (text) => {
    const match = text.match(/```python\s*([\s\S]*?)\s*```/);
    return match ? match[1].trim() : null;
};

{/*---------------------------- This is the temporary section which check whether i have manim and ffmpeg present in the computer or not -------------------------------*/}
 // exec is the child_process function that runs a command in a shell and captures its output.
const checkDependencies = async () => {
    return new Promise((resolve, reject) => {
        exec('manim --version && ffmpeg -version' , { shell: 'cmd.exe' } , (err,stdout) => {
            if(err) {
                reject(new Error('Manim or FFmpeg not found. Ensure both are installed and in PATH.')); 
            } else {
                resolve(true);
            }
            })
    })
};



{/*--------------------------------------------------main block where all the video creation stuff happen--------------------------------------------------------- */}
const sendPrompt = async (req,res) => {
try {
// first we are checking from the above function whether the dependencies of manim and ffmpeg are present or not 
    await checkDependencies().catch((err) => {
      return res.status(500).json({ success: false, message: err.message });
    });
    const { prompt } = req.body;// here we are extracting prompt from the body 
    const userId = req.body.UserId;

    if (!prompt?.trim()) {// here we are checking whether the prompt is there or not 
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // this was the main prompt that was going to go to the grok api , make the changes here if you wanted to change the prompt 
const grokPrompt = `
You are a Manim code generator for Manim Community v0.19.0.  
Given the user description below, output **only** a ready-to-run Python script that uses Manim Community Edition.  
- Use a single Scene class named "AnimScene".  
- Import everything needed from manim (e.g., from manim import *).  
- Keep the script short but include at least 4-6 seconds of animation (e.g., use run_time=2 for plays) to ensure MP4 output.  
- Wrap the code in a markdown python block (\`\`\`python ... \`\`\`).  
- Avoid using Text or Tex unless explicitly requested, as LaTeX may not be installed.  
- Use basic shapes and animations (e.g., Circle, Square, Create, Transform).

User description: "${prompt}"
`;

{/*this block sends the request to the grok api which i am taking from the openrouter */}
const grokRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-small-3.1-24b-instruct:free',
        messages: [{ role: 'user', content: grokPrompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.MY_SITE_URL,
          'X-Title': process.env.MY_SITE_NAME,
          'Content-Type': 'application/json',
        },
      }
    );

// above we wrote the function that extracts the python code from the grok res , here we are using this and checking whether we are getting one or not 
    const manimCode  = extractPython(grokRes.data.choices[0].message.content);// choices is an array which is accessing first index from the ai model
    if(!manimCode) {
        return res.status(500).join({ success: false, message: 'Could not extract manim code from grok responce'})
    }

    console.log('Grok Manim Code:', manimCode);// it helps me to check the code 

    const uniqueId = uuidv4();// it is generating unique id from the uuid dependency 
    const pyFile = path.join(process.cwd(), `temp_${uniqueId}.py`);// path for the temporary python file  , process.cwd returns to the current directory  
    const videoDir = path.join(process.cwd(), 'videos');// path to the videos folder 
    const videoFile = `anim_${uniqueId}.mp4`;// this was the name of the output video 
    const videoPath = path.join(videoDir, videoFile).replace(/\\/g, '/');// full path to the output video 
    const pyFilePath = pyFile.replace(/\\/g, '/');// this was the full path to the python file , .replace(/\\/g, '/'): Converts Windows backslashes (\) to forward slashes (/) for compatibility with Manim’s command-line syntax.

    {/*Preparing the file system to store the Python script and video output */}
    await fs.mkdir(videoDir, { recursive: true })// it creates a video directory and saves the manim code to a temporary python file 
    await fs.writeFile(pyFile, manimCode)



const manimCmd = `manim -qm --format mp4 --output_file "${videoPath}" "${pyFilePath}" AnimScene`; // this was the command that we give to manim for generating video , here we are explicitely telling to generate video because normally it was not working for some reason
    console.log('Running Manim Command:', manimCmd);// this runs the command to the windows command 


{/* Runs the command in the Windows Command Prompt and handles the output in a callback.*/}
// exec spawns a new shell process to run the manimCmd command asynchronously -> running commands here 
// stdout is standard output and stderr is string with the error warking and err is error object 
    exec(manimCmd, { shell: 'cmd.exe' }, async (err, stdout, stderr) => {
      console.log('Manim STDOUT:', stdout);
      console.log('Manim STDERR:', stderr);
      await fs.unlink(pyFile).catch(() => {});// deletes the temporary python file 
//fs provides async APIs for file I/O operations. Specifically, fs.unlink(pyFile) deletes (unlinks) the file at the pyFile path


      // this deletes the media folder where i am storing all the media files and frames 
      // here rd for removing directory , /s for subdirectory and /q is for quite so that it doesn't require any promptp 
      exec(`rd /s /q "${path.join(process.cwd(), 'media').replace(/\\/g, '/')}"`, { shell: 'cmd.exe' }, () => {});


      // checking if the manim failed and sending the error responce 
      if (err || stderr) {
        console.error('Manim error:', stderr || err);
        return res.status(500).json({ success: false, message: 'Manim rendering failed', details: stderr || err.message });
      }


{/* creating the video url and storing all the metadata to the database  */}
      const videoUrl = `/video/${uniqueId}`;// using the request protocol eg. http and hosting 
      await animationModel.create({ userId, prompt, videoUrl, manimCode });


{/*we don't want to store the video forever so here is the the fucntion that delete video after an hout  */}
      setTimeout(async () => {
        await fs.unlink(videoPath).catch(() => {});
      }, 60 * 60 * 1000);

      {/*this was the responce with videoURL  */}
      res.json({ success: true, videoUrl });
    });



  } catch (error) {
    console.error('sendPrompt error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}


const testPrompt = async (req, res) => {
  res.json({ success: true, message: 'AI route is alive' });
};

export { sendPrompt, testPrompt} // 