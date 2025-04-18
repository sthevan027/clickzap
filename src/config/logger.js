const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

// Configuração dos formatos
const formats = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Configuração do logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: formats,
    defaultMeta: { service: 'zapclick-api' },
    transports: [
        // Arquivo para todos os logs com rotação diária
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'info',
            maxSize: '5m',
            maxFiles: '14d',
            format: formats
        }),
        // Arquivo separado para erros com rotação diária
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '5m',
            maxFiles: '14d',
            format: formats
        })
    ],
    // Tratamento de exceções não capturadas
    exceptionHandlers: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../../logs/exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '5m',
            maxFiles: '14d',
            format: formats
        })
    ],
    // Tratamento de rejeições de promessas não tratadas
    rejectionHandlers: [
        new winston.transports.DailyRotateFile({
            filename: path.join(__dirname, '../../logs/rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '5m',
            maxFiles: '14d',
            format: formats
        })
    ]
});

// Adiciona console transport em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Stream para o Morgan
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Função para criar um logger específico para acesso
logger.createAccessLogger = () => {
    return winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.json()
        ),
        defaultMeta: { service: 'access-log' },
        transports: [
            new winston.transports.DailyRotateFile({
                filename: path.join(__dirname, '../../logs/access-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxSize: '5m',
                maxFiles: '14d',
                format: formats
            })
        ]
    });
};

module.exports = logger; 