const PartnerService = require('../../../core/services/PartnerService');
const logger = require('../../../config/logger');

class PartnerController {
  /**
   * Solicitação de cadastro para novos parceiros (Onboarding)
   */
  async register(req, res, next) {
    try {
      const partnerData = req.body;
      const result = await PartnerService.createPartnerRequest(partnerData);

      logger.info(`Nova solicitação de parceria: ${partnerData.company_name}`);

      return res.status(201).json({
        success: true,
        message: 'Solicitação de parceria enviada com sucesso. Nossa equipa entrará em contacto.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém os dados corporativos do parceiro logado
   */
  async getProfile(req, res, next) {
    try {
      const partnerId = req.partner.id; // Injetado por middleware de autenticação de parceiro
      const profile = await PartnerService.getPartnerProfile(partnerId);

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza dados da empresa/parceiro
   */
  async updateProfile(req, res, next) {
    try {
      const partnerId = req.partner.id;
      const updateData = req.body;
      const result = await PartnerService.updatePartner(partnerId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Dados do parceiro atualizados com sucesso.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dashboard do Parceiro: Resumo de vendas, scans e performance global das suas lojas
   */
  async getDashboard(req, res, next) {
    try {
      const partnerId = req.partner.id;
      const stats = await PartnerService.getDashboardStats(partnerId);

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload de documentos de verificação (KYC do parceiro)
   */
  async uploadDocuments(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'Nenhum documento enviado.' });
      }

      const partnerId = req.partner.id;
      const result = await PartnerService.processDocuments(partnerId, req.files);

      return res.status(200).json({
        success: true,
        message: 'Documentos enviados para análise.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PartnerController();
