const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    plan: {
        type: String,
        enum: ['free', 'basic', 'premium'],
        default: 'free'
    },
    credits: {
        messages: {
            type: Number,
            default: 100 // Plano free começa com 100 mensagens
        },
        media: {
            type: Number,
            default: 10 // Plano free começa com 10 envios de mídia
        }
    },
    hotmartCustomerId: {
        type: String,
        sparse: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    lastLogin: Date,
    whatsappConnected: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
}, {
    timestamps: true
});

// Criptografa a senha antes de salvar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para verificar senha
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para atualizar créditos baseado no plano
userSchema.methods.updatePlanCredits = function() {
    switch (this.plan) {
        case 'free':
            this.credits.messages = 100;
            this.credits.media = 10;
            break;
        case 'basic':
            this.credits.messages = 1000;
            this.credits.media = 100;
            break;
        case 'premium':
            this.credits.messages = 5000;
            this.credits.media = 500;
            break;
    }
    return this.save();
};

module.exports = mongoose.model('User', userSchema); 