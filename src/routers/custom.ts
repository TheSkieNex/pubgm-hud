import { Router } from 'express';

import CustomController from '../controllers/custom';

const customRouter = Router();

customRouter.put('/wwcd-team', CustomController.updateWWCDTeam);

export default customRouter;
