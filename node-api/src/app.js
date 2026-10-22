import express from 'express';import cors from 'cors';import helmet from 'helmet';import rateLimit from 'express-rate-limit';
import auth from './routes/auth.js';import tickets from './routes/tickets.js';import admin from './routes/admin.js';import notifications from './routes/notifications.js';import attachments from './routes/attachments.js';import { errorHandler } from './lib/errors.js';
export const app=express();app.disable('x-powered-by');app.use(helmet());app.use(cors({origin:(process.env.CORS_ORIGIN||'http://localhost:5173').split(',')}));app.use(express.json({limit:'1mb'}));
app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:40,standardHeaders:'draft-7',legacyHeaders:false}),auth);
app.get('/health',(req,res)=>res.json({status:'ok',service:'node-api'}));
app.use('/api/tickets',tickets);app.use('/api/admin',admin);app.use('/api/notifications',notifications);app.use('/api/attachments',attachments);
app.use((req,res)=>res.status(404).json({error:'Route not found'}));app.use(errorHandler);
