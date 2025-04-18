const express = require('express');
const { rateLimit } = require('express-rate-limit');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Rate limiting para tentativas de login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // limite de 5 tentativas
    message: {
        success: false,
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    }
});

// Rate limiting para registro
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // limite de 3 tentativas
    message: {
        success: false,
        message: 'Muitas tentativas de registro. Tente novamente em 1 hora.'
    }
});

// Rotas públicas
router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Rotas protegidas
router.get('/me', auth, authController.me);
router.post('/update-password', auth, authController.updatePassword);

module.exports = router; 