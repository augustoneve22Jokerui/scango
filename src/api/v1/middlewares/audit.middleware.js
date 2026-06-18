const AuditService = require('../../../core/services/AuditService');
const logger = require('../../../config/logger');

/**
 * Middleware para registro de auditoria de ações sensíveis
 * @param {String} actionDescription - Descrição amigável da ação (ex: 'ATUALIZAR_PERFIL')
 */
const auditLog = (actionDescription) => {
  return async (req, res, next) => {
    // Captura o estado inicial ou simplesmente prossegue para o controller
    // A auditoria real geralmente é registrada após o sucesso da operação (on finish)

    res.on('finish', async () => {
      // Registramos apenas se a operação foi bem-sucedida (status 2xx)
      // ou se for uma tentativa de acesso negado importante (403)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const auditData = {
            userId: req.user ? req.user.id : null,
            action: actionDescription || `${req.method} ${req.originalUrl}`,
            entity: req.baseUrl.split('/').pop(), // Tenta extrair a entidade da URL (ex: 'users')
            entityId: req.params.id || null,
            payload: req.method !== 'GET' ? req.body : null,
            ip: req.deviceInfo ? req.deviceInfo.ip : req.ip,
            userAgent: req.headers['user-agent'],
            statusCode: res.statusCode
          };

          // Dispara a gravação de forma assíncrona para não bloquear a resposta
          AuditService.createLog(auditData).catch(err => {
            logger.error(`Falha ao gravar log de auditoria: ${err.message}`);
          });

        } catch (error) {
          logger.error(`Erro no processamento do middleware de auditoria: ${error.message}`);
        }
      }
    });

    next();
  };
};

module.exports = auditLog;
