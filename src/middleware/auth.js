const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

module.exports = async (req, res, next) => {
  try {
    // Verifica se o token está presente no header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Busca o usuário no banco
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (!user.active) {
      return res.status(401).json({ error: 'Conta desativada' });
    }

    // Adiciona o usuário ao objeto da requisição
    req.user = user;
    
    logger.info(`Usuário ${user.email} autenticado com sucesso`);
    
    next();
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar se o usuário é admin
const adminAuth = async (req, res, next) => {
    try {
        // Primeiro executa a autenticação normal
        await auth(req, res, () => {
            // Verifica se o usuário é admin
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado - apenas administradores'
                });
            }
            next();
        });
    } catch (error) {
        logger.error('Erro na autenticação de admin:', error);
        res.status(500).json({
            success: false,
            message: 'Erro na autenticação'
        });
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