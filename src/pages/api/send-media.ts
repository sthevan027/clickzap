import { NextApiResponse } from 'next';
import { getWhatsAppClient } from '../../config/whatsapp';
import { MessageMedia } from 'whatsapp-web.js';
import formidable from 'formidable';
import fs from 'fs';
import { authMiddleware, checkCredits, AuthenticatedRequest } from '../../middleware/auth';
import SubscriptionService from '../../services/SubscriptionService';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Middleware de autenticação
  await new Promise((resolve) => authMiddleware(req, res, resolve));
  if (!req.user) return;

  // Middleware de verificação de créditos
  await new Promise((resolve) => checkCredits(req, res, resolve, 'media'));

  try {
    const form = formidable({
      maxFileSize: 16 * 1024 * 1024, // 16MB
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const number = fields.number as string;
    const file = files.file as formidable.File;

    if (!number || !file) {
      return res.status(400).json({ error: 'Número e arquivo são obrigatórios' });
    }

    const client = getWhatsAppClient();
    
    if (!client) {
      return res.status(500).json({ error: 'Cliente WhatsApp não inicializado' });
    }

    // Formata o número para o padrão internacional
    const formattedNumber = number.replace(/\D/g, '');
    const chatId = `${formattedNumber}@c.us`;

    // Lê o arquivo e cria o MessageMedia
    const fileData = fs.readFileSync(file.filepath);
    const media = new MessageMedia(
      file.mimetype || 'application/octet-stream',
      fileData.toString('base64'),
      file.originalFilename
    );

    // Envia a mídia
    await client.sendMessage(chatId, media);

    // Deduz os créditos
    await SubscriptionService.deductCredits(req.user._id, 'media');

    // Remove o arquivo temporário
    fs.unlinkSync(file.filepath);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar mídia:', error);
    res.status(500).json({ error: 'Erro ao enviar mídia' });
  }
} 