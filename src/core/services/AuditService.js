const { AuditLog, User, Profile, Sequelize } = require('../../database/models');
const AppError = require('../../shared/errors/AppError');
const logger = require('../../config/logger');

class AuditService {
  /**
   * Cria um novo registro de auditoria
   * Chamado principalmente pelo audit.middleware ou manualmente em ações críticas
   */
  async createLog(auditData) {
    try {
      const {
        userId,
        action,
        entity,
        entityId,
        payload,
        ip,
        userAgent,
        statusCode
      } = auditData;

      return await AuditLog.create({
        user_id: userId,
        action,             // Ex: 'UPDATE_PRODUCT_PRICE'
        entity,             // Ex: 'Product'
        entity_id: entityId,
        old_values: payload?.old || null,
        new_values: payload?.new || payload, // Payload da mudança
        ip_address: ip,
        user_agent: userAgent,
        status_code: statusCode
      });
    } catch (error) {
      // Falha na auditoria não deve derrubar a transação principal, mas deve ser logada
      logger.error(`Falha crítica ao gravar log de auditoria: ${error.message}`);
    }
  }

  /**
   * Consulta a trilha de auditoria com filtros avançados
   */
  async getLogs(filters) {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      entity,
      startDate,
      endDate
    } = filters;

    const offset = (page - 1) * limit;
    const where = {};

    if (userId) where.user_id = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;

    if (startDate && endDate) {
      where.created_at = {
        [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    return await AuditLog.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['email'],
        include: [{ model: Profile, as: 'profile', attributes: ['name'] }]
      }]
    });
  }

  /**
   * Obtém detalhes de um log específico
   */
  async getLogById(id) {
    const log = await AuditLog.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['email'],
        include: [{ model: Profile, as: 'profile', attributes: ['name'] }]
      }]
    });

    if (!log) throw new AppError('Registro de auditoria não encontrado.', 404);
    return log;
  }

  /**
   * Gera um resumo de eventos de segurança (Ex: Tentativas de acesso negado)
   */
  async getSecurityOverview() {
    const totalLogs = await AuditLog.count();

    // Contagem de erros 403 (Acesso Negado) nas últimas 24h
    const unauthorizedAttempts = await AuditLog.count({
      where: {
        status_code: 403,
        created_at: { [Sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    // Ações mais frequentes
    const topActions = await AuditLog.findAll({
      attributes: ['action', [Sequelize.fn('COUNT', Sequelize.col('action')), 'count']],
      group: ['action'],
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 5
    });

    return {
      total_audited_events: totalLogs,
      security_alerts_24h: unauthorizedAttempts,
      top_system_actions: topActions
    };
  }

  /**
   * Prepara dados para exportação de compliance
   */
  async exportLogs({ format, startDate, endDate, requestedBy }) {
    logger.warn(`Exportação de auditoria solicitada por Admin ID: ${requestedBy}`);

    // Em um cenário Enterprise, aqui dispararíamos um Job (Cron/Queue)
    // para gerar um CSV/PDF e enviar o link por e-mail, pois a massa de dados pode ser enorme.

    const logs = await this.getLogs({ startDate, endDate, limit: 1000 });

    // Simulação de URL de download após processamento
    return {
      download_url: `https://storage.scango.com/exports/audit-${Date.now()}.${format}`,
      records_count: logs.count
    };
  }
}

module.exports = new AuditService();
