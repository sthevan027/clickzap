const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de perfil
router.put('/profile', userController.updateProfile);

// Rotas de assinatura
router.get('/subscription', userController.getSubscription);

// Rotas de WhatsApp
router.get('/whatsapp/status', userController.getWhatsappStatus);
router.post('/whatsapp/disconnect', userController.disconnectWhatsapp);

// Rotas de créditos e estatísticas
router.get('/credits', userController.getCredits);
router.get('/stats', userController.getUsageStats);

// Rota de desativação de conta
router.post('/deactivate', userController.deactivateAccount);

module.exports = router; 