import { Router } from 'express';

import tableRouter from './table';

const router = Router();

router.use('/table', tableRouter);

export default router;
