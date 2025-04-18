import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import SubscriptionService from '../../../services/SubscriptionService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Verifica a assinatura do webhook
    const signature = req.headers['x-hotmart-hottok'];
    const hottok = process.env.HOTMART_WEBHOOK_TOKEN;

    if (!signature || signature !== hottok) {
      return res.status(401).json({ error: 'Assinatura inválida' });
    }

    const data = req.body;

    // Verifica se é um evento de compra/assinatura
    if (!['PURCHASE_COMPLETE', 'PURCHASE_CANCELED', 'SUBSCRIPTION_CANCELLATION'].includes(data.event)) {
      return res.status(200).json({ message: 'Evento ignorado' });
    }

    // Processa o webhook
    await SubscriptionService.processHotmartWebhook(data);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook Hotmart:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
} 