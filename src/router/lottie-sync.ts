import { Router } from 'express';

import LottieSyncController from '@/controllers/lottie-sync';

const lottieSyncRouter = Router();

lottieSyncRouter.get('/:uuid', LottieSyncController.get);
lottieSyncRouter.get('/', LottieSyncController.getAll);
lottieSyncRouter.post('/', LottieSyncController.upload);
lottieSyncRouter.delete('/:uuid', LottieSyncController.delete);
lottieSyncRouter.patch('/:uuid/layer/:layerIndex', LottieSyncController.toggleLayer);

export default lottieSyncRouter;
