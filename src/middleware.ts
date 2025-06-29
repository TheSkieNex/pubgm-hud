import { Request, Response, NextFunction } from 'express';

import Config from './config';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const accessKey = req.headers['x-access-key'];

  if (req.headers.origin && Config.ALLOWED_ORIGINS.includes(req.headers.origin)) {
    next();
    return;
  } else {
    if (req.method === 'OPTIONS' || req.method === 'GET') {
      next();
      return;
    }
  
    if (accessKey !== Config.ACCESS_KEY) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
  }

  next();
}
