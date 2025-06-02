import express from 'express';

import Config from './config';

import { tableRouter } from './router';

const app = express();

app.use('/table', tableRouter);

app.listen(Config.PORT, () => {
  console.log(`Server is running on port ${Config.PORT}`);
});
