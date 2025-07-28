import type * as express from 'express';

import logger from '../../config/logger';

export function errorHandler() {
  return function (
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value as (
      req: express.Request,
      res: express.Response
    ) => Promise<void>;

    descriptor.value = async function (req: express.Request, res: express.Response): Promise<void> {
      try {
        await originalMethod.call(this, req, res);
      } catch (error) {
        logger.error('API Error:', {
          endpoint: `${req.method} ${req.path}`,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });

        res.status(500).json({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        });
      }
    };

    return descriptor;
  };
}
