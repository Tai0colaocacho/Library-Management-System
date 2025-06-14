import express from 'express';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './database/db.js';
import { errorMiddleware } from './middlewares/errorMiddlewares.js';
import expressFileupload from 'express-fileupload';

import authRouter from './routes/authRouter.js';
import bookRouter from './routes/bookRouter.js';
import borrowingRouter from './routes/borrowRouter.js'; 
import userRouter from './routes/userRouter.js';
import settingsRouter from './routes/settingsRouter.js'; 
import notificationRouter from './routes/notificationRouter.js'; 

import { handleScheduledTasks } from './services/scheduledTasks.js'; 
import { removeUnverifiedAccounts } from './services/removeUnverifiedAccounts.js';

export const app = express();

config({ path: "./config/config.env" });

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expressFileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/books', bookRouter); 
app.use('/api/v1/borrowings', borrowingRouter); 
app.use('/api/v1/users', userRouter);   
app.use('/api/v1/settings', settingsRouter); 
app.use('/api/v1/notifications', notificationRouter); 

handleScheduledTasks(); 
removeUnverifiedAccounts(); 

connectDB();

app.use(errorMiddleware);