export const hotmartConfig = {
  baseUrl: 'https://api-hot-connect.hotmart.com',
  tokenUrl: 'https://api-sec-vlc.hotmart.com/security/oauth/token',
  products: {
    basic: {
      id: process.env.HOTMART_BASIC_PRODUCT_ID || 'O99214851V',
      offerCode: process.env.HOTMART_BASIC_OFFER_CODE || 'i4ymjut5',
      price: 9.90
    },
    premium: {
      id: process.env.HOTMART_PREMIUM_PRODUCT_ID || 'O99214851V',
      offerCode: process.env.HOTMART_PREMIUM_OFFER_CODE || 's0sfmrjm',
      price: 14.90
    }
  }
}; 