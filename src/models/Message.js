const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video', 'audio', 'document'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    mediaUrl: {
        type: String,
        required: function() {
            return this.type !== 'text';
        }
    },
    recipient: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
        default: 'pending'
    },
    errorMessage: {
        type: String
    },
    scheduledFor: {
        type: Date
    },
    sentAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    readAt: {
        type: Date
    },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

// Índices para melhor performance
messageSchema.index({ user: 1, createdAt: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ scheduledFor: 1 }, { sparse: true });

// Método para atualizar status
messageSchema.methods.updateStatus = async function(newStatus, timestamp = new Date()) {
    this.status = newStatus;
    
    switch (newStatus) {
        case 'sent':
            this.sentAt = timestamp;
            break;
        case 'delivered':
            this.deliveredAt = timestamp;
            break;
        case 'read':
            this.readAt = timestamp;
            break;
        case 'failed':
            // Mantem o timestamp original
            break;
    }
    
    return this.save();
};

// Método estático para buscar mensagens pendentes
messageSchema.statics.findPendingMessages = function() {
    return this.find({
        status: 'pending',
        $or: [
            { scheduledFor: { $exists: false } },
            { scheduledFor: { $lte: new Date() } }
        ]
    }).populate('user', 'credits plan status');
};

module.exports = mongoose.model('Message', messageSchema); 