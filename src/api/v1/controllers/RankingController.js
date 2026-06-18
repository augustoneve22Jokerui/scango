const RankingService = require('../../../core/services/RankingService');
const logger = require('../../../config/logger');

class RankingController {
  /**
   * Obtém o ranking global (Nacional) com paginação
   */
  async getGlobal(req, res, next) {
    try {
      const { page, limit, period } = req.query; // period: weekly, monthly, all_time
      const ranking = await RankingService.getGlobalRanking({ page, limit, period });

      return res.status(200).json({
        success: true,
        data: ranking
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém o ranking segmentado por Província ou Município
   */
  async getByLocation(req, res, next) {
    try {
      const { province, city, page, limit } = req.query;
      const ranking = await RankingService.getLocationRanking({
        province,
        city,
        page,
        limit
      });

      return res.status(200).json({
        success: true,
        data: ranking
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém a posição específica do utilizador autenticado nos diversos rankings
   */
  async getMyPosition(req, res, next) {
    try {
      const userId = req.user.id;
      const positions = await RankingService.getUserPositions(userId);

      return res.status(200).json({
        success: true,
        data: positions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém o ranking de parceiros (Lojas com mais scans ou melhor avaliação)
   */
  async getPartnerRanking(req, res, next) {
    try {
      const { category, page, limit } = req.query;
      const ranking = await RankingService.getStoresRanking({ category, page, limit });

      return res.status(200).json({
        success: true,
        data: ranking
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RankingController();
