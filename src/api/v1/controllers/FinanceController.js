const FinanceService = require('../../../core/services/FinanceService');
const logger = require('../../../config/logger');

class FinanceController {
  /**
   * Lista os planos de assinatura disponíveis para parceiros
   */
  async listPlans(req, res, next) {
    try {
      const plans = await FinanceService.getAvailablePlans();

      return res.status(200).json({
        success: true,
        data: plans
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém os detalhes da assinatura atual do parceiro logado
   */
  async getMySubscription(req, res, next) {
    try {
      const partnerId = req.partner.id;
      const subscription = await FinanceService.getPartnerSubscription(partnerId);

      return res.status(200).json({
        success: true,
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Realiza o upgrade ou alteração de plano de um parceiro
   */
  async subscribe(req, res, next) {
    try {
      const partnerId = req.partner.id;
      const { planId, paymentMethodId } = req.body;

      const result = await FinanceService.createSubscription(partnerId, planId, paymentMethodId);

      logger.info(`Nova assinatura iniciada para o parceiro ${partnerId} - Plano: ${planId}`);

      return res.status(201).json({
        success: true,
        message: 'Subscrição processada com sucesso.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista o histórico de faturas (Invoices) do parceiro
   */
  async getInvoices(req, res, next) {
    try {
      const partnerId = req.partner.id;
      const { page, limit, status } = req.query;

      const invoices = await FinanceService.getPartnerInvoices(partnerId, { page, limit, status });

      return res.status(200).json({
        success: true,
        data: invoices
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancela a renovação automática da assinatura
   */
  async cancelSubscription(req, res, next) {
    try {
      const partnerId = req.partner.id;
      await FinanceService.cancelSubscription(partnerId);

      logger.warn(`Assinatura cancelada pelo parceiro ${partnerId}`);

      return res.status(200).json({
        success: true,
        message: 'Renovação da subscrição cancelada com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dashboard Financeiro Global (Acesso: Admin)
   */
  async getGlobalRevenue(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await FinanceService.getPlatformRevenueReport(startDate, endDate);

      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FinanceController();
