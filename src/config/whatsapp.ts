import { Client, LocalAuth } from 'whatsapp-web.js';
import { EventEmitter } from 'events';

declare global {
  var whatsappClient: Client;
  var whatsappEvents: EventEmitter;
}

if (!global.whatsappEvents) {
  global.whatsappEvents = new EventEmitter();
}

if (!global.whatsappClient) {
  global.whatsappClient = new Client({
    authStrategy: new LocalAuth({
      clientId: "zapclick-bot",
      dataPath: process.env.WHATSAPP_SESSION_FILE
    }),
    puppeteer: {
      args: ['--no-sandbox'],
    }
  });

  global.whatsappClient.on('qr', (qr) => {
    global.whatsappEvents.emit('qr', qr);
  });

  global.whatsappClient.on('ready', () => {
    console.log('Cliente WhatsApp está pronto!');
    global.whatsappEvents.emit('ready');
  });

  global.whatsappClient.on('message', (msg) => {
    global.whatsappEvents.emit('message', msg);
  });

  global.whatsappClient.initialize().catch(err => {
    console.error('Erro ao inicializar cliente WhatsApp:', err);
  });
}

export const getWhatsAppClient = () => global.whatsappClient;
export const getWhatsAppEvents = () => global.whatsappEvents; 