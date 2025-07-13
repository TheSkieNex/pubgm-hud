import { Router } from 'express';

import LottieController from '../controllers/lottie';

const lottieRouter = Router();

lottieRouter.get('/:uuid', LottieController.get);
lottieRouter.get('/', LottieController.getAll);
lottieRouter.post('/', LottieController.upload);
lottieRouter.put('/', LottieController.update);
lottieRouter.delete('/:uuid', LottieController.delete);
lottieRouter.patch('/:uuid/layer/:layerIndex/toggle', LottieController.toggleLayer);
lottieRouter.get('/:uuid/layer/:layerIndex/content', LottieController.layerContent);
lottieRouter.get('/:uuid/layers', LottieController.getLayersData);
lottieRouter.patch('/:uuid/layer/:layerIndex', LottieController.updateLayer);

export default lottieRouter;
