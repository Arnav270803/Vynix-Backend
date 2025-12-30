// import axios from 'axios';
// import { exec } from 'child_process';
// import fs from 'fs/promises';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import animationModel from '../models/animationModel.js';
// import { rejects } from 'assert';
// import { stderr, stdout } from 'process';

// // ----------------------------------------Taking grok reply text and extracting code from that -------------------------------
// const extractPython = (text) => {
//     const match = text.match(/```python\s*([\s\S]*?)\s*```/);
//     return match ? match[1].trim() : null;
// };

// {/*---------------------------- This is the temporary section which check whether i have manim and ffmpeg present in the computer or not -------------------------------*/}
//  // exec is the child_process function that runs a command in a shell and captures its output.
// const checkDependencies = async () => {
//     return new Promise((resolve, reject) => {
//         exec('manim --version && ffmpeg -version' , { shell: 'cmd.exe' } , (err,stdout) => {
//             if(err) {
//                 reject(new Error('Manim or FFmpeg not found. Ensure both are installed and in PATH.')); 
//             } else {
//                 resolve(true);
//             }
//             })
//     })
// };



// {/*--------------------------------------------------main block where all the video creation stuff happen--------------------------------------------------------- */}
// const sendPrompt = async (req,res) => {
// try {
// // first we are checking from the above function whether the dependencies of manim and ffmpeg are present or not 
//     await checkDependencies().catch((err) => {
//       return res.status(500).json({ success: false, message: err.message });
//     });
//     const { prompt } = req.body;// here we are extracting prompt from the body 
//     const userId = req.body.UserId;

//     if (!prompt?.trim()) {// here we are checking whether the prompt is there or not 
//       return res.status(400).json({ success: false, message: 'Prompt is required' });
//     }

//     // this was the main prompt that was going to go to the grok api , make the changes here if you wanted to change the prompt 
// const grokPrompt = `
// You are a Manim code generator for Manim Community v0.19.0.  
// Given the user description below, output **only** a ready-to-run Python script that uses Manim Community Edition.  
// - Use a single Scene class named "AnimScene".  
// - Import everything needed from manim (e.g., from manim import *).  
// - Keep the script short but include at least 4-6 seconds of animation (e.g., use run_time=2 for plays) to ensure MP4 output.  
// - Wrap the code in a markdown python block (\`\`\`python ... \`\`\`).  
// - Avoid using Text or Tex unless explicitly requested, as LaTeX may not be installed.  
// - Use basic shapes and animations (e.g., Circle, Square, Create, Transform).

// User description: "${prompt}"
// `;

// {/*this block sends the request to the grok api which i am taking from the openrouter */}
// const grokRes = await axios.post(
//       'https://openrouter.ai/api/v1/chat/completions',
//       {
//         model: 'mistralai/mistral-small-3.1-24b-instruct:free',
//         messages: [{ role: 'user', content: grokPrompt }],
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           'HTTP-Referer': process.env.MY_SITE_URL,
//           'X-Title': process.env.MY_SITE_NAME,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

// // above we wrote the function that extracts the python code from the grok res , here we are using this and checking whether we are getting one or not 
//     const manimCode  = extractPython(grokRes.data.choices[0].message.content);// choices is an array which is accessing first index from the ai model
//     if(!manimCode) {
//         return res.status(500).join({ success: false, message: 'Could not extract manim code from grok responce'})
//     }

//     console.log('Grok Manim Code:', manimCode);// it helps me to check the code 

//     const uniqueId = uuidv4();// it is generating unique id from the uuid dependency 
//     const pyFile = path.join(process.cwd(), `temp_${uniqueId}.py`);// path for the temporary python file  , process.cwd returns to the current directory  
//     const videoDir = path.join(process.cwd(), 'videos');// path to the videos folder 
//     const videoFile = `anim_${uniqueId}.mp4`;// this was the name of the output video 
//     const videoPath = path.join(videoDir, videoFile).replace(/\\/g, '/');// full path to the output video 
//     const pyFilePath = pyFile.replace(/\\/g, '/');// this was the full path to the python file , .replace(/\\/g, '/'): Converts Windows backslashes (\) to forward slashes (/) for compatibility with Manim’s command-line syntax.

//     {/*Preparing the file system to store the Python script and video output */}
//     await fs.mkdir(videoDir, { recursive: true })// it creates a video directory and saves the manim code to a temporary python file 
//     await fs.writeFile(pyFile, manimCode)



// const manimCmd = `manim -qm --format mp4 --output_file "${videoPath}" "${pyFilePath}" AnimScene`; // this was the command that we give to manim for generating video , here we are explicitely telling to generate video because normally it was not working for some reason
//     console.log('Running Manim Command:', manimCmd);// this runs the command to the windows command 


// {/* Runs the command in the Windows Command Prompt and handles the output in a callback.*/}
// // exec spawns a new shell process to run the manimCmd command asynchronously -> running commands here 
// // stdout is standard output and stderr is string with the error warking and err is error object 
//     exec(manimCmd, { shell: 'cmd.exe' }, async (err, stdout, stderr) => {
//       console.log('Manim STDOUT:', stdout);
//       console.log('Manim STDERR:', stderr);
//       await fs.unlink(pyFile).catch(() => {});// deletes the temporary python file 
// //fs provides async APIs for file I/O operations. Specifically, fs.unlink(pyFile) deletes (unlinks) the file at the pyFile path


//       // this deletes the media folder where i am storing all the media files and frames 
//       // here rd for removing directory , /s for subdirectory and /q is for quite so that it doesn't require any promptp 
//       exec(`rd /s /q "${path.join(process.cwd(), 'media').replace(/\\/g, '/')}"`, { shell: 'cmd.exe' }, () => {});


//       // checking if the manim failed and sending the error responce 
//       if (err) {
//       console.error('Manim exec error:', err);
//       console.error('Manim STDERR (for reference):', stderr);
//       return res.status(500).json({ success: false, message: 'Manim rendering failed', details: err.message });
//       }

// {/* creating the video url and storing all the metadata to the database  */}
//       const videoUrl = `/video/${uniqueId}`;// using the request protocol eg. http and hosting 
//       await animationModel.create({ userId, prompt, videoUrl, manimCode });


// {/*we don't want to store the video forever so here is the the fucntion that delete video after an hout  */}
//       setTimeout(async () => {
//         await fs.unlink(videoPath).catch(() => {});
//       }, 60 * 60 * 1000);

//       {/*this was the responce with videoURL  */}
//       res.json({ success: true, videoUrl });
//     });



//   } catch (error) {
//     console.error('sendPrompt error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// }


// const testPrompt = async (req, res) => {
//   res.json({ success: true, message: 'AI route is alive' });
// };

// export { sendPrompt, testPrompt} // 



















import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import animationModel from '../models/animationModel.js';

// ----------------------------------------Taking grok reply text and extracting code from that -------------------------------
const extractPython = (text) => {
    const match = text.match(/```python\s*([\s\S]*?)\s*```/);
    return match ? match[1].trim() : null;
};

// ---------------------------- This is the temporary section which check whether i have manim and ffmpeg present in the computer or not -------------------------------
const checkDependencies = async () => {
    return new Promise((resolve, reject) => {
        exec('manim --version && ffmpeg -version', { shell: 'cmd.exe' }, (err) => {
            if (err) {
                reject(new Error('Manim or FFmpeg not found. Ensure both are installed and in PATH.'));
            } else {
                resolve(true);
            }
        });
    });
};

// --------------------------------------------------main block where all the video creation stuff happen---------------------------------------------------------
const sendPrompt = async (req, res) => {
    try {
        // first we are checking from the above function whether the dependencies of manim and ffmpeg are present or not 
        await checkDependencies().catch((err) => {
            return res.status(500).json({ success: false, message: err.message });
        });

        const { prompt } = req.body;
        // Accept both "userId" and "UserId" from frontend for flexibility
        const userId = req.body.userId || req.body.UserId;

        if (!prompt?.trim()) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        // this was the main prompt that was going to go to the grok api

// const grokPrompt = `You are an expert Manim Community v0.19.0 code generator. Your task is to create flawless, production-ready Python animations.

// **CRITICAL REQUIREMENTS - FOLLOW EXACTLY:**

// 1. **Code Structure:**
//    - Import: from manim import *
//    - Single class: class AnimScene(Scene):
//    - Implement: def construct(self):
//    - Wrap entire code in: \`\`\`python ... \`\`\`

// 2. **Animation Quality Standards:**
//    - Duration: Minimum 6 seconds total animation time
//    - Timing: Use run_time=2 to run_time=4 for smooth animations
//    - Pacing: Add self.wait(0.5) between major animation sequences
//    - Transitions: Use FadeIn, FadeOut, Create, Transform, Write for professional results

// 3. **Technical Constraints:**
//    - NO Text() or Tex() objects (LaTeX not available)
//    - NO MathTex() or any LaTeX rendering
//    - Use ONLY: Circle, Square, Rectangle, Triangle, Line, Dot, Arrow, VGroup
//    - Colors: Use named colors (RED, BLUE, GREEN, YELLOW, PURPLE, ORANGE, WHITE)
//    - Positioning: Use .shift(UP*2), .move_to(LEFT*3), .next_to(), .align_to()

// 4. **Code Quality:**
//    - No syntax errors - code must execute perfectly first time
//    - No undefined variables or missing imports
//    - Proper indentation (4 spaces)
//    - Clear object naming (e.g., circle1, square_red, arrow_main)

// 5. **Error Prevention Checklist:**
//    - ✓ All objects added to scene with self.add() or self.play()
//    - ✓ All animations have valid targets
//    - ✓ No reference to objects before creation
//    - ✓ Colors specified correctly (e.g., color=BLUE not color="blue")
//    - ✓ Movement uses proper Vector constants (UP, DOWN, LEFT, RIGHT)

// **EXAMPLE STRUCTURE:**
// \`\`\`python
// from manim import *

// class AnimScene(Scene):
//     def construct(self):
//         # Create objects
//         circle = Circle(radius=1, color=BLUE)
//         square = Square(side_length=2, color=RED).shift(RIGHT*3)
        
//         # Animate
//         self.play(Create(circle), run_time=2)
//         self.wait(0.5)
//         self.play(FadeIn(square), run_time=2)
//         self.wait(0.5)
//         self.play(Transform(circle, square), run_time=2)
//         self.wait(1)
// \`\`\`

// **USER REQUEST:**
// "${prompt}"

// **YOUR TASK:**
// Generate a complete, executable Manim script that fulfills the user's request while strictly adhering to all requirements above. The code must run without any errors on the first attempt.

// Output ONLY the Python code wrapped in \`\`\`python\`\`\` tags. No explanations, no comments outside the code block.`;



const grokPrompt = `You are an expert Manim Community v0.19.0 code generator. Create production-ready Python animations.

**CRITICAL REQUIREMENTS:**

1. **Code Structure:**
   - Import: from manim import *
   - Single class: class AnimScene(Scene):
   - Implement: def construct(self):
   - Wrap code in: \`\`\`python ... \`\`\`

2. **Animation Duration (MANDATORY):**
   - MINIMUM 20 seconds total
   - Each animation: run_time=2 to run_time=4
   - Wait between steps: self.wait(0.8) to self.wait(1.5)
   - Minimum 8 animation steps

3. **Complexity Requirements:**
   - Use 6-10 objects minimum
   - Use VGroup for multiple objects
   - Animate multiple objects simultaneously: self.play(anim1, anim2, run_time=3)
   - Include transformations and color changes
   - Create visual patterns or sequences

4. **Available Animations:**
   - Create, FadeIn, FadeOut, GrowFromCenter, Write
   - Transform, ReplacementTransform
   - Rotate, obj.animate.shift(), obj.animate.scale()
   - obj.animate.set_color(COLOR)

5. **Available Shapes:**
   - Circle, Square, Rectangle, Triangle, Line, Dot, Arrow
   - VGroup, Polygon, RegularPolygon, Ellipse, Arc
   - NO Text, NO Tex, NO MathTex (not available)

6. **Colors:**
   - RED, BLUE, GREEN, YELLOW, PURPLE, ORANGE, WHITE, PINK, TEAL, GOLD

7. **Positioning:**
   - .shift(UP*2), .shift(LEFT*3), .shift(RIGHT*1.5)
   - .move_to(ORIGIN), .next_to(obj, direction)
   - Directions: UP, DOWN, LEFT, RIGHT

8. **CRITICAL RULES (prevent errors):**
   - Always use fill_opacity=0.5 for filled shapes
   - Always use stroke_width=3 for better visibility
   - Use PI for angles (e.g., angle=PI means 180 degrees)
   - Range in loops: range(-2, 3) gives [-2,-1,0,1,2]
   - For rotating: Rotate(obj, angle=PI/4, run_time=2)
   - Group before operations: group = VGroup(obj1, obj2)

**WORKING EXAMPLE:**
\`\`\`python
from manim import *

class AnimScene(Scene):
    def construct(self):
        # Create central object
        center = Circle(radius=1, color=BLUE, fill_opacity=0.5)
        self.play(GrowFromCenter(center), run_time=2)
        self.wait(1)
        
        # Create surrounding objects
        dots = VGroup(*[
            Dot(color=RED).shift(UP*2).rotate(i*PI/4, about_point=ORIGIN)
            for i in range(8)
        ])
        self.play(FadeIn(dots), run_time=2)
        self.wait(1)
        
        # Connect with lines
        lines = VGroup(*[
            Line(ORIGIN, dots[i].get_center(), color=YELLOW)
            for i in range(8)
        ])
        self.play(Create(lines), run_time=3)
        self.wait(1)
        
        # Transform colors
        self.play(
            center.animate.set_color(GREEN),
            dots.animate.set_color(PURPLE),
            run_time=2
        )
        self.wait(1)
        
        # Rotate everything
        everything = VGroup(center, dots, lines)
        self.play(Rotate(everything, angle=PI, run_time=3))
        self.wait(1)
        
        # Scale down
        self.play(everything.animate.scale(0.6), run_time=2)
        self.wait(1)
        
        # Add outer ring
        ring = Circle(radius=3, color=ORANGE, stroke_width=5)
        self.play(Create(ring), run_time=2)
        self.wait(2)
\`\`\`

**USER REQUEST:**
"${prompt}"

**YOUR TASK:**
Generate working Manim code (20+ seconds) with 8+ animation steps, 6+ objects, and no errors.

Output ONLY Python code in \`\`\`python\`\`\` tags. No extra text.`;


        // this block sends the request to the grok api which i am taking from the openrouter
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

        // above we wrote the function that extracts the python code from the grok res
        const manimCode = extractPython(grokRes.data.choices[0].message.content);
        if (!manimCode) {
            return res.status(500).json({ success: false, message: 'Could not extract manim code from grok response' });
        }

        console.log('Grok Manim Code:', manimCode);

        const uniqueId = uuidv4();
        const pyFile = path.join(process.cwd(), `temp_${uniqueId}.py`);
        const videoDir = path.join(process.cwd(), 'videos');
        const videoFile = `anim_${uniqueId}.mp4`;
        const videoPath = path.join(videoDir, videoFile).replace(/\\/g, '/');
        const pyFilePath = pyFile.replace(/\\/g, '/');

        // Preparing the file system to store the Python script and video output
        await fs.mkdir(videoDir, { recursive: true });
        await fs.writeFile(pyFile, manimCode);

        const manimCmd = `manim -qm --format mp4 --output_file "${videoPath}" "${pyFilePath}" AnimScene`;
        console.log('Running Manim Command:', manimCmd);

        // Runs the command in the Windows Command Prompt and handles the output in a callback.
        exec(manimCmd, { shell: 'cmd.exe' }, async (err, stdout, stderr) => {
            console.log('Manim STDOUT:', stdout);
            console.log('Manim STDERR:', stderr);

            // Delete temporary python file
            await fs.unlink(pyFile).catch(() => {});

            // Delete media folder (intermediate frames)
            exec(`rd /s /q "${path.join(process.cwd(), 'media').replace(/\\/g, '/')}"`, { shell: 'cmd.exe' }, () => {});

            // Only fail if there's a real exec error (ignore noisy stderr)
            if (err) {
                console.error('Manim exec error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Manim rendering failed',
                    details: err.message
                });
            }

            // creating the video url and storing all the metadata to the database
            const videoUrl = `/video/${uniqueId}`;

            try {
                await animationModel.create({
                    userId: userId || 'guest',
                    prompt,
                    videoUrl,
                    manimCode
                });
                console.log('Video metadata saved to DB');
            } catch (dbError) {
                console.error('DB save failed (video still works):', dbError);
                // Don't block response — video was generated successfully
            }

            // we don't want to store the video forever so here is the function that delete video after an hour
            setTimeout(async () => {
                await fs.unlink(videoPath).catch(() => {});
            }, 60 * 60 * 1000);

            // this was the response with videoURL
            res.json({ success: true, videoUrl });
        });

    } catch (error) {
        console.error('sendPrompt error:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

const testPrompt = async (req, res) => {
    res.json({ success: true, message: 'AI route is alive' });
};

export { sendPrompt, testPrompt };