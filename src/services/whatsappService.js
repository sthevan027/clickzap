const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../config/logger');
const User = require('../models/User');
const Message = require('../models/Message');
const Contact = require('../models/Contact');

class WhatsAppService {
    constructor() {
        this.clients = new Map();
        this.qrCodes = new Map();
        this.initializeClients();
    }

    async initializeClients() {
        try {
            // Recupera usuários ativos
            const users = await User.find({ status: 'active' });
            
            for (const user of users) {
                await this.initializeClient(user._id.toString());
            }
        } catch (error) {
            logger.error('Erro ao inicializar clientes WhatsApp:', error);
        }
    }

    async initializeClient(userId) {
        try {
            if (this.clients.has(userId)) {
                return this.clients.get(userId);
            }

            const client = new Client({
                puppeteer: {
                    args: ['--no-sandbox']
                }
            });

            client.on('qr', async (qr) => {
                const qrCodeImage = await qrcode.toDataURL(qr);
                this.qrCodes.set(userId, qrCodeImage);
                logger.info(`QR Code gerado para usuário ${userId}`);
            });

            client.on('ready', () => {
                this.qrCodes.delete(userId);
                logger.info(`WhatsApp conectado para usuário ${userId}`);
            });

            client.on('disconnected', () => {
                this.clients.delete(userId);
                this.qrCodes.delete(userId);
                logger.info(`WhatsApp desconectado para usuário ${userId}`);
            });

            await client.initialize();
            
            this.clients.set(userId, client);
            return client;
        } catch (error) {
            logger.error('Erro ao inicializar cliente WhatsApp:', error);
            throw new Error('Erro ao inicializar WhatsApp');
        }
    }

    async getStatus(userId) {
        try {
            const client = this.clients.get(userId);
            const qrCode = this.qrCodes.get(userId);

            return {
                connected: client?.isConnected() || false,
                qrCode: qrCode || null
            };
        } catch (error) {
            logger.error('Erro ao buscar status do WhatsApp:', error);
            throw new Error('Erro ao buscar status do WhatsApp');
        }
    }

    async sendMessage(userId, number, message) {
        try {
            const client = await this.getClient(userId);
            const formattedNumber = this.formatNumber(number);
            
            await client.sendMessage(`${formattedNumber}@c.us`, message);
            logger.info(`Mensagem enviada para ${formattedNumber}`);
            
            return true;
        } catch (error) {
            logger.error('Erro ao enviar mensagem:', error);
            throw new Error('Erro ao enviar mensagem');
        }
    }

    async sendMedia(userId, number, mediaUrl, caption) {
        try {
            const client = await this.getClient(userId);
            const formattedNumber = this.formatNumber(number);
            const media = await MessageMedia.fromUrl(mediaUrl);
            
            await client.sendMessage(`${formattedNumber}@c.us`, media, {
                caption: caption
            });
            
            logger.info(`Mídia enviada para ${formattedNumber}`);
            return true;
        } catch (error) {
            logger.error('Erro ao enviar mídia:', error);
            throw new Error('Erro ao enviar mídia');
        }
    }

    async disconnect(userId) {
        try {
            const client = this.clients.get(userId);
            if (client) {
                await client.destroy();
                this.clients.delete(userId);
                this.qrCodes.delete(userId);
                logger.info(`Cliente WhatsApp desconectado para usuário ${userId}`);
            }
        } catch (error) {
            logger.error('Erro ao desconectar WhatsApp:', error);
            throw new Error('Erro ao desconectar WhatsApp');
        }
    }

    async getClient(userId) {
        const client = this.clients.get(userId);
        if (!client) {
            return this.initializeClient(userId);
        }
        return client;
    }

    formatNumber(number) {
        return number.replace(/\D/g, '');
    }

    // Método para processar mensagens pendentes
    async processPendingMessages() {
        try {
            const pendingMessages = await Message.findPendingMessages();
            
            for (const message of pendingMessages) {
                if (message.user.status !== 'active' || !message.user.credits) {
                    continue;
                }

                try {
                    await this.sendMessage(message.user._id.toString(), message.recipient, message.content);

                    await message.updateStatus('sent');
                } catch (error) {
                    await message.updateStatus('failed');
                    logger.error(`Erro ao processar mensagem ${message._id}:`, error);
                }
            }
        } catch (error) {
            logger.error('Erro ao processar mensagens pendentes:', error);
        }
    }
}

module.exports = new WhatsAppService(); 