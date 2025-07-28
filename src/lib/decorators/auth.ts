import type * as express from 'express';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import db from '../../db';
import { adminUser } from '../../db/schemas/admin/user';
import { AuthorizedRequest } from '../types';

function verifyToken(token: string): { id: number } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
  } catch {
    return null;
  }
}

export function authMiddleware() {
  return async function (req: express.Request, res: express.Response, next: express.NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await db.select().from(adminUser).where(eq(adminUser.id, decoded.id));

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    (req as AuthorizedRequest).user = { id: user[0].id };

    next();
  };
}
