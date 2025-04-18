require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const mime = require('mime-types');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para servir arquivos estáticos
app.use(express.static('public'));
app.use(express.json());

const regrasPath = path.join(__dirname, 'regras.json');

// Configuração do OpenAI
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Configuração do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "zapclick-bot",
        dataPath: process.env.WHATSAPP_SESSION_FILE
    }),
    puppeteer: {
        args: ['--no-sandbox'],
    }
});

// Eventos do WhatsApp
client.on('qr', qr => console.log('QR Code:', qr));
client.on('ready', () => console.log('Cliente WhatsApp está pronto!'));

client.on('message', async msg => {
    const texto = msg.body.toLowerCase();
    const regras = JSON.parse(fs.readFileSync(regrasPath));

    for (const regra of regras) {
        if (texto.includes(regra.gatilho.toLowerCase())) {
            if (regra.tipo === 'texto') {
                msg.reply(regra.resposta);
            } else if (regra.tipo === 'ia') {
                const r = await openai.createCompletion({
                    model: 'text-davinci-003',
                    prompt: texto,
                    max_tokens: 150,
                    temperature: 0.7,
                });
                msg.reply(r.data.choices[0].text);
            } else if (regra.tipo === 'mídia') {
                const media = MessageMedia.fromFilePath(path.join(__dirname, 'media', regra.resposta));
                client.sendMessage(msg.from, media);
            }
        }
    }
});

// Inicializar o cliente
client.initialize();

// Rotas da API
app.get('/api/qrcode', (req, res) => {
    res.json({ qrcode: client.info.qrCode });
});

app.get('/api/status', (req, res) => {
    res.json({ status: client.info ? 'connected' : 'disconnected' });
});

app.post('/api/send-message', async (req, res) => {
    try {
        const { number, message } = req.body;
        const chat = await client.getChatById(`${number}@c.us`);
        await chat.sendMessage(message);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
});

app.post('/api/send-media', async (req, res) => {
    try {
        const { number, filePath, caption } = req.body;
        const mimeType = mime.lookup(filePath);
        const media = MessageMedia.fromFilePath(filePath);
        const chat = await client.getChatById(`${number}@c.us`);
        await chat.sendMessage(media, { caption });
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao enviar mídia:', error);
        res.status(500).json({ error: 'Erro ao enviar mídia' });
    }
});

// API para regras
app.get('/api/regras', (req, res) => {
    const regras = JSON.parse(fs.readFileSync(regrasPath));
    res.json(regras);
});

app.post('/api/regras', (req, res) => {
    const regras = JSON.parse(fs.readFileSync(regrasPath));
    regras.push(req.body);
    fs.writeFileSync(regrasPath, JSON.stringify(regras, null, 2));
    res.json({ ok: true });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 