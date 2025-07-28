import { Router } from 'express';

import authRouter from './auth';
import lottieRouter from './lottie';

const router = Router();

router.use('/auth', authRouter);
router.use('/lottie', lottieRouter);

export default router;
