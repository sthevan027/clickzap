require('dotenv').config();
const app = require('./server');
const logger = require('./config/logger');
const connectDB = require('./config/database');

const port = process.env.PORT || 3000;

async function startServer() {
    try {
        // Conectar ao banco de dados
        await connectDB();
        logger.info('Conexão com o banco de dados estabelecida');

        // Iniciar servidor
        app.listen(port, () => {
            logger.info(`Servidor rodando na porta ${port}`);
        });
    } catch (error) {
        logger.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    logger.error('Erro não capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    logger.error('Promise rejeitada não tratada:', error);
    process.exit(1);
});

startServer(); 