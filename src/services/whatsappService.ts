import { Client } from 'whatsapp-web.js';

let client: Client | null = null;

export function initClient(newClient: Client) {
  client = newClient;
}

export function getClient(): Client {
  if (!client) {
    throw new Error('Cliente WhatsApp não inicializado');
  }
  return client;
}

export function isClientInitialized(): boolean {
  return client !== null;
} 