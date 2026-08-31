import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

import authRoutes from './routes/authRoutes';
import superadminRoutes from './routes/superadminRoutes';
import businessRoutes from './routes/businessRoutes';
import publicRoutes from './routes/publicRoutes';
import customerRoutes from './routes/customerRoutes';
import planRoutes from './routes/planRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/superadmin/plans', planRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/customer', customerRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;
