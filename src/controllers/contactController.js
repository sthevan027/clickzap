const Contact = require('../models/Contact');
const Message = require('../models/Message');
const logger = require('../config/logger');

class ContactController {
    async create(req, res) {
        try {
            const { name, number, tags, notes, customFields } = req.body;

            const contact = await Contact.findOrCreate({
                user: req.user._id,
                number,
                name: name || number
            });

            // Atualiza campos adicionais se fornecidos
            if (tags) contact.tags = tags;
            if (notes) contact.notes = notes;
            if (customFields) contact.customFields = new Map(Object.entries(customFields));
            
            await contact.save();

            logger.info('Contato criado/atualizado:', { 
                contactId: contact._id,
                userId: req.user._id
            });

            res.status(201).json({
                success: true,
                data: contact
            });

        } catch (error) {
            logger.error('Erro ao criar contato:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar contato'
            });
        }
    }

    async getContacts(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10,
                search,
                tag,
                sort = 'lastInteraction'
            } = req.query;

            const query = { user: req.user._id };

            // Busca por nome ou número
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { number: { $regex: search, $options: 'i' } }
                ];
            }

            // Filtro por tag
            if (tag) {
                query.tags = tag;
            }

            // Ordenação
            let sortOption = {};
            switch (sort) {
                case 'name':
                    sortOption = { name: 1 };
                    break;
                case 'lastInteraction':
                    sortOption = { 'stats.lastInteraction': -1 };
                    break;
                case 'messageCount':
                    sortOption = { 'stats.messagesSent': -1 };
                    break;
                default:
                    sortOption = { createdAt: -1 };
            }

            const contacts = await Contact.find(query)
                .sort(sortOption)
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await Contact.countDocuments(query);

            res.json({
                success: true,
                data: {
                    contacts,
                    total,
                    page: parseInt(page),
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            logger.error('Erro ao buscar contatos:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar contatos'
            });
        }
    }

    async getContact(req, res) {
        try {
            const contact = await Contact.findOne({
                _id: req.params.id,
                user: req.user._id
            });

            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contato não encontrado'
                });
            }

            // Busca últimas mensagens do contato
            const recentMessages = await Message.find({
                user: req.user._id,
                recipient: contact.whatsappId
            })
            .sort({ createdAt: -1 })
            .limit(5);

            res.json({
                success: true,
                data: {
                    contact,
                    recentMessages
                }
            });

        } catch (error) {
            logger.error('Erro ao buscar contato:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar contato'
            });
        }
    }

    async update(req, res) {
        try {
            const { name, tags, notes, customFields } = req.body;

            const contact = await Contact.findOne({
                _id: req.params.id,
                user: req.user._id
            });

            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contato não encontrado'
                });
            }

            // Atualiza campos
            if (name) contact.name = name;
            if (tags) contact.tags = tags;
            if (notes) contact.notes = notes;
            if (customFields) {
                contact.customFields = new Map([
                    ...contact.customFields,
                    ...Object.entries(customFields)
                ]);
            }

            await contact.save();

            logger.info('Contato atualizado:', { 
                contactId: contact._id,
                userId: req.user._id
            });

            res.json({
                success: true,
                data: contact
            });

        } catch (error) {
            logger.error('Erro ao atualizar contato:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar contato'
            });
        }
    }

    async delete(req, res) {
        try {
            const contact = await Contact.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            });

            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contato não encontrado'
                });
            }

            logger.info('Contato deletado:', { 
                contactId: req.params.id,
                userId: req.user._id
            });

            res.json({
                success: true,
                message: 'Contato deletado com sucesso'
            });

        } catch (error) {
            logger.error('Erro ao deletar contato:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao deletar contato'
            });
        }
    }

    async getTags(req, res) {
        try {
            const tags = await Contact.distinct('tags', {
                user: req.user._id,
                tags: { $exists: true, $ne: [] }
            });

            res.json({
                success: true,
                data: tags
            });

        } catch (error) {
            logger.error('Erro ao buscar tags:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar tags'
            });
        }
    }

    async getStats(req, res) {
        try {
            const stats = await Contact.aggregate([
                { $match: { user: req.user._id } },
                { 
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        totalMessagesSent: { $sum: '$stats.messagesSent' },
                        totalMessagesReceived: { $sum: '$stats.messagesReceived' },
                        withTags: {
                            $sum: {
                                $cond: [
                                    { $gt: [{ $size: '$tags' }, 0] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            res.json({
                success: true,
                data: stats[0] || {
                    total: 0,
                    totalMessagesSent: 0,
                    totalMessagesReceived: 0,
                    withTags: 0
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

module.exports = new ContactController(); 