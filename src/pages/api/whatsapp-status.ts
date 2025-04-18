import { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppClient } from '../../config/whatsapp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const client = getWhatsAppClient();
    
    if (!client) {
      return res.status(200).json({ connected: false });
    }

    // Verifica se o cliente está pronto
    const isReady = client.info?.wid ? true : false;

    res.status(200).json({ connected: isReady });
  } catch (error) {
    console.error('Erro ao verificar status do WhatsApp:', error);
    res.status(500).json({ error: 'Erro ao verificar status do WhatsApp' });
  }
} 