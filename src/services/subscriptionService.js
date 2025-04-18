const axios = require('axios');
const config = require('../config/hotmart');
const logger = require('../config/logger').logger;
const { getHotmartToken } = require('../utils/hotmart');
const Subscription = require('../models/Subscription');

const HOTMART_API_URL = 'https://api.hotmart.com/v1';

class SubscriptionService {
  async generateCheckoutLink(plan) {
    try {
      const product = config.products[plan];
      if (!product) {
        throw new Error('Plano inválido');
      }

      const token = await getHotmartToken();
      const response = await axios.post(
        `${HOTMART_API_URL}/sales/checkout`,
        {
          product: {
            id: product.id
          },
          buyer: {
            email: 'comprador@exemplo.com'
          },
          offer: {
            code: product.offerCode
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.checkoutUrl;
    } catch (error) {
      logger.error('Erro ao gerar link de checkout:', error);
      throw error;
    }
  }

  async validateWebhook(data) {
    try {
      const { token, event } = data;
      if (!token || !event) {
        throw new Error('Dados do webhook inválidos');
      }

      // Validar token do webhook
      const isValid = await this.validateWebhookToken(token);
      if (!isValid) {
        throw new Error('Token do webhook inválido');
      }

      return true;
    } catch (error) {
      logger.error('Erro ao validar webhook:', error);
      throw error;
    }
  }

  async processSubscriptionUpdate(data) {
    try {
      const { subscription } = data;
      if (!subscription) {
        throw new Error('Dados da assinatura inválidos');
      }

      // Validar plano
      const plan = this.getPlanByProductId(subscription.product.id);
      if (!plan) {
        throw new Error('Plano inválido');
      }

      // Atualizar ou criar assinatura no banco de dados
      await Subscription.findOneAndUpdate(
        { hotmartSubscriptionId: subscription.id },
        {
          $set: {
            plan,
            status: subscription.status,
            startDate: new Date(subscription.startDate),
            endDate: new Date(subscription.endDate),
            lastPaymentDate: new Date(subscription.lastPaymentDate),
            nextPaymentDate: new Date(subscription.nextPaymentDate),
            price: subscription.price,
            paymentMethod: subscription.paymentMethod,
            metadata: subscription.metadata || {}
          }
        },
        { upsert: true, new: true }
      );

      logger.info(`Assinatura ${subscription.id} atualizada com sucesso`);
      return true;
    } catch (error) {
      logger.error('Erro ao processar atualização de assinatura:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const token = await getHotmartToken();
      await axios.post(
        `${HOTMART_API_URL}/subscriptions/${subscriptionId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Atualizar status no banco de dados
      await Subscription.findOneAndUpdate(
        { hotmartSubscriptionId: subscriptionId },
        {
          $set: {
            status: 'cancelled',
            cancelledAt: new Date()
          }
        }
      );

      logger.info(`Assinatura ${subscriptionId} cancelada com sucesso`);
      return true;
    } catch (error) {
      logger.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  async reactivateSubscription(subscriptionId) {
    try {
      const token = await getHotmartToken();
      await axios.post(
        `${HOTMART_API_URL}/subscriptions/${subscriptionId}/reactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Atualizar status no banco de dados
      await Subscription.findOneAndUpdate(
        { hotmartSubscriptionId: subscriptionId },
        {
          $set: {
            status: 'active',
            cancelledAt: null
          }
        }
      );

      logger.info(`Assinatura ${subscriptionId} reativada com sucesso`);
      return true;
    } catch (error) {
      logger.error('Erro ao reativar assinatura:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(subscriptionId) {
    try {
      const token = await getHotmartToken();
      const response = await axios.get(
        `${HOTMART_API_URL}/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Erro ao obter status da assinatura:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  async validateWebhookToken(token) {
    return token === process.env.HOTMART_WEBHOOK_TOKEN;
  }

  getPlanByProductId(productId) {
    for (const [plan, product] of Object.entries(config.products)) {
      if (product.id === productId) {
        return plan;
      }
    }
    return null;
  }
}

module.exports = new SubscriptionService(); 