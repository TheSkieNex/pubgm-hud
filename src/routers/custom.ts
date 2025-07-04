import { Router } from 'express';

import CustomController from '../controllers/custom';

const customRouter = Router();

customRouter.put('/wwcd-team', CustomController.updateWWCDTeam);
customRouter.put('/match-results', CustomController.updateMatchResult);
customRouter.put('/overall-results', CustomController.updateOverallResults);

export default customRouter;
