import express, { Request, Response, NextFunction } from 'express';
import subscriptionController from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Rotas protegidas (requerem autenticação)
router.post('/checkout', authenticate, (req: Request, res: Response) => subscriptionController.generateCheckoutLink(req, res));
router.post('/cancel', authenticate, (req: Request, res: Response) => subscriptionController.cancelSubscription(req, res));
router.post('/reactivate', authenticate, (req: Request, res: Response) => subscriptionController.reactivateSubscription(req, res));
router.get('/status', authenticate, (req: Request, res: Response) => subscriptionController.getSubscriptionStatus(req, res));

// Rota para webhook (não requer autenticação)
router.post('/webhook', (req: Request, res: Response) => subscriptionController.processWebhook(req, res));

export default router; 