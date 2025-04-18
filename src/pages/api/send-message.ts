import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../middleware/auth';
import { getClient } from '../../services/whatsappService';

interface ExtendedNextApiRequest extends NextApiRequest {
  user?: {
    id: string;
    credits: number;
  };
}

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

    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ message: 'Número de telefone e mensagem são obrigatórios' });
    }

    const client = getClient();
    await client.sendMessage(`${phoneNumber}@c.us`, message);

    res.status(200).json({ message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ message: 'Erro ao enviar mensagem' });
  }
} 