const axios = require('axios');

const getHotmartToken = async () => {
  try {
    const response = await axios.post('https://api-sec-vlc.hotmart.com/security/oauth/token', {
      grant_type: 'client_credentials',
      client_id: process.env.HOTMART_CLIENT_ID,
      client_secret: process.env.HOTMART_CLIENT_SECRET
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Erro ao obter token Hotmart:', error);
    throw new Error('Falha ao obter token de acesso Hotmart');
  }
};

const validateHotmartWebhook = (token) => {
  return token === process.env.HOTMART_WEBHOOK_TOKEN;
};

const getProductIdByPlan = (plan) => {
  const products = {
    'basic': process.env.HOTMART_BASIC_PRODUCT_ID,
    'premium': process.env.HOTMART_PREMIUM_PRODUCT_ID
  };
  return products[plan];
};

const getOfferCodeByPlan = (plan) => {
  const offers = {
    'basic': process.env.HOTMART_BASIC_OFFER_CODE,
    'premium': process.env.HOTMART_PREMIUM_OFFER_CODE
  };
  return offers[plan];
};

module.exports = {
  getHotmartToken,
  validateHotmartWebhook,
  getProductIdByPlan,
  getOfferCodeByPlan
}; 