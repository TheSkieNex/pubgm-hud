import { Router } from 'express';

import tablesRouter from './tables';
import lottieRouter from './lottie';
import customRouter from './custom';
import adminRouter from './admin';

const router = Router();

router.use('/status', (req, res) => {
  res.send('OK');
});

router.use('/tables', tablesRouter);
router.use('/lottie', lottieRouter);
router.use('/custom', customRouter);
router.use('/admin', adminRouter);

export default router;
