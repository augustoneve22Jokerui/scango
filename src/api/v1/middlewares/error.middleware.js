const logger = require('../../../config/logger');

/**
 * Middleware Global de Tratamento de Erros
 */
module.exports = (err, req, res, next) => {
  // 1. Define valores padrão para o erro
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor.';
  let errors = err.errors || [];

  // 2. Tratamento específico para erros do Sequelize (Database)
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Erro de validação de dados.';
    errors = err.errors.map(e => ({ field: e.path, message: e.message }));
  }

  // 3. Registro do erro no Logger (Winston)
  // Em produção, não queremos o stack trace no console, mas sim no arquivo de log
  logger.error({
    message: `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    stack: err.stack,
  });

  // 4. Formatação da resposta para o cliente
  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }), // Inclui detalhes de validação se houver
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Mostra stack apenas em DEV
  };

  // 5. Retorno da resposta HTTP
  return res.status(statusCode).json(response);
};
