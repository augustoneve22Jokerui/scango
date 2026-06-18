const WalletService = require('../../../core/services/WalletService');
const logger = require('../../../config/logger');

class WalletController {
  /**
   * Obtém o saldo atual da carteira (Créditos e Pontos)
   */
  async getBalance(req, res, next) {
    try {
      const userId = req.user.id;
      const balance = await WalletService.getBalance(userId);

      return res.status(200).json({
        success: true,
        data: balance
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém o histórico de transações (Extrato) com filtros e paginação
   */
  async getHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { page, limit, type, startDate, endDate } = req.query;

      const transactions = await WalletService.getTransactionHistory(userId, {
        page,
        limit,
        type,      // credit, debit, points_earn, points_spend
        startDate,
        endDate
      });

      return res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Simula ou processa um depósito de créditos na carteira
   * (Preparado para integração com Gateways de Pagamento)
   */
  async deposit(req, res, next) {
    try {
      const userId = req.user.id;
      const { amount, payment_method, transaction_ref } = req.body;

      const result = await WalletService.addCredits(userId, {
        amount,
        payment_method,
        transaction_ref
      });

      logger.info(`Depósito de ${amount} realizado para o utilizador ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Créditos adicionados com sucesso.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Transferência de pontos entre utilizadores (Social Feature)
   */
  async transferPoints(req, res, next) {
    try {
      const senderId = req.user.id;
      const { recipientEmail, points } = req.body;

      const result = await WalletService.transferPoints(senderId, recipientEmail, points);

      logger.info(`Transferência de ${points} pontos de ${senderId} para ${recipientEmail}`);

      return res.status(200).json({
        success: true,
        message: 'Pontos transferidos com sucesso.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
