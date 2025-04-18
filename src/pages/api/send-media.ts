import { NextApiRequest, NextApiResponse } from 'next';
import { getClient } from '../../services/whatsappService';
import { MessageMedia } from 'whatsapp-web.js';
import formidable from 'formidable';
import fs from 'fs';
import { authMiddleware, checkCredits, AuthenticatedRequest } from '../../middleware/auth';
import SubscriptionService from '../../services/SubscriptionService';

interface ExtendedNextApiRequest extends NextApiRequest {
  user?: {
    id: string;
    credits: number;
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Middleware de autenticação
    await new Promise<void>((resolve) => {
      authMiddleware(req as ExtendedNextApiRequest, res, () => resolve());
    });
    
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    const { phoneNumber, mediaUrl, caption } = req.body;

    if (!phoneNumber || !mediaUrl) {
      return res.status(400).json({ message: 'Número de telefone e URL da mídia são obrigatórios' });
    }

    const client = getClient();
    const media = await MessageMedia.fromUrl(mediaUrl);
    
    await client.sendMessage(`${phoneNumber}@c.us`, media, {
      caption: caption || ''
    });

    res.status(200).json({ message: 'Mídia enviada com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar mídia:', error);
    res.status(500).json({ message: 'Erro ao enviar mídia' });
  }
} 