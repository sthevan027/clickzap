const { User } = require('../models');
const hotmartConfig = require('../config/hotmart');
const crypto = require('crypto');

class HotmartController {
  async handleWebhook(req, res) {
    try {
      // Verificar a assinatura do webhook
      const signature = req.headers['x-hotmart-webhook-signature'];
      const payload = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', hotmartConfig.webhook_secret)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Assinatura inválida' });
      }

      const { event, data } = req.body;

      switch (event) {
        case 'PURCHASE_APPROVED':
          await this.handlePurchaseApproved(data);
          break;
        case 'PURCHASE_CANCELED':
        case 'PURCHASE_REFUNDED':
          await this.handlePurchaseCanceled(data);
          break;
        case 'SUBSCRIPTION_CANCELED':
          await this.handleSubscriptionCanceled(data);
          break;
      }

      return res.json({ received: true });
    } catch (error) {
      console.error('Erro no webhook Hotmart:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async handlePurchaseApproved(data) {
    const { email, product_id } = data;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error('Usuário não encontrado:', email);
      return;
    }

    let subscription_status = 'basic';
    if (product_id === hotmartConfig.products.premium.id) {
      subscription_status = 'premium';
    }

    // Calcular data de expiração (30 dias)
    const subscription_expires_at = new Date();
    subscription_expires_at.setDate(subscription_expires_at.getDate() + 30);

    await user.update({
      subscription_status,
      subscription_expires_at
    });
  }

  async handlePurchaseCanceled(data) {
    const { email } = data;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error('Usuário não encontrado:', email);
      return;
    }

    await user.update({
      subscription_status: 'free',
      subscription_expires_at: new Date() // Expira imediatamente
    });
  }

  async handleSubscriptionCanceled(data) {
    const { email } = data;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error('Usuário não encontrado:', email);
      return;
    }

    // Mantem o acesso até o fim do período pago
    await user.update({
      subscription_status: 'free'
    });
  }

  getCheckoutUrl(productId) {
    // Gerar URL de checkout da Hotmart
    return `https://pay.hotmart.com/${productId}`;
  }
}

module.exports = new HotmartController(); 