import { Router } from 'express';

import LottieSyncUploadController from '@/controllers/lottie-sync';

const lottieSyncRouter = Router();

lottieSyncRouter.post('/upload', LottieSyncUploadController.upload);

export default lottieSyncRouter;
