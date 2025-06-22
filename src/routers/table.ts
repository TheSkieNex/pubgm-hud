import { Router } from 'express';

import TableController from '@/controllers/table';

const tableRouter = Router();

tableRouter.post('/init', TableController.init);
tableRouter.get('/', TableController.getAll);
tableRouter.get('/:uuid', TableController.get);

export default tableRouter;
