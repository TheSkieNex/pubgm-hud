import { Router } from 'express';

import LottieSyncController from '../controllers/lottie-sync';

const lottieSyncRouter = Router();

lottieSyncRouter.get('/:uuid', LottieSyncController.get);
lottieSyncRouter.get('/', LottieSyncController.getAll);
lottieSyncRouter.post('/', LottieSyncController.upload);
lottieSyncRouter.put('/', LottieSyncController.update);
lottieSyncRouter.delete('/:uuid', LottieSyncController.delete);
lottieSyncRouter.patch('/:uuid/layer/:layerIndex/toggle', LottieSyncController.toggleLayer);
lottieSyncRouter.get('/:uuid/layer/:layerIndex/content', LottieSyncController.layerContent);
lottieSyncRouter.get('/:uuid/layers', LottieSyncController.getLayersData);
lottieSyncRouter.patch('/:uuid/layer/:layerIndex', LottieSyncController.updateLayer);

export default lottieSyncRouter;
