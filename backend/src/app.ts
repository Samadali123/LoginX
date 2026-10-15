import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { authRouter } from './routers';
import { ENV } from './config/env';

const app = express();

// HTTP Request Logging with morgan
app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Allowed origins for CORS (with credentials for HTTP-only cookies)
const allowedOrigins = [
  ENV.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'LoginX API', timestamp: new Date().toISOString() });
});

// Authentication API
app.use('/api/auth', authRouter);

// Locate the frontend static build folder (backend/dist or frontend/dist)
const candidateDistPaths = [
  path.join(__dirname, '../dist'),
  path.join(process.cwd(), 'dist'),
  path.join(__dirname, '../../frontend/dist'),
  path.join(process.cwd(), '../frontend/dist'),
];

const frontendDist = candidateDistPaths.find(
  (dir) => fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))
);

if (frontendDist) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Fallback 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

export default app;
