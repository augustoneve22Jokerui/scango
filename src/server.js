require('dotenv').config();

const http = require('http');
const app = require('./app');
const socketHandler = require('./socket');
const logger = require('./config/logger');

let sequelize;

try {
const db = require('./database/models');
sequelize = db.sequelize;

logger.info('Models carregados com sucesso.');
logger.info(`Sequelize versão: ${db.Sequelize.version}`);
} catch (error) {
console.error('======================================');
console.error('ERRO AO CARREGAR MODELS');
console.error(error.message);
console.error(error.stack);
console.error('======================================');
process.exit(1);
}

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

async function bootstrap() {
try {
logger.info('======================================');
logger.info('INICIANDO SCANGO BACKEND');
logger.info('======================================');

```
logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
logger.info(`PORT: ${PORT}`);

logger.info('Testando conexão com banco de dados...');

await sequelize.authenticate();

logger.info('Banco conectado com sucesso.');

try {
  const [result] = await sequelize.query('SELECT NOW()');
  logger.info(`Banco respondeu: ${JSON.stringify(result)}`);
} catch (dbTestError) {
  logger.warn(`Falha no teste SQL: ${dbTestError.message}`);
}

logger.info('Inicializando Socket.IO...');
socketHandler.init(server);

server.listen(PORT, '0.0.0.0', () => {
  logger.info('======================================');
  logger.info('SERVIDOR ONLINE');
  logger.info(`URL: ${process.env.APP_URL}`);
  logger.info(`PORTA: ${PORT}`);
  logger.info(`AMBIENTE: ${process.env.NODE_ENV}`);
  logger.info('======================================');
});
```

} catch (error) {
logger.error('======================================');
logger.error('FALHA NO BOOTSTRAP');
logger.error(error.message);
logger.error(error.stack);
logger.error('======================================');
process.exit(1);
}
}

process.on('uncaughtException', (error) => {
console.error('======================================');
console.error('UNCAUGHT EXCEPTION');
console.error(error.message);
console.error(error.stack);
console.error('======================================');
process.exit(1);
});

process.on('unhandledRejection', (reason) => {
console.error('======================================');
console.error('UNHANDLED REJECTION');
console.error(reason);
console.error('======================================');
});

async function gracefulShutdown(signal) {
logger.info(`Recebido sinal ${signal}`);

server.close(async () => {
logger.info('Servidor HTTP encerrado.');

```
try {
  if (sequelize) {
    await sequelize.close();
    logger.info('Conexão com banco encerrada.');
  }

  process.exit(0);
} catch (error) {
  logger.error(`Erro ao encerrar banco: ${error.message}`);
  process.exit(1);
}
```

});

setTimeout(() => {
logger.error('Timeout no shutdown.');
process.exit(1);
}, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

bootstrap();
