import type { NextFunction, Request, RequestHandler, Response } from 'express';

import type { AuthorizedRequest } from '../lib/types';

export function wrapGeneralHandler(
  handler: (req: AuthorizedRequest, res: Response, next: NextFunction) => void
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req as AuthorizedRequest, res, next);
  };
}
