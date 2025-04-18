import { Request, Response } from 'express';
import SubscriptionService from '../services/SubscriptionService';
import logger from '../config/logger';

class SubscriptionController {
  async generateCheckoutLink(req: Request, res: Response) {
    try {
      const { plan } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const checkoutLink = await SubscriptionService.generateCheckoutLink(plan);
      logger.info(`Link de checkout gerado para usuário ${userId}`);
      
      return res.json({ checkoutLink });
    } catch (error) {
      logger.error('Erro ao gerar link de checkout:', error);
      return res.status(500).json({ error: 'Erro ao gerar link de checkout' });
    }
  }

  async processWebhook(req: Request, res: Response) {
    try {
      const { token, data } = req.body;

      const isValid = await SubscriptionService.validateWebhook(token, data);
      if (!isValid) {
        return res.status(400).json({ error: 'Webhook inválido' });
      }

      const { userId, plan, status } = data;
      await SubscriptionService.processSubscriptionUpdate(userId, plan, status);
      
      logger.info(`Webhook processado com sucesso para usuário ${userId}`);
      return res.status(200).json({ message: 'Webhook processado com sucesso' });
    } catch (error) {
      logger.error('Erro ao processar webhook:', error);
      return res.status(500).json({ error: 'Erro ao processar webhook' });
    }
  }

  async cancelSubscription(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      await SubscriptionService.cancelSubscription(userId);
      logger.info(`Assinatura cancelada para usuário ${userId}`);
      
      return res.json({ message: 'Assinatura cancelada com sucesso' });
    } catch (error) {
      logger.error('Erro ao cancelar assinatura:', error);
      return res.status(500).json({ error: 'Erro ao cancelar assinatura' });
    }
  }

  async reactivateSubscription(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      await SubscriptionService.reactivateSubscription(userId);
      logger.info(`Assinatura reativada para usuário ${userId}`);
      
      return res.json({ message: 'Assinatura reativada com sucesso' });
    } catch (error) {
      logger.error('Erro ao reativar assinatura:', error);
      return res.status(500).json({ error: 'Erro ao reativar assinatura' });
    }
  }

  async getSubscriptionStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const status = await SubscriptionService.getSubscriptionStatus(userId);
      logger.info(`Status da assinatura obtido para usuário ${userId}`);
      
      return res.json(status);
    } catch (error) {
      logger.error('Erro ao obter status da assinatura:', error);
      return res.status(500).json({ error: 'Erro ao obter status da assinatura' });
    }
  }
}

export default new SubscriptionController(); 