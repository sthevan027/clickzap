const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, checkPlan } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const LoggerService = require('../services/loggerService');

// Middleware específico para admin
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findByPk(decoded.id);

    if (!admin || decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Rotas de autenticação
router.post('/login', rateLimit(5, 60), adminController.login);

// Rotas protegidas
router.use(adminAuth);

// Dashboard
router.get('/dashboard', adminController.dashboard);

// Gerenciamento de usuários
router.get('/users', adminController.listUsers);
router.put('/users/:userId/status', adminController.toggleUserStatus);
router.put('/users/:userId/plan', adminController.updatePlan);

// Gerenciamento de promoções
router.post('/promotions', adminController.createPromotion);
router.get('/promotions', adminController.listPromotions);
router.put('/promotions/:id', adminController.updatePromotion);
router.delete('/promotions/:id', adminController.deletePromotion);

// Monitoramento
router.get('/logs', adminController.accessLogs);
router.get('/logs/:userId', adminController.userLogs);

// Configurações
router.put('/settings/plans', adminController.updatePlanSettings);
router.put('/settings/prices', adminController.updatePrices);

// Middleware de log para todas as rotas admin
router.use((req, res, next) => {
  LoggerService.info('Admin action', {
    adminId: req.admin.id,
    path: req.path,
    method: req.method,
    body: req.body
  });
  next();
});

module.exports = router; 