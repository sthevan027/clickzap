const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const { rateLimit } = require('express-rate-limit');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');

class App {
    constructor() {
        this.app = express();
        this.middlewares();
        this.routes();
        this.errorHandling();
    }

    middlewares() {
        // Configurações básicas de segurança e performance
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Logging
        this.app.use(morgan('combined', { stream: logger.stream }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 100 // limite de 100 requisições por IP
        });
        this.app.use(limiter);
    }

    routes() {
        this.app.use('/api', routes);
    }

    errorHandling() {
        this.app.use(errorHandler);
    }
}

module.exports = new App().app; 