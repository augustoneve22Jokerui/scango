require('dotenv').config();
const http = require('http');
const app = require('./app');
const socketHandler = require('./socket');
const { sequelize } = require('./database/models');
const logger = require('./config/logger');

/**
 * Definição da Porta
 */
const PORT = process.env.PORT || 3000;

/**
 * Criação do Servidor HTTP (Necessário para integrar Express + Socket.IO)
 */
const server = http.createServer(app);

/**
 * Inicialização do Bootstrap do Sistema
 */
async function bootstrap() {
  try {
    logger.info('Iniciando o bootstrap do ScanGo Backend...');

    // 1. Testar conexão com o Banco de Dados (PostgreSQL)
    await sequelize.authenticate();
    logger.info('Conexão com o banco de dados estabelecida com sucesso.');

    // Opcional: Sincronizar modelos em desenvolvimento (Cuidado em produção!)
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: false });
    // }

    // 2. Inicializar o Socket.IO
    socketHandler.init(server);

    // 3. Iniciar a escuta do servidor
    server.listen(PORT, () => {
      logger.info(`🚀 Servidor ScanGo rodando em modo [${process.env.NODE_ENV}] na porta ${PORT}`);
      logger.info(`📄 Documentação disponível em: ${process.env.APP_URL || 'http://localhost:' + PORT}/docs`);
    });

  } catch (error) {
    logger.error(`❌ Falha crítica no bootstrap: ${error.message}`);
    process.exit(1); // Encerra o processo se não conseguir conectar ao DB
  }
}

/**
 * TRATAMENTO DE EXCEÇÕES NÃO CAPTURADAS (Segurança Enterprise)
 * Evita que o servidor caia sem registrar o motivo em caso de erro de programador.
 */
process.on('uncaughtException', (error) => {
  logger.error(`CRITICAL: Uncaught Exception - ${error.message}`);
  logger.error(error.stack);
  // Em produção, aqui você notificaria uma ferramenta como Sentry ou New Relic
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`CRITICAL: Unhandled Rejection at: ${promise} - reason: ${reason}`);
  // Não encerramos o processo aqui por padrão, mas registramos o erro crítico
});

/**
 * GRACEFUL SHUTDOWN (Desligamento Suave)
 * Garante que o servidor feche as conexões com o DB e Socket antes de encerrar.
 */
const gracefulShutdown = () => {
  logger.info('Encerrando servidor ScanGo graciosamente...');

  server.close(async () => {
    logger.info('Servidor HTTP fechado.');

    try {
      await sequelize.close();
      logger.info('Conexão com banco de dados encerrada.');
      process.exit(0);
    } catch (err) {
      logger.error(`Erro ao fechar DB: ${err.message}`);
      process.exit(1);
    }
  });

  // Forçar encerramento após 10 segundos se não fechar naturalmente
  setTimeout(() => {
    logger.error('Shutdown forçado: as conexões não fecharam a tempo.');
    process.exit(1);
  }, 10000);
};

// Escuta sinais de encerramento do SO (Docker/Kubernetes/Linux)
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Inicia o sistema
bootstrap();
