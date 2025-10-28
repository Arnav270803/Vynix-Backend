import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';
import aiRoute from './routes/aiRoute.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use('/videos', express.static(path.join(process.cwd(), 'videos')));

await connectDB();

app.use('/api/user', userRouter);
app.use('/api/ai', aiRoute);

app.get('/', (req, res) => res.send('API Working'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));