import { Request, Response } from 'express';

import logger from '@/config/logger';

type AsyncRequestHandler = (req: Request, res: Response) => Promise<void>;

export function errorHandler() {
  return function (
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value as AsyncRequestHandler;

    descriptor.value = async function (req: Request, res: Response): Promise<void> {
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
