import { Router } from 'express';

import tableRouter from './table';
import lottieSyncRouter from './lottie-sync';

const router = Router();

router.use('/table', tableRouter);
router.use('/lottie-sync', lottieSyncRouter);

export default router;
