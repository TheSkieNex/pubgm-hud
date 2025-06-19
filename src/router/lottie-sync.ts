import { Router } from 'express';

import LottieSyncController from '@/controllers/lottie-sync';

const lottieSyncRouter = Router();

lottieSyncRouter.get('/get/:uuid', LottieSyncController.get);
lottieSyncRouter.post('/upload', LottieSyncController.upload);

export default lottieSyncRouter;
