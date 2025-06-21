import express from 'express';

import Config from './config';
import logger from './config/logger';
import router from './router';

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(express.static(Config.STATIC_DIR));

app.use('/lottie-sync', express.static(Config.LOTTIE_SYNC_DIR_PATH));

app.use('/api/v1', router);

app.listen(Config.PORT, () => {
  logger.info(`Server is running on http://localhost:${Config.PORT}`);
});
