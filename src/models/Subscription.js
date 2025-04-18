const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hotmartData: {
        subscriptionId: {
            type: String,
            required: true,
            unique: true
        },
        productId: {
            type: String,
            required: true
        },
        offerId: String,
        status: {
            type: String,
            enum: ['active', 'cancelled', 'delayed', 'expired'],
            required: true
        }
    },
    plan: {
        type: String,
        enum: ['basic', 'premium'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    canceledAt: {
        type: Date
    },
    lastPayment: {
        date: Date,
        status: {
            type: String,
            enum: ['approved', 'pending', 'refused'],
            default: 'pending'
        },
        transactionId: String
    },
    nextPayment: {
        date: Date,
        amount: Number
    },
    paymentHistory: [{
        date: Date,
        amount: Number,
        status: {
            type: String,
            enum: ['approved', 'pending', 'refused']
        },
        transactionId: String
    }]
}, {
    timestamps: true
});

// Índices
subscriptionSchema.index({ 'hotmartData.subscriptionId': 1 }, { unique: true });
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ 'hotmartData.status': 1 });
subscriptionSchema.index({ endDate: 1 });

// Método para verificar se assinatura está ativa
subscriptionSchema.methods.isActive = function() {
    return this.hotmartData.status === 'active' && 
           this.endDate > new Date() &&
           this.lastPayment.status === 'approved';
};

// Método para processar pagamento
subscriptionSchema.methods.processPayment = async function(paymentData) {
    // Adiciona ao histórico
    this.paymentHistory.push({
        date: new Date(paymentData.date),
        amount: paymentData.amount,
        status: paymentData.status,
        transactionId: paymentData.transactionId
    });

    // Atualiza último pagamento
    this.lastPayment = {
        date: new Date(paymentData.date),
        status: paymentData.status,
        transactionId: paymentData.transactionId
    };

    // Se aprovado, atualiza próxima data de pagamento
    if (paymentData.status === 'approved') {
        const nextMonth = new Date(paymentData.date);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        this.nextPayment = {
            date: nextMonth,
            amount: this.price
        };
        
        // Atualiza data de término
        this.endDate = nextMonth;
    }

    return this.save();
};

// Método para cancelar assinatura
subscriptionSchema.methods.cancel = async function(cancelDate = new Date()) {
    this.hotmartData.status = 'cancelled';
    this.canceledAt = cancelDate;
    return this.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema); 