const AchievementService = require('../../../core/services/AchievementService');
const logger = require('../../../config/logger');

class AchievementController {
  /**
   * Lista todas as conquistas existentes no sistema e o status global
   */
  async index(req, res, next) {
    try {
      const { category } = req.query;
      const achievements = await AchievementService.listAllAchievements(category);

      return res.status(200).json({
        success: true,
        data: achievements
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista apenas as conquistas que o utilizador autenticado já desbloqueou
   */
  async myAchievements(req, res, next) {
    try {
      const userId = req.user.id;
      const myBadges = await AchievementService.getUserAchievements(userId);

      return res.status(200).json({
        success: true,
        data: myBadges
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém detalhes de uma conquista específica e o progresso do utilizador nela
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const detail = await AchievementService.getAchievementDetail(id, userId);

      return res.status(200).json({
        success: true,
        data: detail
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica se o utilizador desbloqueou novas conquistas (Trigger manual ou via App)
   * Útil para o App chamar após ações significativas
   */
  async checkNew(req, res, next) {
    try {
      const userId = req.user.id;
      const newBadges = await AchievementService.checkForNewAchievements(userId);

      return res.status(200).json({
        success: true,
        message: newBadges.length > 0 ? 'Novas conquistas desbloqueadas!' : 'Nenhuma conquista nova.',
        data: newBadges
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AchievementController();
