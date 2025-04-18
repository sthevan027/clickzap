const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Rotas protegidas
router.post('/checkout', auth, subscriptionController.generateCheckoutLink);
router.post('/:subscriptionId/cancel', auth, subscriptionController.cancelSubscription);
router.post('/:subscriptionId/reactivate', auth, subscriptionController.reactivateSubscription);
router.get('/:subscriptionId/status', auth, subscriptionController.getSubscriptionStatus);

// Rota para webhook (não requer autenticação)
router.post('/webhook', subscriptionController.processWebhook);

module.exports = router; 