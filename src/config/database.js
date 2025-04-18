require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        logger.info(`MongoDB Conectado: ${conn.connection.host}`);
        
        // Eventos de conexão
        mongoose.connection.on('error', (err) => {
            logger.error('Erro na conexão MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB desconectado');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconectado');
        });

        return conn;
    } catch (error) {
        logger.error('Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB; 