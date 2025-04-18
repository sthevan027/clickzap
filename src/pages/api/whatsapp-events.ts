import { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppEvents } from '../../config/whatsapp';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Configuração para Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Transfer-Encoding', 'chunked');

  const events = getWhatsAppEvents();

  // Função para enviar dados para o cliente
  const sendData = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Listeners para eventos do WhatsApp
  const qrListener = (qr: string) => {
    sendData({ type: 'qr', qr });
  };

  const readyListener = () => {
    sendData({ type: 'ready' });
  };

  // Registra os listeners
  events.on('qr', qrListener);
  events.on('ready', readyListener);

  // Mantém a conexão viva
  const keepAlive = setInterval(() => {
    sendData({ type: 'ping' });
  }, 30000);

  // Limpa os listeners quando a conexão é fechada
  req.on('close', () => {
    clearInterval(keepAlive);
    events.off('qr', qrListener);
    events.off('ready', readyListener);
  });
} 