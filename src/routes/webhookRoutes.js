const express = require('express');
const router = express.Router();
const hotmartService = require('../services/HotmartService');
const logger = require('../config/logger');

// Middleware para verificar token do Hotmart
const verifyHotmartToken = (req, res, next) => {
    const token = req.header('X-Hotmart-Webhook-Token');
    
    if (!token || token !== process.env.HOTMART_WEBHOOK_TOKEN) {
        logger.warn('Tentativa de acesso ao webhook com token inválido');
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
    
    next();
};

// Rota para webhooks do Hotmart
router.post('/hotmart', verifyHotmartToken, async (req, res) => {
    try {
        await hotmartService.processWebhook(req.body);
        
        res.json({
            success: true,
            message: 'Webhook processado com sucesso'
        });
    } catch (error) {
        logger.error('Erro ao processar webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar webhook'
        });
    }
});

module.exports = router; 