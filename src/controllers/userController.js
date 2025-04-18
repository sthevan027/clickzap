const User = require('../models/User');
const Subscription = require('../models/Subscription');
const whatsappService = require('../services/WhatsappService');
const logger = require('../config/logger');
const WhatsAppService = require('../services/whatsappService');
const SubscriptionService = require('../services/subscriptionService');

class UserController {
    async updateProfile(req, res) {
        try {
            const updates = Object.keys(req.body);
            const allowedUpdates = ['name', 'email', 'password', 'notifications'];
            
            const isValidOperation = updates.every(update => 
                allowedUpdates.includes(update)
            );

            if (!isValidOperation) {
                return res.status(400).json({ error: 'Campos de atualização inválidos' });
            }

            updates.forEach(update => {
                req.user[update] = req.body[update];
            });

            await req.user.save();
            
            logger.info(`Perfil atualizado para usuário ${req.user.email}`);
            
            res.json({ message: 'Perfil atualizado com sucesso' });
        } catch (error) {
            logger.error('Erro ao atualizar perfil:', error);
            res.status(500).json({ error: 'Erro ao atualizar perfil' });
        }
    }

    async getSubscription(req, res) {
        try {
            const subscription = await SubscriptionService.getSubscription(req.user.id);
            res.json(subscription);
        } catch (error) {
            logger.error('Erro ao buscar assinatura:', error);
            res.status(500).json({ error: 'Erro ao buscar assinatura' });
        }
    }

    async getWhatsAppStatus(req, res) {
        try {
            const status = await WhatsAppService.getStatus(req.user.id);
            res.json(status);
        } catch (error) {
            logger.error('Erro ao buscar status do WhatsApp:', error);
            res.status(500).json({ error: 'Erro ao buscar status do WhatsApp' });
        }
    }

    async disconnectWhatsApp(req, res) {
        try {
            await WhatsAppService.disconnect(req.user.id);
            logger.info(`WhatsApp desconectado para usuário ${req.user.email}`);
            res.json({ message: 'WhatsApp desconectado com sucesso' });
        } catch (error) {
            logger.error('Erro ao desconectar WhatsApp:', error);
            res.status(500).json({ error: 'Erro ao desconectar WhatsApp' });
        }
    }

    async getCredits(req, res) {
        try {
            res.json({ credits: req.user.credits });
        } catch (error) {
            logger.error('Erro ao buscar créditos:', error);
            res.status(500).json({ error: 'Erro ao buscar créditos' });
        }
    }

    async getStats(req, res) {
        try {
            const stats = {
                messagesCount: req.user.messagesCount,
                campaignsCount: req.user.campaignsCount,
                contactsCount: req.user.contactsCount,
                lastActive: req.user.lastActive
            };
            res.json(stats);
        } catch (error) {
            logger.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({ error: 'Erro ao buscar estatísticas' });
        }
    }

    async deactivateAccount(req, res) {
        try {
            req.user.active = false;
            await req.user.save();
            
            logger.info(`Conta desativada para usuário ${req.user.email}`);
            
            res.json({ message: 'Conta desativada com sucesso' });
        } catch (error) {
            logger.error('Erro ao desativar conta:', error);
            res.status(500).json({ error: 'Erro ao desativar conta' });
        }
    }
}

module.exports = new UserController(); 