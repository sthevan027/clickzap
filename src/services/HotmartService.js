const axios = require('axios');
const logger = require('../config/logger');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

class HotmartService {
    constructor() {
        this.baseUrl = 'https://developers.hotmart.com/payments/api/v1';
        this.token = null;
        this.tokenExpiration = null;
    }

    async getAccessToken() {
        try {
            // Verifica se o token ainda é válido
            if (this.token && this.tokenExpiration > Date.now()) {
                return this.token;
            }

            const response = await axios.post('https://api-sec-vlc.hotmart.com/security/oauth/token', {
                grant_type: 'client_credentials',
                client_id: process.env.HOTMART_CLIENT_ID,
                client_secret: process.env.HOTMART_CLIENT_SECRET
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            this.token = response.data.access_token;
            this.tokenExpiration = Date.now() + (response.data.expires_in * 1000);

            return this.token;
        } catch (error) {
            logger.error('Erro ao obter token Hotmart:', error);
            throw new Error('Falha na autenticação com Hotmart');
        }
    }

    async getSubscription(subscriptionId) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            logger.error('Erro ao buscar assinatura Hotmart:', error);
            throw error;
        }
    }

    async processWebhook(data) {
        try {
            const event = data.event;
            logger.info('Processando webhook Hotmart:', { event, data });

            switch (event) {
                case 'PURCHASE_COMPLETE':
                    await this.handlePurchaseComplete(data);
                    break;
                case 'PURCHASE_CANCELED':
                    await this.handlePurchaseCanceled(data);
                    break;
                case 'SUBSCRIPTION_CANCELLATION':
                    await this.handleSubscriptionCancellation(data);
                    break;
                default:
                    logger.warn('Evento Hotmart não tratado:', event);
            }
        } catch (error) {
            logger.error('Erro ao processar webhook Hotmart:', error);
            throw error;
        }
    }

    async handlePurchaseComplete(data) {
        const { subscriber, product, offer, subscription } = data;
        
        try {
            // Busca ou cria usuário
            let user = await User.findOne({ email: subscriber.email });
            
            if (!user) {
                user = await User.create({
                    name: subscriber.name,
                    email: subscriber.email,
                    hotmartCustomerId: subscriber.code,
                    password: Math.random().toString(36).slice(-8) // Senha temporária
                });
            }

            // Determina o plano baseado no produto/oferta
            const plan = this.determinePlan(product.id, offer?.code);
            
            // Cria ou atualiza assinatura
            const subscriptionData = {
                user: user._id,
                hotmartData: {
                    subscriptionId: subscription.code,
                    productId: product.id,
                    offerId: offer?.code,
                    status: 'active'
                },
                plan,
                price: product.price.value,
                startDate: new Date(),
                endDate: new Date(subscription.nextChargeDate),
                lastPayment: {
                    date: new Date(),
                    status: 'approved',
                    transactionId: data.transaction
                }
            };

            await Subscription.findOneAndUpdate(
                { 'hotmartData.subscriptionId': subscription.code },
                subscriptionData,
                { upsert: true, new: true }
            );

            // Atualiza plano do usuário
            user.plan = plan;
            await user.updatePlanCredits();
            await user.save();

            logger.info('Compra processada com sucesso:', { 
                userId: user._id, 
                subscriptionId: subscription.code 
            });

        } catch (error) {
            logger.error('Erro ao processar compra:', error);
            throw error;
        }
    }

    async handlePurchaseCanceled(data) {
        try {
            const subscription = await Subscription.findOne({
                'hotmartData.subscriptionId': data.subscription.code
            });

            if (subscription) {
                await subscription.cancel();
                
                // Atualiza usuário para plano free
                const user = await User.findById(subscription.user);
                if (user) {
                    user.plan = 'free';
                    await user.updatePlanCredits();
                    await user.save();
                }
            }

            logger.info('Cancelamento de compra processado:', {
                subscriptionId: data.subscription.code
            });

        } catch (error) {
            logger.error('Erro ao processar cancelamento de compra:', error);
            throw error;
        }
    }

    async handleSubscriptionCancellation(data) {
        try {
            const subscription = await Subscription.findOne({
                'hotmartData.subscriptionId': data.subscription.code
            });

            if (subscription) {
                subscription.hotmartData.status = 'cancelled';
                subscription.canceledAt = new Date();
                await subscription.save();

                // Agenda mudança para plano free
                const endDate = new Date(subscription.endDate);
                const now = new Date();

                if (endDate <= now) {
                    // Se já passou da data final, muda imediatamente
                    const user = await User.findById(subscription.user);
                    if (user) {
                        user.plan = 'free';
                        await user.updatePlanCredits();
                        await user.save();
                    }
                }
            }

            logger.info('Cancelamento de assinatura processado:', {
                subscriptionId: data.subscription.code
            });

        } catch (error) {
            logger.error('Erro ao processar cancelamento de assinatura:', error);
            throw error;
        }
    }

    determinePlan(productId, offerId) {
        // Lógica baseada na configuração do Hotmart
        const config = require('../config/hotmart');
        
        if (productId === config.basic.productId) {
            return offerId === config.premium.offerId ? 'premium' : 'basic';
        }
        
        return 'basic'; // Plano padrão
    }
}

// Singleton
const hotmartService = new HotmartService();
module.exports = hotmartService; 