import { Router } from 'express';
import {
  getPublicKey,
  register,
  login,
  logout,
  getMe,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const authRouter = Router();

// Public Authentication Endpoints
authRouter.get('/public-key', getPublicKey);
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

// Protected Identity & Profile Endpoints
authRouter.get('/me', authenticateToken, getMe);

export default authRouter;
