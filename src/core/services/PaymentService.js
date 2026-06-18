const { Subscription, Plan, Invoice, Partner, Sequelize } = require('../../database/models');
const EmailProvider = require('../providers/EmailProvider');
const AppError = require('../../shared/errors/AppError');
const logger = require('../../config/logger');

class PaymentService {
  /**
   * Lista todos os planos de assinatura ativos para os parceiros
   */
  async getAvailablePlans() {
    return await Plan.findAll({
      where: { status: 'active' },
      order: [['price', 'ASC']]
    });
  }

  /**
   * Obtém a assinatura atual de um parceiro e seu status
   */
  async getPartnerSubscription(partnerId) {
    const subscription = await Subscription.findOne({
      where: { partner_id: partnerId },
      include: [{ model: Plan, as: 'plan' }],
      order: [['created_at', 'DESC']]
    });

    if (!subscription) {
      throw new AppError('Nenhuma assinatura encontrada para este parceiro.', 404);
    }

    return subscription;
  }

  /**
   * Inicia um novo processo de assinatura ou Upgrade de plano
   */
  async createSubscription(partnerId, planId, paymentMethodId) {
    const plan = await Plan.findByPk(planId);
    if (!plan || plan.status !== 'active') {
      throw new AppError('Plano inválido ou inativo.', 400);
    }

    const transaction = await Subscription.sequelize.transaction();

    try {
      // 1. Simulação de integração com Gateway (Stripe/PayPal/Local)
      // Aqui o código enviaria o paymentMethodId para o provedor externo
      const gatewayResponse = {
        id: `ext_${Date.now()}`,
        status: 'active',
        next_billing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      // 2. Atualizar ou criar assinatura no banco local
      const [subscription, created] = await Subscription.upsert({
        partner_id: partnerId,
        plan_id: plan.id,
        external_id: gatewayResponse.id,
        status: gatewayResponse.status,
        current_period_end: gatewayResponse.next_billing,
        cancel_at_period_end: false
      }, { transaction, returning: true });

      // 3. Gerar a primeira Fatura (Invoice)
      const invoice = await Invoice.create({
        partner_id: partnerId,
        subscription_id: subscription.id,
        amount: plan.price,
        status: 'paid', // Assumindo sucesso imediato no upgrade
        due_date: new Date(),
        paid_at: new Date(),
        metadata: { plan_name: plan.name }
      }, { transaction });

      await transaction.commit();

      // 4. Notificar parceiro por e-mail
      EmailProvider.sendInvoice(partnerId, invoice);

      return { subscription, invoice };
    } catch (error) {
      await transaction.rollback();
      logger.error(`Erro ao processar assinatura para parceiro ${partnerId}: ${error.message}`);
      throw new AppError('Falha ao processar pagamento. Tente novamente.', 500);
    }
  }

  /**
   * Processa Webhooks de Gateways de Pagamento (Idempotência é chave aqui)
   */
  async handlePaymentWebhook(event) {
    const { type, data } = event;

    logger.info(`Webhook recebido: ${type}`);

    switch (type) {
      case 'invoice.paid':
        await this.processSuccessfulPayment(data);
        break;
      case 'subscription.deleted':
        await this.processSubscriptionCancellation(data);
        break;
      default:
        logger.debug(`Evento de pagamento não tratado: ${type}`);
    }
  }

  /**
   * Cancela a renovação automática de uma assinatura
   */
  async cancelSubscription(partnerId) {
    const subscription = await Subscription.findOne({
      where: { partner_id: partnerId, status: 'active' }
    });

    if (!subscription) throw new AppError('Assinatura ativa não encontrada.', 404);

    // No Gateway, marcaríamos para não renovar ao fim do período
    return await subscription.update({ cancel_at_period_end: true });
  }

  /**
   * Histórico de faturamento do parceiro
   */
  async getPartnerInvoices(partnerId, { page = 1, limit = 12, status }) {
    const offset = (page - 1) * limit;
    const where = { partner_id: partnerId };
    if (status) where.status = status;

    return await Invoice.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Relatório de Receita Global para Administração
   */
  async getPlatformRevenueReport(startDate, endDate) {
    return await Invoice.findAll({
      attributes: [
        [Sequelize.fn('date_trunc', 'month', Sequelize.col('paid_at')), 'month'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total_revenue'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_invoices']
      ],
      where: {
        status: 'paid',
        paid_at: { [Sequelize.Op.between]: [startDate, endDate] }
      },
      group: [Sequelize.literal('month')],
      order: [[Sequelize.literal('month'), 'ASC']]
    });
  }
}

module.exports = new PaymentService();
