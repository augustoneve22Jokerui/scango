const AnalyticsService = require('../../../core/services/AnalyticsService');
const logger = require('../../../config/logger');

class AnalyticsController {
  /**
   * Obtém os KPIs globais da plataforma (Crescimento, Atividade, Conversão)
   * Acesso: Admin
   */
  async getGlobalKPIs(req, res, next) {
    try {
      const { startDate, endDate, period } = req.query;
      const kpis = await AnalyticsService.getPlatformKPIs({
        startDate,
        endDate,
        period // daily, weekly, monthly
      });

      return res.status(200).json({
        success: true,
        data: kpis
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém insights detalhados de um parceiro específico
   * Acesso: Admin ou o próprio Parceiro
   */
  async getPartnerInsights(req, res, next) {
    try {
      const partnerId = req.params.id || req.partner.id;
      const { startDate, endDate } = req.query;

      const insights = await AnalyticsService.getPartnerData(partnerId, {
        startDate,
        endDate
      });

      return res.status(200).json({
        success: true,
        data: insights
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Analisa a performance de uma loja específica (Scans por hora, produtos populares)
   */
  async getStorePerformance(req, res, next) {
    try {
      const { storeId } = req.params;
      const performance = await AnalyticsService.getStoreMetrics(storeId);

      return res.status(200).json({
        success: true,
        data: performance
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Solicita a geração de um relatório consolidado (PDF/CSV)
   */
  async exportReport(req, res, next) {
    try {
      const { type, format } = req.body; // type: sales, scans, users | format: pdf, csv
      const userId = req.user.id;

      // O service pode gerar o arquivo ou agendar a geração e notificar o usuário
      const reportUrl = await AnalyticsService.generateReport({
        type,
        format,
        requestedBy: userId
      });

      logger.info(`Relatório ${type} solicitado em formato ${format} por ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'O relatório está a ser processado e será enviado para o seu e-mail.',
        data: { download_url: reportUrl }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
