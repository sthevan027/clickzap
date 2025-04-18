import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'whatsapp-web.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const client = (global as any).whatsappClient as Client;
      
      if (!client) {
        return res.status(500).json({ error: 'Cliente WhatsApp não inicializado' });
      }

      const chats = await client.getChats();
      const contacts = chats
        .filter(chat => chat.isGroup === false)
        .map(chat => ({
          id: chat.id._serialized,
          name: chat.name || chat.id.user,
          number: chat.id.user,
          profilePic: chat.profilePicUrl
        }));

      res.status(200).json(contacts);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      res.status(500).json({ error: 'Erro ao buscar contatos' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 