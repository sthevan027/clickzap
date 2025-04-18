const { WhatsappInstance, Rule } = require('../models');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { Configuration, OpenAIApi } = require('openai');

const instances = new Map();
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

class WhatsappController {
  async create(req, res) {
    try {
      const { name } = req.body;
      
      // Verificar limite de instâncias baseado na assinatura
      const instanceCount = await WhatsappInstance.count({ where: { userId: req.userId } });
      const limits = {
        free: 1,
        basic: 3,
        premium: 10
      };

      if (instanceCount >= limits[req.userSubscription]) {
        return res.status(403).json({ error: 'Limite de instâncias atingido' });
      }

      const instance = await WhatsappInstance.create({
        name,
        userId: req.userId,
        status: 'connecting'
      });

      const client = new Client({
        authStrategy: new LocalAuth({ clientId: `user_${req.userId}_instance_${instance.id}` }),
        puppeteer: { args: ['--no-sandbox'] }
      });

      client.on('qr', async (qr) => {
        await instance.update({ qrCode: qr });
      });

      client.on('ready', async () => {
        await instance.update({ 
          status: 'connected',
          qrCode: null
        });
      });

      client.on('message', async (msg) => {
        const rules = await Rule.findAll({
          where: {
            instanceId: instance.id,
            isActive: true
          }
        });

        const texto = msg.body.toLowerCase();

        for (const rule of rules) {
          if (texto.includes(rule.trigger.toLowerCase())) {
            try {
              if (rule.type === 'text') {
                await msg.reply(rule.response);
              } else if (rule.type === 'ai') {
                const r = await openai.createChatCompletion({
                  model: 'gpt-3.5-turbo',
                  messages: [{ role: 'user', content: texto }]
                });
                await msg.reply(r.data.choices[0].message.content);
              } else if (rule.type === 'media') {
                const media = MessageMedia.fromFilePath(rule.response);
                await client.sendMessage(msg.from, media);
              }

              await rule.increment('usageCount');
              await rule.update({ lastTriggered: new Date() });
              await instance.increment('messageCount');
            } catch (error) {
              console.error(`Erro ao processar regra ${rule.id}:`, error);
            }
          }
        }
      });

      client.initialize();
      instances.set(instance.id, client);

      return res.json(instance);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const instances = await WhatsappInstance.findAll({
        where: { userId: req.userId },
        include: [{
          model: Rule,
          attributes: ['id', 'name', 'trigger', 'type', 'isActive', 'usageCount']
        }]
      });

      return res.json(instances);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const instance = await WhatsappInstance.findOne({
        where: { id, userId: req.userId }
      });

      if (!instance) {
        return res.status(404).json({ error: 'Instância não encontrada' });
      }

      const client = instances.get(instance.id);
      if (client) {
        await client.destroy();
        instances.delete(instance.id);
      }

      await instance.destroy();

      return res.json({ message: 'Instância removida com sucesso' });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async getStatus(req, res) {
    try {
      const { id } = req.params;
      const instance = await WhatsappInstance.findOne({
        where: { id, userId: req.userId }
      });

      if (!instance) {
        return res.status(404).json({ error: 'Instância não encontrada' });
      }

      return res.json({
        id: instance.id,
        name: instance.name,
        status: instance.status,
        messageCount: instance.messageCount,
        lastActivity: instance.lastActivity,
        qrCode: instance.qrCode
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new WhatsappController(); 