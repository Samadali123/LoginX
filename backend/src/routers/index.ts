import { Router } from 'express';
import authRouter from './auth.router';

const rootRouter = Router();

// Mount authentication router under /auth
rootRouter.use('/auth', authRouter);

export { authRouter };
export default rootRouter;
