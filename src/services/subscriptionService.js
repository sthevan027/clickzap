const axios = require('axios');
const config = require('../config/hotmart');
const logger = require('../config/logger');
const { getHotmartToken } = require('../utils/auth');
const db = require('../database/db');

class SubscriptionService {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://developers.hotmart.com/payments/api/v1'
    });
  }

  async generateCheckoutLink(plan) {
    try {
      const product = config.products[plan];
      if (!product) {
        throw new Error('Plano inválido');
      }

      const token = await getHotmartToken();
      
      const response = await this.api.post('/checkout/create', {
        product_id: product.id,
        offer_code: product.offer,
        price: product.price
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      return response.data.checkout_url;
    } catch (error) {
      logger.error('Erro ao gerar link de checkout:', error);
      throw error;
    }
  }

  async validateWebhook(token, data) {
    try {
      // Validar token do webhook
      if (token !== config.webhook_token) {
        throw new Error('Token inválido');
      }

      // Validar dados obrigatórios
      if (!data.transaction || !data.status) {
        throw new Error('Dados incompletos');
      }

      return true;
    } catch (error) {
      logger.error('Erro na validação do webhook:', error);
      throw error;
    }
  }

  async processSubscriptionUpdate(userId, planData) {
    try {
      // Validar plano
      if (!config.products[planData.plan]) {
        throw new Error('Plano inválido');
      }

      // Atualizar plano no banco de dados
      await db.subscription.update({
        where: { userId },
        data: {
          plan: planData.plan,
          status: planData.status,
          updatedAt: new Date()
        }
      });

      logger.info(`Plano atualizado para usuário ${userId}`);
      return true;
    } catch (error) {
      logger.error('Erro ao atualizar plano:', error);
      throw error;
    }
  }

  async cancelSubscription(userId) {
    try {
      await db.subscription.update({
        where: { userId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });

      logger.info(`Assinatura cancelada para usuário ${userId}`);
      return true;
    } catch (error) {
      logger.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  async reactivateSubscription(userId) {
    try {
      await db.subscription.update({
        where: { userId },
        data: {
          status: 'ACTIVE',
          cancelledAt: null
        }
      });

      logger.info(`Assinatura reativada para usuário ${userId}`);
      return true;
    } catch (error) {
      logger.error('Erro ao reativar assinatura:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(userId) {
    try {
      const subscription = await db.subscription.findUnique({
        where: { userId },
        select: {
          plan: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          cancelledAt: true
        }
      });

      if (!subscription) {
        throw new Error('Assinatura não encontrada');
      }

      return subscription;
    } catch (error) {
      logger.error('Erro ao consultar status da assinatura:', error);
      throw error;
    }
  }
}

module.exports = new SubscriptionService(); 