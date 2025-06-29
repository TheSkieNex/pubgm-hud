import { Router } from 'express';

import TableController from '../controllers/table';

const tablesRouter = Router();

tablesRouter.post('/init', TableController.init);
tablesRouter.get('/', TableController.getAll);
tablesRouter.get('/:uuid', TableController.get);
tablesRouter.get('/:uuid/check', TableController.check);
tablesRouter.post('/teams-info', TableController.teamsInfo);
tablesRouter.patch('/:uuid/reset-match-elims', TableController.resetMatchElims);
tablesRouter.post('/players-info', TableController.playersInfo);
tablesRouter.delete('/:uuid', TableController.delete);

export default tablesRouter;
