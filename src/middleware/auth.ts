import { NextApiRequest, NextApiResponse } from 'next';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { getSession } from 'next-auth/react';
import User from '../models/User';
import SubscriptionService from '../services/SubscriptionService';
import logger from '../config/logger';
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    // Verifica a sessão do Next Auth
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Busca o usuário no banco de dados
    const user = await User.findOne({ email: session.user?.email });
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Verifica o status da assinatura
    await SubscriptionService.verifySubscription(user._id);

    // Verifica se o usuário está ativo
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Conta suspensa ou inativa' });
    }

    // Adiciona o usuário ao request
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(500).json({ error: 'Erro de autenticação' });
  }
}

export async function checkCredits(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void,
  type: 'message' | 'media'
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const hasCredits = await SubscriptionService.checkCredits(req.user._id, type);
    if (!hasCredits) {
      return res.status(403).json({
        error: 'Créditos insuficientes',
        type: 'credits_exceeded',
        plan: req.user.plan,
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar créditos:', error);
    return res.status(500).json({ error: 'Erro ao verificar créditos' });
  }
}

export function generateToken(userId: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não está definido');
  }
  
  const secret: Secret = process.env.JWT_SECRET;
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN ? Number(process.env.JWT_EXPIRES_IN) : '24h'
  };
  
  return jwt.sign({ userId }, secret, options);
}

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
}; 