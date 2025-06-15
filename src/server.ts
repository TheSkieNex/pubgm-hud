import express from 'express';

import Config from './config';
import router from './router';

const app = express();

app.use('/api', router);

app.listen(Config.PORT, () => {
  console.log(`Server is running on port ${Config.PORT}`);
});
