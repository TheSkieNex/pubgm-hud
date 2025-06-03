import { Router } from 'express';

import apiRouter from './api';
import tableRouter from './table';

const router = Router();

router.use('/api', apiRouter);
router.use('/table', tableRouter);

export default router;
