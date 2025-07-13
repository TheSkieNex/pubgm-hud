import { Router } from 'express';

import tablesRouter from './tables';
import lottieRouter from './lottie';
import customRouter from './custom';

const router = Router();

router.use('/tables', tablesRouter);
router.use('/lottie', lottieRouter);
router.use('/custom', customRouter);

export default router;
