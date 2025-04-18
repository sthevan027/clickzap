import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    role: string;
  };
}

export function verifyToken(token: string): { id: string; role: string } | null {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não está definido');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export function isAdmin(req: AuthenticatedRequest): boolean {
  return req.user?.role === 'admin';
}

export function requireAdmin(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    return handler(req, res);
  };
} 