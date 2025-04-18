const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createAccessLogger } = require('./config/logger');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

// Criar aplicação Express
const app = express();

// Middlewares
app.use(helmet()); // Segurança
app.use(cors()); // CORS
app.use(express.json()); // Parser JSON
app.use(morgan('dev')); // Log de requisições
app.use(createAccessLogger().stream); // Log de acesso

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do ZapClick funcionando!' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app; 