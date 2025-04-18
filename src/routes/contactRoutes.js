const express = require('express');
const { auth } = require('../middleware/auth');
const contactController = require('../controllers/contactController');
const router = express.Router();

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas de contatos
router.post('/', contactController.create);
router.get('/', contactController.getContacts);
router.get('/tags', contactController.getTags);
router.get('/stats', contactController.getStats);
router.get('/:id', contactController.getContact);
router.put('/:id', contactController.update);
router.delete('/:id', contactController.delete);

module.exports = router; 