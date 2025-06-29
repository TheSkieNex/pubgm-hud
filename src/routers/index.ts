import { Router } from 'express';

import tablesRouter from './tables';
import lottieSyncRouter from './lottie-sync';
import customRouter from './custom';

const router = Router();

router.use('/tables', tablesRouter);
router.use('/lottie-sync', lottieSyncRouter);
router.use('/custom', customRouter);

export default router;
