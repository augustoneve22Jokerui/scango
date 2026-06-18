const CampaignService = require('../../../core/services/CampaignService');
const logger = require('../../../config/logger');

class CampaignController {
  /**
   * Lista todas as campanhas ativas e disponíveis para o utilizador
   */
  async index(req, res, next) {
    try {
      const { type, location } = req.query;
      const campaigns = await CampaignService.listActiveCampaigns({ type, location });

      return res.status(200).json({
        success: true,
        data: campaigns
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém detalhes de uma campanha específica (regras, prazos, prêmios)
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const campaign = await CampaignService.getCampaignDetails(id);

      return res.status(200).json({
        success: true,
        data: campaign
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Regista a participação ou interesse do utilizador numa campanha
   */
  async participate(req, res, next) {
    try {
      const { id } = req.params; // ID da campanha
      const userId = req.user.id;

      const participation = await CampaignService.joinCampaign(id, userId);

      logger.info(`Utilizador ${userId} aderiu à campanha ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Participação registada com sucesso.',
        data: participation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria uma nova campanha (Ação de Admin ou Parceiro com permissão Master)
   */
  async store(req, res, next) {
    try {
      const campaignData = req.body;
      const partnerId = req.partner?.id; // Se for criado por um parceiro patrocinador

      const newCampaign = await CampaignService.createCampaign({
        ...campaignData,
        partner_id: partnerId
      });

      logger.info(`Nova campanha criada: ${newCampaign.title}`);

      return res.status(201).json({
        success: true,
        message: 'Campanha criada com sucesso.',
        data: newCampaign
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém estatísticas de performance da campanha (Apenas para o criador/Admin)
   */
  async getStats(req, res, next) {
    try {
      const { id } = req.params;
      const partnerId = req.partner.id;

      const stats = await CampaignService.getCampaignMetrics(id, partnerId);

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CampaignController();
