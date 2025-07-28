import { Router } from 'express';

import AdminLottieController from '../../controllers/admin/lottie';

import { authMiddleware } from '../../lib/decorators/auth';
import { wrapGeneralHandler } from '../../utils/auth';

const adminLottieRouter = Router();

adminLottieRouter.get('/:uuid', authMiddleware(), wrapGeneralHandler(AdminLottieController.get));
adminLottieRouter.get('/', authMiddleware(), wrapGeneralHandler(AdminLottieController.getAll));
adminLottieRouter.post('/', authMiddleware(), wrapGeneralHandler(AdminLottieController.upload));
adminLottieRouter.put('/', authMiddleware(), wrapGeneralHandler(AdminLottieController.update));
adminLottieRouter.delete(
  '/:uuid',
  authMiddleware(),
  wrapGeneralHandler(AdminLottieController.delete)
);
adminLottieRouter.patch(
  '/:uuid/layer/:layerIndex/toggle',
  authMiddleware(),
  wrapGeneralHandler(AdminLottieController.toggleLayer)
);
adminLottieRouter.get(
  '/:uuid/layer/:layerIndex/content',
  authMiddleware(),
  wrapGeneralHandler(AdminLottieController.layerContent)
);
adminLottieRouter.get(
  '/:uuid/layers',
  authMiddleware(),
  wrapGeneralHandler(AdminLottieController.getLayersData)
);
adminLottieRouter.patch(
  '/:uuid/layer/:layerIndex',
  authMiddleware(),
  wrapGeneralHandler(AdminLottieController.updateLayer)
);

export default adminLottieRouter;
