import express from 'express';

import Config from './config';
import logger from './config/logger';
import router from './router';

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(express.static(Config.STATIC_DIR));

app.use('/assets', express.static(Config.STATIC_DIR));

app.use('/api/v1', router);

app.listen(Config.PORT, () => {
  logger.info(`Server is running on http://localhost:${Config.PORT}`);
});
