const { Wallet, Transaction, User, Sequelize } = require('../../database/models');
const AppError = require('../../shared/errors/AppError');
const logger = require('../../config/logger');

class WalletService {
  /**
   * Obtém o saldo consolidado do utilizador
   */
  async getBalance(userId) {
    const wallet = await Wallet.findOne({
      where: { user_id: userId },
      attributes: ['balance_credits', 'balance_points', 'updated_at']
    });

    if (!wallet) {
      throw new AppError('Carteira não encontrada para este utilizador.', 404);
    }

    return wallet;
  }

  /**
   * Obtém histórico de transações com paginação e filtros
   */
  async getTransactionHistory(userId, filters) {
    const { page = 1, limit = 10, type, startDate, endDate } = filters;
    const offset = (page - 1) * limit;

    const where = { user_id: userId };

    if (type) where.type = type;
    if (startDate && endDate) {
      where.created_at = {
        [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    return await Transaction.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Adiciona créditos à carteira (Depósito)
   * Integração simulada com Gateway de Pagamento
   */
  async addCredits(userId, { amount, payment_method, transaction_ref }) {
    if (amount <= 0) throw new AppError('O valor do depósito deve ser positivo.', 400);

    const transaction = await Wallet.sequelize.transaction();

    try {
      // 1. Busca a carteira com lock para evitar interferência
      const wallet = await Wallet.findOne({
        where: { user_id: userId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!wallet) throw new AppError('Carteira não encontrada.', 404);

      // 2. Incrementa o saldo de créditos
      const oldBalance = wallet.balance_credits;
      await wallet.increment('balance_credits', { by: amount, transaction });

      // 3. Registra a transação no extrato
      const log = await Transaction.create({
        wallet_id: wallet.id,
        user_id: userId,
        type: 'credit_deposit',
        amount: amount,
        description: `Depósito via ${payment_method}`,
        reference_type: 'payment_gateway',
        reference_id: transaction_ref,
        metadata: {
          old_balance: oldBalance,
          new_balance: oldBalance + amount,
          gateway_method: payment_method
        }
      }, { transaction });

      await transaction.commit();

      logger.info(`Créditos adicionados: Utilizador ${userId} - Valor: ${amount}`);
      return log;

    } catch (error) {
      await transaction.rollback();
      logger.error(`Erro no depósito de créditos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transferência de Pontos entre utilizadores (Social Feature)
   */
  async transferPoints(senderId, recipientEmail, points) {
    if (points <= 0) throw new AppError('A quantidade de pontos deve ser superior a zero.', 400);

    // 1. Localiza o destinatário
    const recipient = await User.findOne({ where: { email: recipientEmail } });
    if (!recipient) throw new AppError('Utilizador destinatário não encontrado.', 404);
    if (recipient.id === senderId) throw new AppError('Não pode transferir pontos para si mesmo.', 400);

    const transaction = await Wallet.sequelize.transaction();

    try {
      // 2. Bloqueia ambas as carteiras para a transferência
      const senderWallet = await Wallet.findOne({
        where: { user_id: senderId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      const recipientWallet = await Wallet.findOne({
        where: { user_id: recipient.id },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (senderWallet.balance_points < points) {
        throw new AppError('Saldo de pontos insuficiente.', 400);
      }

      // 3. Executa a movimentação
      await senderWallet.decrement('balance_points', { by: points, transaction });
      await recipientWallet.increment('balance_points', { by: points, transaction });

      // 4. Registra os logs (Débito e Crédito)
      await Transaction.create({
        wallet_id: senderWallet.id,
        user_id: senderId,
        type: 'points_spend',
        amount: points,
        description: `Transferência enviada para ${recipientEmail}`,
        reference_type: 'transfer',
        reference_id: recipient.id
      }, { transaction });

      await Transaction.create({
        wallet_id: recipientWallet.id,
        user_id: recipient.id,
        type: 'points_earn',
        amount: points,
        description: `Transferência recebida de ${senderId}`,
        reference_type: 'transfer',
        reference_id: senderId
      }, { transaction });

      await transaction.commit();

      logger.info(`Transferência de pontos: ${senderId} -> ${recipient.id} (Qtd: ${points})`);
      return { success: true, points_transferred: points };

    } catch (error) {
      await transaction.rollback();
      logger.error(`Erro na transferência de pontos: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new WalletService();
