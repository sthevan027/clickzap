const { Router } = require('express');
const authMiddleware = require('./middlewares/auth');
const AuthController = require('./controllers/auth.controller');
const WhatsappController = require('./controllers/whatsapp.controller');
const HotmartController = require('./controllers/hotmart.controller');

const routes = Router();

// Rotas públicas
routes.post('/auth/register', AuthController.register);
routes.post('/auth/login', AuthController.login);

// Webhook da Hotmart
routes.post('/webhooks/hotmart', HotmartController.handleWebhook.bind(HotmartController));

// Middleware de autenticação
routes.use(authMiddleware);

// Rotas autenticadas
routes.get('/auth/me', AuthController.me);

// Rotas do WhatsApp
routes.post('/whatsapp/instances', WhatsappController.create);
routes.get('/whatsapp/instances', WhatsappController.list);
routes.get('/whatsapp/instances/:id', WhatsappController.getStatus);
routes.delete('/whatsapp/instances/:id', WhatsappController.delete);

module.exports = routes; 