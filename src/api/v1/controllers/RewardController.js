const RewardService = require('../../../core/services/RewardService');
const logger = require('../../../config/logger');

class RewardController {
  /**
   * Lista todas as recompensas disponíveis para resgate no Marketplace
   */
  async index(req, res, next) {
    try {
      const { category, min_points, store_id } = req.query;
      const rewards = await RewardService.listAvailableRewards({
        category,
        min_points,
        store_id
      });

      return res.status(200).json({
        success: true,
        data: rewards
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém detalhes de uma recompensa específica
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const reward = await RewardService.getRewardById(id);

      return res.status(200).json({
        success: true,
        data: reward
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Processa a troca de pontos por uma recompensa (Geração de Voucher)
   */
  async redeem(req, res, next) {
    try {
      const { id } = req.params; // ID da recompensa
      const userId = req.user.id;

      const voucher = await RewardService.redeemReward(id, userId);

      logger.info(`Usuário ${userId} resgatou a recompensa ${id}. Voucher gerado.`);

      return res.status(201).json({
        success: true,
        message: 'Resgate realizado com sucesso! Seu voucher já está disponível.',
        data: voucher
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista os vouchers/recompensas que o usuário já resgatou e possui
   */
  async myRewards(req, res, next) {
    try {
      const userId = req.user.id;
      const { status } = req.query; // active, used, expired

      const userRewards = await RewardService.getUserVouchers(userId, status);

      return res.status(200).json({
        success: true,
        data: userRewards
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validação de Voucher (Ação do Lojista ao receber o prêmio do cliente)
   */
  async validateVoucher(req, res, next) {
    try {
      const { code } = req.body;
      const partnerId = req.partner.id;

      const result = await RewardService.useVoucher(code, partnerId);

      return res.status(200).json({
        success: true,
        message: 'Voucher validado e utilizado com sucesso.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RewardController();
