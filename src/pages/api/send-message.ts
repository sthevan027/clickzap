import { NextApiResponse } from 'next';
import { getWhatsAppClient } from '../../config/whatsapp';
import { authMiddleware, checkCredits, AuthenticatedRequest } from '../../middleware/auth';
import SubscriptionService from '../../services/SubscriptionService';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Middleware de autenticação
  await new Promise((resolve) => authMiddleware(req, res, resolve));
  if (!req.user) return;

  // Middleware de verificação de créditos
  await new Promise((resolve) => checkCredits(req, res, resolve, 'message'));

  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });
    }

    const client = getWhatsAppClient();
    
    if (!client) {
      return res.status(500).json({ error: 'Cliente WhatsApp não inicializado' });
    }

    // Formata o número para o padrão internacional
    const formattedNumber = number.replace(/\D/g, '');
    const chatId = `${formattedNumber}@c.us`;

    // Envia a mensagem
    await client.sendMessage(chatId, message);

    // Deduz os créditos
    await SubscriptionService.deductCredits(req.user._id, 'message');

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
} 