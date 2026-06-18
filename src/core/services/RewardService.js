const { Reward, Voucher, Wallet, Transaction, Store, Sequelize } = require('../../database/models');
const AppError = require('../../shared/errors/AppError');
const crypto = require('crypto');
const logger = require('../../config/logger');

class RewardService {
  /**
   * Lista todas as recompensas disponíveis para resgate
   */
  async listAvailableRewards(filters) {
    const { category, min_points, store_id } = filters;

    const where = { status: 'active' };

    if (category) where.category = category;
    if (min_points) where.points_cost = { [Sequelize.Op.lte]: min_points };
    if (store_id) where.store_id = store_id;

    return await Reward.findAll({
      where,
      include: [{ model: Store, as: 'store', attributes: ['name'] }],
      order: [['points_cost', 'ASC']]
    });
  }

  /**
   * Obtém detalhes de uma recompensa
   */
  async getRewardById(id) {
    const reward = await Reward.findByPk(id, {
      include: [{ model: Store, as: 'store' }]
    });

    if (!reward) throw new AppError('Recompensa não encontrada.', 404);
    return reward;
  }

  /**
   * Processa o resgate de uma recompensa (Troca de Pontos por Voucher)
   * Utiliza transação SQL para garantir atomicidade (Débito de pontos <-> Criação de Voucher)
   */
  async redeemReward(rewardId, userId) {
    const reward = await Reward.findByPk(rewardId);
    if (!reward || reward.status !== 'active') {
      throw new AppError('Esta recompensa não está disponível para resgate.', 400);
    }

    // 1. Inicia Transação
    const transaction = await Reward.sequelize.transaction();

    try {
      // 2. Busca e bloqueia a carteira para evitar gasto duplo (Lock Pessimista)
      const wallet = await Wallet.findOne({
        where: { user_id: userId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!wallet || wallet.balance_points < reward.points_cost) {
        throw new AppError('Saldo de pontos insuficiente para este resgate.', 400);
      }

      // 3. Verifica estoque da recompensa (se houver limite)
      if (reward.stock !== null && reward.stock <= 0) {
        throw new AppError('Recompensa esgotada.', 400);
      }

      // 4. Debita os pontos
      await wallet.decrement('balance_points', { by: reward.points_cost, transaction });

      // 5. Gera o Código Único do Voucher (Segurança)
      const voucherCode = `SG-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Date.now().toString().slice(-4)}`;

      // 6. Cria o Voucher
      const voucher = await Voucher.create({
        user_id: userId,
        reward_id: reward.id,
        store_id: reward.store_id,
        code: voucherCode,
        points_spent: reward.points_cost,
        status: 'active',
        expires_at: new Date(Date.now() + (reward.validity_days || 30) * 24 * 60 * 60 * 1000)
      }, { transaction });

      // 7. Regista a Transação Financeira (Auditoria)
      await Transaction.create({
        wallet_id: wallet.id,
        user_id: userId,
        type: 'points_spend',
        amount: reward.points_cost,
        description: `Resgate de recompensa: ${reward.title}`,
        reference_type: 'voucher',
        reference_id: voucher.id
      }, { transaction });

      // 8. Atualiza estoque da recompensa
      if (reward.stock !== null) {
        await reward.decrement('stock', { by: 1, transaction });
      }

      await transaction.commit();

      logger.info(`Voucher ${voucherCode} gerado para o utilizador ${userId}`);
      return voucher;

    } catch (error) {
      await transaction.rollback();
      logger.error(`Falha no resgate de recompensa: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista os vouchers ativos do utilizador
   */
  async getUserVouchers(userId, status = 'active') {
    return await Voucher.findAll({
      where: { user_id: userId, status },
      include: [{ model: Reward, as: 'reward' }],
      order: [['expires_at', 'ASC']]
    });
  }

  /**
   * Validação e Consumo do Voucher (Ação do Lojista/Parceiro)
   */
  async useVoucher(code, partnerStoreId) {
    const voucher = await Voucher.findOne({
      where: { code, status: 'active' },
      include: [{ model: Reward, as: 'reward' }]
    });

    if (!voucher) {
      throw new AppError('Voucher inválido ou já utilizado.', 404);
    }

    // Verifica se o voucher pertence à loja que está tentando validar
    if (voucher.store_id !== partnerStoreId) {
      throw new AppError('Este voucher não pertence a este estabelecimento.', 403);
    }

    if (new Date() > voucher.expires_at) {
      await voucher.update({ status: 'expired' });
      throw new AppError('Este voucher expirou.', 400);
    }

    await voucher.update({
      status: 'used',
      used_at: new Date()
    });

    return {
      message: 'Voucher validado com sucesso!',
      reward_title: voucher.reward.title
    };
  }
}

module.exports = new RewardService();
