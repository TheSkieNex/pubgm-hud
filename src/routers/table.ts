import { Router } from 'express';

import TableController from '@/controllers/table';

const tableRouter = Router();

tableRouter.post('/init', TableController.init);

export default tableRouter;
