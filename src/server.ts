import express from 'express';
import cors from 'cors';

import Config from './config';
import logger from './config/logger';
import router from './routers';

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:10086'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['*'],
    maxAge: 600,
  })
);

app.use(express.static(Config.STATIC_DIR));

app.use('/lottie-sync', express.static(Config.LOTTIE_SYNC_DIR_PATH));
app.use('/tables', express.static(Config.TABLES_DIR));

app.use('/api', router);

app.listen(Config.PORT, () => {
  logger.info(`Server is running on http://localhost:${Config.PORT}`);
});
