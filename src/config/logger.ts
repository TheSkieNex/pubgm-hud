import winston from 'winston';

import Config from '.';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.prettyPrint()),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error', dirname: Config.LOG_DIR }),
    new winston.transports.File({ filename: 'info.log', level: 'info', dirname: Config.LOG_DIR }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;
