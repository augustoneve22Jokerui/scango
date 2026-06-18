const MissionService = require('../../../core/services/MissionService');
const logger = require('../../../config/logger');

class MissionController {
  /**
   * Lista todas as missões disponíveis para o usuário (Diárias, Semanais, Especiais)
   */
  async index(req, res, next) {
    try {
      const userId = req.user.id;
      const missions = await MissionService.getAvailableMissions(userId);

      return res.status(200).json({
        success: true,
        data: missions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém detalhes de uma missão específica e o progresso atual do usuário nela
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const missionDetail = await MissionService.getMissionProgress(id, userId);

      return res.status(200).json({
        success: true,
        data: missionDetail
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Processa o resgate de recompensa de uma missão concluída
   */
  async claim(req, res, next) {
    try {
      const { id } = req.params; // ID da missão
      const userId = req.user.id;

      const reward = await MissionService.claimMissionReward(id, userId);

      logger.info(`Usuário ${userId} resgatou recompensa da missão ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Recompensa resgatada com sucesso!',
        data: reward
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria uma nova missão (Ação exclusiva de Admin ou Parceiro Master)
   */
  async store(req, res, next) {
    try {
      const missionData = req.body;
      const partnerId = req.partner?.id; // Se for criado por um parceiro

      const newMission = await MissionService.createMission({
        ...missionData,
        partner_id: partnerId
      });

      return res.status(201).json({
        success: true,
        message: 'Missão criada com sucesso.',
        data: newMission
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista o histórico de missões concluídas pelo usuário
   */
  async history(req, res, next) {
    try {
      const userId = req.user.id;
      const { page, limit } = req.query;

      const history = await MissionService.getUserMissionHistory(userId, { page, limit });

      return res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MissionController();
