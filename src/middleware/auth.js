const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger').logger;

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Token não fornecido');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    logger.info(`Usuário autenticado: ${decoded.id}`);
    next();
  } catch (error) {
    logger.error('Erro de autenticação:', error);
    res.status(401).json({ error: 'Não autorizado' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Token não fornecido');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      throw new Error('Acesso restrito a administradores');
    }

    req.user = decoded;
    logger.info(`Admin autenticado: ${decoded.id}`);
    next();
  } catch (error) {
    logger.error('Erro de autenticação admin:', error);
    res.status(403).json({ error: 'Acesso negado' });
  }
};

// Middleware para verificar créditos do usuário
const checkCredits = async (req, res, next) => {
    try {
        const { type } = req.body;
        const user = req.user;

        // Verifica o tipo de mensagem e os créditos correspondentes
        if (type === 'text' && user.credits.messages <= 0) {
            return res.status(403).json({
                success: false,
                message: 'Créditos de mensagens esgotados'
            });
        }

        if (type !== 'text' && user.credits.media <= 0) {
            return res.status(403).json({
                success: false,
                message: 'Créditos de mídia esgotados'
            });
        }

        next();
    } catch (error) {
        logger.error('Erro ao verificar créditos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao verificar créditos'
        });
    }
};

const checkPlan = (requiredPlan) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (user.plan === 'premium') {
        return next();
      }

      if (user.plan === 'basic' && requiredPlan !== 'premium') {
        return next();
      }

      if (user.plan === 'free' && requiredPlan === 'free') {
        return next();
      }

      res.status(403).json({ 
        error: 'Este recurso requer um plano superior',
        requiredPlan,
        currentPlan: user.plan
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao verificar plano' });
    }
  };
};

module.exports = {
  auth,
  adminAuth,
  checkCredits,
  checkPlan
}; 