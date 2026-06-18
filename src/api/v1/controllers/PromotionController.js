const PromotionService = require('../../../core/services/PromotionService');
const logger = require('../../../config/logger');

class PromotionController {
  /**
   * Lista todas as promoções ativas com filtros (loja, produto, validade)
   */
  async index(req, res, next) {
    try {
      const filters = req.query; // store_id, product_id, category_id
      const promotions = await PromotionService.listActivePromotions(filters);

      return res.status(200).json({
        success: true,
        data: promotions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém detalhes de uma promoção específica
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const promotion = await PromotionService.getPromotionDetails(id);

      return res.status(200).json({
        success: true,
        data: promotion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria uma nova promoção (Ação do Parceiro/Lojista)
   */
  async store(req, res, next) {
    try {
      const promotionData = req.body;
      const partnerId = req.partner.id;

      const newPromotion = await PromotionService.createPromotion(partnerId, promotionData);

      logger.info(`Nova promoção criada pelo parceiro ${partnerId}: ${newPromotion.name}`);

      return res.status(201).json({
        success: true,
        message: 'Promoção criada com sucesso.',
        data: newPromotion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza uma promoção existente (Datas, porcentagem de desconto, status)
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const partnerId = req.partner.id;

      const updatedPromotion = await PromotionService.updatePromotion(id, partnerId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Promoção atualizada com sucesso.',
        data: updatedPromotion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Encerra uma promoção antecipadamente (Soft Delete/Inativar)
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const partnerId = req.partner.id;

      await PromotionService.deactivatePromotion(id, partnerId);

      logger.warn(`Promoção ${id} encerrada pelo parceiro ${partnerId}`);

      return res.status(200).json({
        success: true,
        message: 'Promoção encerrada com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromotionController();
