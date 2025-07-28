import { Router } from 'express';

import AuthController from '../../controllers/admin/auth';
import { authMiddleware } from '../../lib/decorators/auth';
import { wrapGeneralHandler } from '../../utils/auth';

const router = Router();

router.post('/login', AuthController.login);
router.get('/user', authMiddleware(), wrapGeneralHandler(AuthController.getUser));

export default router;
