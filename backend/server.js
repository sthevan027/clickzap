require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(express.json());

const regrasPath = path.join(__dirname, '../regras.json');
const mediaPath = path.join(__dirname, '../media');
const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);

// Salvar regra
app.post('/regras', (req, res) => {
  const regras = fs.existsSync(regrasPath) ? JSON.parse(fs.readFileSync(regrasPath)) : [];
  regras.push(req.body);
  fs.writeFileSync(regrasPath, JSON.stringify(regras, null, 2));
  res.send({ status: 'OK' });
});

// Executar IA
app.post('/ia', async (req, res) => {
  const prompt = req.body.pergunta;
  const resposta = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });
  res.send({ resposta: resposta.data.choices[0].message.content });
});

// Enviar mídia simulada
app.get('/media/:nome', (req, res) => {
  const file = path.join(mediaPath, req.params.nome);
  const mimeType = mime.lookup(file);
  res.setHeader("Content-Type", mimeType);
  fs.createReadStream(file).pipe(res);
});

app.listen(3000, () => console.log("Zapclick backend ativo na porta 3000"));