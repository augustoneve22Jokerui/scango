require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

// Importações Internas
const routesV1 = require('./api/v1/routes');
const errorMiddleware = require('./api/v1/middlewares/error.middleware');
const logger = require('./config/logger');
const swaggerConfig = require('./config/swagger');

const app = express();

/**
 * CAMADA DE SEGURANÇA (Helmet & CORS)
 */
app.use(helmet()); // Adiciona headers de segurança contra ataques comuns
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id']
}));

/**
 * CAMADA DE PERFORMANCE E LOGGING
 */
app.use(compression()); // Compacta as respostas Gzip para economia de banda
// Integração do Morgan com o Winston para logs de requisições HTTP
app.use(morgan('combined', { stream: { write: (message) => logger.http(message.trim()) } }));

/**
 * CAMADA DE PARSING (Entrada de Dados)
 */
app.use(express.json({ limit: '10mb' })); // Suporta payloads JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * ARQUIVOS ESTÁTICOS (Uploads)
 */
app.use('/uploads', express.static(path.resolve(__dirname, 'public', 'uploads')));

/**
 * DOCUMENTAÇÃO DA API (Swagger)
 */
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));

/**
 * ROTAS DA API
 */
// Rota de Health Check para monitoramento de infraestrutura (Load Balancers/Kubernetes)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime(), timestamp: new Date() });
});

// Prefixo Global para Versão 1 da API
app.use('/api/v1', routesV1);

/**
 * TRATAMENTO DE ROTAS NÃO ENCONTRADAS (404)
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `A rota ${req.originalUrl} não foi encontrada neste servidor.`
  });
});

/**
 * MIDDLEWARE GLOBAL DE ERROS (Deve ser o último)
 */
app.use(errorMiddleware);

module.exports = app;
