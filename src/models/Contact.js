const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    number: {
        type: String,
        required: true,
        trim: true
    },
    // Número formatado para o WhatsApp (com código do país)
    whatsappId: {
        type: String,
        required: true
    },
    // Informações adicionais do contato
    profilePicture: String,
    status: String,
    lastSeen: Date,
    isBlocked: {
        type: Boolean,
        default: false
    },
    // Tags para organização
    tags: [{
        type: String,
        trim: true
    }],
    // Campos personalizados
    customFields: {
        type: Map,
        of: String
    },
    // Estatísticas
    stats: {
        messagesSent: {
            type: Number,
            default: 0
        },
        messagesReceived: {
            type: Number,
            default: 0
        },
        lastMessageDate: Date,
        lastInteraction: Date
    },
    // Notas sobre o contato
    notes: String
}, {
    timestamps: true
});

// Índices
contactSchema.index({ user: 1, whatsappId: 1 }, { unique: true });
contactSchema.index({ user: 1, number: 1 });
contactSchema.index({ tags: 1 });

// Método para formatar número
contactSchema.methods.formatNumber = function() {
    // Remove caracteres não numéricos
    let cleaned = this.number.replace(/\D/g, '');
    
    // Adiciona código do país se não existir
    if (!cleaned.startsWith('55')) {
        cleaned = '55' + cleaned;
    }
    
    // Adiciona @c.us para formato do WhatsApp
    return cleaned + '@c.us';
};

// Middleware para formatar whatsappId antes de salvar
contactSchema.pre('save', function(next) {
    if (this.isModified('number')) {
        this.whatsappId = this.formatNumber();
    }
    next();
});

// Método para atualizar estatísticas de mensagem
contactSchema.methods.updateMessageStats = async function(type = 'sent') {
    const now = new Date();
    
    if (type === 'sent') {
        this.stats.messagesSent += 1;
    } else if (type === 'received') {
        this.stats.messagesReceived += 1;
    }
    
    this.stats.lastMessageDate = now;
    this.stats.lastInteraction = now;
    
    return this.save();
};

// Método estático para buscar ou criar contato
contactSchema.statics.findOrCreate = async function(userData) {
    const { user, number, name } = userData;
    
    let contact = await this.findOne({ user, number });
    
    if (!contact) {
        contact = new this({
            user,
            number,
            name: name || number, // Usa o número como nome se não fornecido
        });
        await contact.save();
    }
    
    return contact;
};

module.exports = mongoose.model('Contact', contactSchema); 