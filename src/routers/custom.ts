import { Router } from 'express';

import CustomController from '../controllers/custom';

const customRouter = Router();

customRouter.put('/wwcd-team', CustomController.updateWWCDTeam);
customRouter.put('/match-results', CustomController.updateMatchResult);
customRouter.put('/overall-results', CustomController.updateOverallResults);
customRouter.put('/overall-results-absolute', CustomController.updateOverallResultsAbsolute);
customRouter.delete(
  '/:tableUUID/reset-match-results/:fileUUID',
  CustomController.resetMatchResults
);
customRouter.delete(
  '/:tableUUID/reset-overall-results/:fileUUID',
  CustomController.resetOverallResults
);

export default customRouter;
