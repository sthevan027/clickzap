const express = require('express');
const router = express.Router();

// Importa rotas
const authRoutes = require('./authRoutes');
const messageRoutes = require('./messageRoutes');
const webhookRoutes = require('./webhookRoutes');
const contactRoutes = require('./contactRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');

// Define prefixos das rotas
router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/contacts', contactRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

// Rota de healthcheck
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

module.exports = router; 