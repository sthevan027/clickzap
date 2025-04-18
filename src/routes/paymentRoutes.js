const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/auth');
const { rateLimiter } = require('../middlewares/rateLimiter');

// Rotas públicas
router.post('/webhook', rateLimiter, paymentController.handleWebhook);

// Rotas protegidas
router.use(authMiddleware);

// Gerar link de pagamento
router.post('/checkout', paymentController.generatePaymentLink);

// Gerenciar assinaturas
router.get('/subscription/:userId', paymentController.getSubscriptionStatus);
router.put('/subscription/:userId', paymentController.updatePlan);
router.post('/subscription/:userId/cancel', paymentController.cancelSubscription);
router.post('/subscription/:userId/reactivate', paymentController.reactivateSubscription);

module.exports = router; 