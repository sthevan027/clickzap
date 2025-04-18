import axios from 'axios';
import dbConnect from '../database/db';
import User from '../models/User';
import { hotmartConfig } from '../config/hotmart';
import logger from '../config/logger';

const HOTMART_API_URL = 'https://api-hot-connect.hotmart.com';

interface PlanLimits {
  messageCredits: number;
  mediaCredits: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    messageCredits: 100,
    mediaCredits: 10,
  },
  basic: {
    messageCredits: 1000,
    mediaCredits: 100,
  },
  premium: {
    messageCredits: 5000,
    mediaCredits: 500,
  },
};

class SubscriptionService {
  private static instance: SubscriptionService;
  private hotmartToken: string | null = null;
  private tokenExpiration: Date | null = null;

  private constructor() {}

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  private async getHotmartToken(): Promise<string> {
    try {
      const response = await axios.post(`${HOTMART_API_URL}/oauth/token`, {
        client_id: process.env.HOTMART_CLIENT_ID,
        client_secret: process.env.HOTMART_CLIENT_SECRET,
        grant_type: 'client_credentials'
      });
      return response.data.access_token;
    } catch (error) {
      logger.error('Erro ao obter token Hotmart:', error);
      throw new Error('Falha ao autenticar com Hotmart');
    }
  }

  public async verifySubscription(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('Usuário não encontrado');

      if (!user.subscriptionId) {
        user.plan = 'free';
        await user.save();
        return;
      }

      const token = await this.getHotmartToken();
      const response = await axios.get(
        `https://api-hot-connect.hotmart.com/subscription/rest/v2/subscriptions/${user.subscriptionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const subscription = response.data;
      const newStatus = this.mapHotmartStatus(subscription.status);

      if (user.subscriptionStatus !== newStatus) {
        user.subscriptionStatus = newStatus;
        user.plan = newStatus === 'active' ? this.mapHotmartPlan(subscription.plan) : 'free';
        await user.save();
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      throw new Error('Falha ao verificar assinatura');
    }
  }

  public async processHotmartWebhook(data: any): Promise<void> {
    try {
      const user = await User.findOne({ email: data.buyer.email });
      if (!user) return;

      const status = this.mapHotmartStatus(data.purchase.status);
      const plan = this.mapHotmartPlan(data.product.id);

      user.subscriptionId = data.purchase.transaction;
      user.subscriptionStatus = status;
      user.plan = status === 'active' ? plan : 'free';

      if (status === 'active') {
        user.messageCredits = PLAN_LIMITS[plan].messageCredits;
        user.mediaCredits = PLAN_LIMITS[plan].mediaCredits;
      }

      await user.save();
    } catch (error) {
      console.error('Erro ao processar webhook Hotmart:', error);
      throw new Error('Falha ao processar webhook');
    }
  }

  private mapHotmartStatus(status: string): string {
    const statusMap: Record<string, string> = {
      approved: 'active',
      completed: 'active',
      canceled: 'inactive',
      expired: 'inactive',
      refunded: 'inactive',
      chargeback: 'suspended',
    };
    return statusMap[status] || 'inactive';
  }

  private mapHotmartPlan(productId: string): 'basic' | 'premium' {
    return productId === process.env.HOTMART_BASIC_PRODUCT_ID ? 'basic' : 'premium';
  }

  public async checkCredits(userId: string, type: 'message' | 'media'): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('Usuário não encontrado');

      const credits = type === 'message' ? user.messageCredits : user.mediaCredits;
      return credits > 0;
    } catch (error) {
      console.error('Erro ao verificar créditos:', error);
      throw new Error('Falha ao verificar créditos');
    }
  }

  public async deductCredits(userId: string, type: 'message' | 'media'): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('Usuário não encontrado');

      if (type === 'message') {
        user.messageCredits = Math.max(0, user.messageCredits - 1);
      } else {
        user.mediaCredits = Math.max(0, user.mediaCredits - 1);
      }

      await user.save();
    } catch (error) {
      console.error('Erro ao deduzir créditos:', error);
      throw new Error('Falha ao deduzir créditos');
    }
  }

  async validateSubscription(userId: string): Promise<boolean> {
    try {
      const token = await this.getHotmartToken();
      const response = await axios.get(`https://api-hot-connect.hotmart.com/subscription/rest/v2/subscriptions/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.status === 'ACTIVE';
    } catch (error) {
      console.error('Erro ao validar assinatura:', error);
      return false;
    }
  }

  async getSubscriptionDetails(userId: string): Promise<any> {
    try {
      const token = await this.getHotmartToken();
      const response = await axios.get(`https://api-hot-connect.hotmart.com/subscription/rest/v2/subscriptions/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao obter detalhes da assinatura:', error);
      throw new Error('Falha ao obter detalhes da assinatura');
    }
  }

  async generateCheckoutLink(plan: 'basic' | 'premium'): Promise<string> {
    try {
      const planConfig = hotmartConfig[plan];
      if (!planConfig) {
        throw new Error('Plano inválido');
      }

      return `https://pay.hotmart.com/${planConfig.productId}?off=${planConfig.offerCode}`;
    } catch (error) {
      logger.error('Erro ao gerar link de checkout:', error);
      throw error;
    }
  }

  async validateWebhook(token: string, data: any): Promise<boolean> {
    try {
      if (!token || !data) {
        return false;
      }

      // Implementar validação específica do webhook aqui
      return true;
    } catch (error) {
      logger.error('Erro na validação do webhook:', error);
      return false;
    }
  }

  async processSubscriptionUpdate(userId: string, plan: string, status: string): Promise<void> {
    try {
      await dbConnect();
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      user.subscription = {
        plan,
        status,
        updatedAt: new Date()
      };

      await user.save();
      logger.info(`Assinatura atualizada para usuário ${userId}`);
    } catch (error) {
      logger.error('Erro ao processar atualização da assinatura:', error);
      throw error;
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    try {
      await dbConnect();
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      user.subscription.status = 'cancelled';
      user.subscription.updatedAt = new Date();
      await user.save();
      
      logger.info(`Assinatura cancelada para usuário ${userId}`);
    } catch (error) {
      logger.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  async reactivateSubscription(userId: string): Promise<void> {
    try {
      await dbConnect();
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      user.subscription.status = 'active';
      user.subscription.updatedAt = new Date();
      await user.save();

      logger.info(`Assinatura reativada para usuário ${userId}`);
    } catch (error) {
      logger.error('Erro ao reativar assinatura:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(userId: string): Promise<any> {
    try {
      await dbConnect();
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return user.subscription;
    } catch (error) {
      logger.error('Erro ao obter status da assinatura:', error);
      throw error;
    }
  }
}

export default SubscriptionService.getInstance(); 