import express from 'express';
import { loginUser, registerUser } from '../controller/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser); // Fixed typo: 'login' was missing a slash

export default userRouter;