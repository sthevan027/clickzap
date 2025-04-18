const express = require('express');
const { auth, checkCredits } = require('../middleware/auth');
const messageController = require('../controllers/messageController');
const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de mensagens
router.post('/send', checkCredits, messageController.send);
router.get('/', messageController.getMessages);
router.get('/stats', messageController.getMessageStats);
router.get('/:id', messageController.getMessage);
router.post('/:id/cancel', messageController.cancelScheduledMessage);
router.post('/:id/resend', checkCredits, messageController.resendMessage);

module.exports = router; 