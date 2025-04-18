require('dotenv').config();

module.exports = {
  clientId: process.env.HOTMART_CLIENT_ID,
  clientSecret: process.env.HOTMART_CLIENT_SECRET,
  basicToken: process.env.HOTMART_BASIC_TOKEN,
  webhook_secret: process.env.HOTMART_WEBHOOK_SECRET,
  products: {
    free: {
      id: process.env.HOTMART_FREE_PRODUCT_ID,
      price: 0,
      name: 'Plano Grátis',
      features: [
        '1 instância do WhatsApp',
        '3 respostas por dia',
        'Suporte básico'
      ]
    },
    basic: {
      id: 'O99214851V',
      offer: 'i4ymjut5',
      price: 9.90,
      name: 'Plano Basic',
      features: [
        '3 instâncias do WhatsApp',
        'Respostas com IA',
        'Suporte prioritário'
      ]
    },
    premium: {
      id: 'O99214851V',
      offer: 's0sfmrjm',
      price: 14.90,
      name: 'Plano Premium',
      features: [
        '10 instâncias do WhatsApp',
        'Respostas com IA avançada',
        'Suporte 24/7'
      ]
    }
  }
}; 