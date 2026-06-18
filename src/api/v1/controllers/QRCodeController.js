const QRCodeService = require('../../../core/services/QRCodeService');
const logger = require('../../../config/logger');

class QRCodeController {
  /**
   * Gera um novo QR Code (Campanha, Evento ou Produto)
   * Apenas Parceiros ou Admin
   */
  async generate(req, res, next) {
    try {
      const qrData = req.body;
      const partnerId = req.partner?.id; // Vincula ao parceiro se não for Admin

      const qrCode = await QRCodeService.createQRCode({
        ...qrData,
        partner_id: partnerId
      });

      logger.info(`QR Code gerado: ${qrCode.type} - ID: ${qrCode.id}`);

      return res.status(201).json({
        success: true,
        message: 'QR Code gerado com sucesso.',
        data: qrCode
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Valida um QR Code escaneado pelo usuário
   * Chamado pelo App Mobile após o scan
   */
  async validate(req, res, next) {
    try {
      const { code } = req.body;
      const userId = req.user.id;
      const { lat, lng } = req.body; // Geolocalização opcional para validação de presença

      const result = await QRCodeService.validateAndProcessScan(code, userId, { lat, lng });

      return res.status(200).json({
        success: true,
        message: 'QR Code validado com sucesso.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista QR Codes gerados pelo parceiro logado
   */
  async index(req, res, next) {
    try {
      const partnerId = req.partner.id;
      const { page, limit, type } = req.query;

      const qrcodes = await QRCodeService.listPartnerQRCodes(partnerId, { page, limit, type });

      return res.status(200).json({
        success: true,
        data: qrcodes
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém detalhes de um QR Code específico e suas estatísticas de uso
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const partnerId = req.partner.id;

      const qrDetails = await QRCodeService.getQRCodeWithStats(id, partnerId);

      return res.status(200).json({
        success: true,
        data: qrDetails
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoga (desativa) um QR Code antes da expiração
   */
  async revoke(req, res, next) {
    try {
      const { id } = req.params;
      const partnerId = req.partner.id;

      await QRCodeService.deactivateQRCode(id, partnerId);

      logger.warn(`QR Code revogado: ${id} pelo parceiro ${partnerId}`);

      return res.status(200).json({
        success: true,
        message: 'QR Code desativado com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QRCodeController();
