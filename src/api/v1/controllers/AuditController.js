const AuditService = require('../../../core/services/AuditService');
const logger = require('../../../config/logger');

class AuditController {
  /**
   * Lista os logs de auditoria com filtros avançados
   * Acesso exclusivo: SuperAdmin / Auditor
   */
  async index(req, res, next) {
    try {
      const {
        page,
        limit,
        userId,
        action,
        entity,
        startDate,
        endDate
      } = req.query;

      const logs = await AuditService.getLogs({
        page,
        limit,
        userId,   // Filtrar por autor da ação
        action,   // Ex: 'UPDATE', 'DELETE', 'LOGIN_FAILED'
        entity,   // Ex: 'User', 'Wallet', 'Store'
        startDate,
        endDate
      });

      return res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém detalhes de um evento de auditoria específico (incluindo o payload de mudança)
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const logDetail = await AuditService.getLogById(id);

      if (!logDetail) {
        return res.status(404).json({
          success: false,
          message: 'Log de auditoria não encontrado.'
        });
      }

      return res.status(200).json({
        success: true,
        data: logDetail
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém estatísticas de segurança baseadas nos logs (ex: tentativas de invasão detectadas)
   */
  async getSecurityStats(req, res, next) {
    try {
      const stats = await AuditService.getSecurityOverview();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporta a trilha de auditoria para fins de compliance legal
   */
  async exportAudit(req, res, next) {
    try {
      const { format, startDate, endDate } = req.body;
      const adminId = req.user.id;

      const exportUrl = await AuditService.exportLogs({
        format,
        startDate,
        endDate,
        requestedBy: adminId
      });

      logger.warn(`Exportação de logs de auditoria solicitada pelo Admin ${adminId}`);

      return res.status(200).json({
        success: true,
        message: 'A exportação de auditoria está a ser gerada.',
        data: { download_url: exportUrl }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditController();
