import { NextApiRequest, NextApiResponse } from 'next';
import { getClient } from '../../services/whatsappService';
import { Chat } from 'whatsapp-web.js';

interface Contact {
  id: string;
  name: string;
  profilePic?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const client = getClient();
    const chats = await client.getChats();
    
    const contacts: Contact[] = chats.map((chat: Chat) => ({
      id: chat.id.user,
      name: chat.name || chat.id.user,
      profilePic: ''
    }));

    res.status(200).json(contacts);
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    res.status(500).json({ message: 'Erro ao buscar contatos' });
  }
} 