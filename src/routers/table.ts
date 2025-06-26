import { Router } from 'express';

import TableController from '../controllers/table';

const tableRouter = Router();

tableRouter.post('/init', TableController.init);
tableRouter.get('/', TableController.getAll);
tableRouter.get('/:uuid', TableController.get);
tableRouter.post('/teams-info', TableController.teamsInfo);
tableRouter.patch('/:uuid/reset-match-elims', TableController.resetMatchElims);
tableRouter.post('/players-info', TableController.playersInfo);

export default tableRouter;
