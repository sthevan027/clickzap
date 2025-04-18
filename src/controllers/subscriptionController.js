const subscriptionService = require('../services/subscriptionService');
const logger = require('../config/logger').logger;

class SubscriptionController {
  async generateCheckoutLink(req, res) {
    try {
      const { plan } = req.body;
      const userId = req.user.id;

      if (!plan) {
        return res.status(400).json({ error: 'Plano é obrigatório' });
      }

      const checkoutUrl = await subscriptionService.generateCheckoutLink(plan);
      
      logger.info(`Link de checkout gerado para usuário ${userId} - Plano: ${plan}`);
      
      return res.json({ checkoutUrl });
    } catch (error) {
      logger.error('Erro ao gerar link de checkout:', error);
      return res.status(500).json({ error: 'Erro ao gerar link de checkout' });
    }
  }

  async processWebhook(req, res) {
    try {
      const { token, event, data } = req.body;

      // Validar webhook
      const isValid = await subscriptionService.validateWebhook({ token, event });
      if (!isValid) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      // Processar evento
      switch (event) {
        case 'SUBSCRIPTION_CREATED':
        case 'SUBSCRIPTION_UPDATED':
          await subscriptionService.processSubscriptionUpdate(data);
          break;
        case 'SUBSCRIPTION_CANCELLED':
          await subscriptionService.cancelSubscription(data.subscription.id);
          break;
        case 'SUBSCRIPTION_REACTIVATED':
          await subscriptionService.reactivateSubscription(data.subscription.id);
          break;
        default:
          logger.warn(`Evento não tratado: ${event}`);
      }

      logger.info(`Webhook processado com sucesso - Evento: ${event}`);
      return res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Erro ao processar webhook:', error);
      return res.status(500).json({ error: 'Erro ao processar webhook' });
    }
  }

  async cancelSubscription(req, res) {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user.id;

      await subscriptionService.cancelSubscription(subscriptionId);
      
      logger.info(`Assinatura ${subscriptionId} cancelada pelo usuário ${userId}`);
      
      return res.json({ success: true });
    } catch (error) {
      logger.error('Erro ao cancelar assinatura:', error);
      return res.status(500).json({ error: 'Erro ao cancelar assinatura' });
    }
  }

  async reactivateSubscription(req, res) {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user.id;

      await subscriptionService.reactivateSubscription(subscriptionId);
      
      logger.info(`Assinatura ${subscriptionId} reativada pelo usuário ${userId}`);
      
      return res.json({ success: true });
    } catch (error) {
      logger.error('Erro ao reativar assinatura:', error);
      return res.status(500).json({ error: 'Erro ao reativar assinatura' });
    }
  }

  async getSubscriptionStatus(req, res) {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user.id;

      const status = await subscriptionService.getSubscriptionStatus(subscriptionId);
      
      logger.info(`Status da assinatura ${subscriptionId} consultado pelo usuário ${userId}`);
      
      return res.json(status);
    } catch (error) {
      logger.error('Erro ao obter status da assinatura:', error);
      return res.status(500).json({ error: 'Erro ao obter status da assinatura' });
    }
  }
}

module.exports = new SubscriptionController(); 