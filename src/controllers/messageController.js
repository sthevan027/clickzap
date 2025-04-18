const Message = require('../models/Message');
const Contact = require('../models/Contact');
const User = require('../models/User');
const whatsappService = require('../services/WhatsappService');
const logger = require('../config/logger');

class MessageController {
    async send(req, res) {
        try {
            const { type, content, recipient, mediaUrl, scheduledFor } = req.body;
            const user = req.user;

            // Formata o número do destinatário
            const contact = await Contact.findOrCreate({
                user: user._id,
                number: recipient
            });

            // Cria a mensagem no banco
            const message = await Message.create({
                user: user._id,
                type,
                content,
                recipient: contact.whatsappId,
                mediaUrl,
                scheduledFor
            });

            // Se não for agendada, envia imediatamente
            if (!scheduledFor) {
                try {
                    await whatsappService.sendMessage(user._id.toString(), {
                        type,
                        content,
                        recipient: contact.whatsappId,
                        mediaUrl
                    });

                    // Atualiza status da mensagem e créditos
                    await message.updateStatus('sent');
                    
                    if (type === 'text') {
                        user.credits.messages -= 1;
                    } else {
                        user.credits.media -= 1;
                    }
                    await user.save();

                    // Atualiza estatísticas do contato
                    await contact.updateMessageStats('sent');

                } catch (error) {
                    await message.updateStatus('failed');
                    throw error;
                }
            }

            logger.info('Mensagem criada:', { 
                messageId: message._id,
                userId: user._id,
                type,
                scheduled: !!scheduledFor
            });

            res.status(201).json({
                success: true,
                message: scheduledFor ? 'Mensagem agendada' : 'Mensagem enviada',
                data: message
            });

        } catch (error) {
            logger.error('Erro ao enviar mensagem:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao enviar mensagem'
            });
        }
    }

    async getMessages(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                status, 
                type,
                contact,
                startDate,
                endDate
            } = req.query;

            const query = { user: req.user._id };

            // Filtros opcionais
            if (status) query.status = status;
            if (type) query.type = type;
            if (contact) {
                const contactDoc = await Contact.findOne({ 
                    user: req.user._id,
                    number: contact
                });
                if (contactDoc) {
                    query.recipient = contactDoc.whatsappId;
                }
            }
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const messages = await Message.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('user', 'name email');

            const total = await Message.countDocuments(query);

            res.json({
                success: true,
                data: {
                    messages,
                    total,
                    page: parseInt(page),
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            logger.error('Erro ao buscar mensagens:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar mensagens'
            });
        }
    }

    async getMessage(req, res) {
        try {
            const message = await Message.findOne({
                _id: req.params.id,
                user: req.user._id
            }).populate('user', 'name email');

            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensagem não encontrada'
                });
            }

            res.json({
                success: true,
                data: message
            });

        } catch (error) {
            logger.error('Erro ao buscar mensagem:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar mensagem'
            });
        }
    }

    async cancelScheduledMessage(req, res) {
        try {
            const message = await Message.findOne({
                _id: req.params.id,
                user: req.user._id,
                status: 'pending',
                scheduledFor: { $exists: true }
            });

            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensagem agendada não encontrada'
                });
            }

            await message.updateStatus('cancelled');

            logger.info('Mensagem agendada cancelada:', { 
                messageId: message._id,
                userId: req.user._id
            });

            res.json({
                success: true,
                message: 'Agendamento cancelado'
            });

        } catch (error) {
            logger.error('Erro ao cancelar mensagem:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao cancelar mensagem'
            });
        }
    }

    async resendMessage(req, res) {
        try {
            const message = await Message.findOne({
                _id: req.params.id,
                user: req.user._id,
                status: 'failed'
            });

            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: 'Mensagem não encontrada ou não pode ser reenviada'
                });
            }

            // Verifica créditos
            const user = await User.findById(req.user._id);
            if (message.type === 'text' && user.credits.messages <= 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Créditos de mensagens esgotados'
                });
            }
            if (message.type !== 'text' && user.credits.media <= 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Créditos de mídia esgotados'
                });
            }

            try {
                await whatsappService.sendMessage(user._id.toString(), {
                    type: message.type,
                    content: message.content,
                    recipient: message.recipient,
                    mediaUrl: message.mediaUrl
                });

                // Atualiza status e créditos
                await message.updateStatus('sent');
                
                if (message.type === 'text') {
                    user.credits.messages -= 1;
                } else {
                    user.credits.media -= 1;
                }
                await user.save();

                // Atualiza estatísticas do contato
                const contact = await Contact.findOne({
                    user: user._id,
                    whatsappId: message.recipient
                });
                if (contact) {
                    await contact.updateMessageStats('sent');
                }

            } catch (error) {
                await message.updateStatus('failed');
                throw error;
            }

            logger.info('Mensagem reenviada:', { 
                messageId: message._id,
                userId: user._id
            });

            res.json({
                success: true,
                message: 'Mensagem reenviada com sucesso',
                data: message
            });

        } catch (error) {
            logger.error('Erro ao reenviar mensagem:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao reenviar mensagem'
            });
        }
    }

    async getMessageStats(req, res) {
        try {
            const stats = await Message.aggregate([
                { $match: { user: req.user._id } },
                { 
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        sent: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'sent'] }, 1, 0]
                            }
                        },
                        failed: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
                            }
                        },
                        pending: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
                            }
                        }
                    }
                }
            ]);

            res.json({
                success: true,
                data: stats[0] || {
                    total: 0,
                    sent: 0,
                    failed: 0,
                    pending: 0
                }
            });

        } catch (error) {
            logger.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar estatísticas'
            });
        }
    }
}

module.exports = new MessageController(); 