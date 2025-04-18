import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import subscriptionRoutes from './routes/subscriptionRoutes';
import logger from './config/logger';
import dbConnect from './database/db';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Conexão com o banco de dados
dbConnect().catch(err => {
  logger.error('Erro ao conectar com o banco de dados:', err);
  process.exit(1);
});

// Rotas
app.use('/api/subscriptions', subscriptionRoutes);

// Tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
}); 