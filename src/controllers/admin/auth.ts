import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import db from '../../db';
import { adminUser } from '../../db/schemas/admin/user';
import { AuthorizedRequest } from '../../lib/types';
import { errorHandler } from '../../lib/decorators/error-handler';

function generateToken(userId: number): string {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

class AuthController {
  @errorHandler()
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await db.select().from(adminUser).where(eq(adminUser.email, email));

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = user[0].password === password;

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user[0].id);

    res.status(200).json({ token });
  }

  @errorHandler()
  static async getUser(req: AuthorizedRequest, res: Response): Promise<void> {
    const user = await db.select().from(adminUser).where(eq(adminUser.id, req.user.id));

    const userData = {
      email: user[0].email,
      createdAt: user[0].createdAt,
    };

    res.status(200).json(userData);
  }
}

export default AuthController;
