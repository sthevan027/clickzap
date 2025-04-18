const subscriptionService = require('../services/subscriptionService');
const logger = require('../config/logger');

class PaymentController {
  // Gera link de pagamento
  async generatePaymentLink(req, res) {
    try {
      const { plan } = req.body;
      
      if (!plan) {
        return res.status(400).json({ 
          error: 'Plano não especificado' 
        });
      }

      const checkoutUrl = await subscriptionService.generateCheckoutLink(plan);
      
      return res.json({ 
        checkoutUrl 
      });
    } catch (error) {
      logger.error('Erro ao gerar link de pagamento:', error);
      return res.status(500).json({ 
        error: 'Erro ao gerar link de pagamento' 
      });
    }
  }

  // Processa webhook do Hotmart
  async handleWebhook(req, res) {
    try {
      const token = req.headers['x-webhook-token'];
      const webhookData = req.body;

      // Validar webhook
      await subscriptionService.validateWebhook(token, webhookData);

      // Processar dados do webhook
      const { transaction, status, user_id } = webhookData;

      // Atualizar assinatura baseado no status
      await subscriptionService.processSubscriptionUpdate(user_id, {
        transaction_id: transaction,
        status: status
      });

      return res.json({ success: true });
    } catch (error) {
      logger.error('Erro ao processar webhook:', error);
      return res.status(500).json({ 
        error: 'Erro ao processar notificação' 
      });
    }
  }

  // Atualiza plano do usuário
  async updatePlan(req, res) {
    try {
      const { userId } = req.params;
      const { plan } = req.body;

      if (!plan) {
        return res.status(400).json({ 
          error: 'Plano não especificado' 
        });
      }

      await subscriptionService.processSubscriptionUpdate(userId, {
        plan,
        status: 'ACTIVE'
      });

      return res.json({ 
        message: 'Plano atualizado com sucesso' 
      });
    } catch (error) {
      logger.error('Erro ao atualizar plano:', error);
      return res.status(500).json({ 
        error: 'Erro ao atualizar plano' 
      });
    }
  }

  // Cancela assinatura
  async cancelSubscription(req, res) {
    try {
      const { userId } = req.params;
      
      await subscriptionService.cancelSubscription(userId);

      return res.json({ 
        message: 'Assinatura cancelada com sucesso' 
      });
    } catch (error) {
      logger.error('Erro ao cancelar assinatura:', error);
      return res.status(500).json({ 
        error: 'Erro ao cancelar assinatura' 
      });
    }
  }

  // Reativa assinatura
  async reactivateSubscription(req, res) {
    try {
      const { userId } = req.params;
      
      await subscriptionService.reactivateSubscription(userId);

      return res.json({ 
        message: 'Assinatura reativada com sucesso' 
      });
    } catch (error) {
      logger.error('Erro ao reativar assinatura:', error);
      return res.status(500).json({ 
        error: 'Erro ao reativar assinatura' 
      });
    }
  }

  // Obtém status da assinatura
  async getSubscriptionStatus(req, res) {
    try {
      const { userId } = req.params;
      
      const status = await subscriptionService.getSubscriptionStatus(userId);

      return res.json(status);
    } catch (error) {
      logger.error('Erro ao consultar status da assinatura:', error);
      return res.status(500).json({ 
        error: 'Erro ao consultar status da assinatura' 
      });
    }
  }
}

module.exports = new PaymentController(); 