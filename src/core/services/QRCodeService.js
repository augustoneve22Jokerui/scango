const { QRCode, ScanLog, Mission, UserMission, Sequelize } = require('../../database/models');
const UserService = require('./UserService');
const AppError = require('../../shared/errors/AppError');
const crypto = require('crypto');
const logger = require('../../config/logger');

class QRCodeService {
  /**
   * Gera um novo QR Code dinâmico com metadados de segurança
   */
  async createQRCode(qrData) {
    const { type, partner_id, store_id, expires_at, max_uses, metadata } = qrData;

    // Gera um código único e difícil de prever (Hash + UUID)
    const uniqueCode = crypto.randomBytes(16).toString('hex');

    return await QRCode.create({
      code: uniqueCode,
      type, // 'public', 'private', 'campaign', 'event'
      partner_id,
      store_id,
      metadata, // Dados extras em JSON (ex: ID da missão vinculada)
      max_uses: max_uses || 0, // 0 = ilimitado
      current_uses: 0,
      expires_at,
      status: 'active'
    });
  }

  /**
   * Valida um scan e processa a lógica de negócio associada
   */
  async validateAndProcessScan(code, userId, location = {}) {
    const qrCode = await QRCode.findOne({
      where: { code, status: 'active' }
    });

    // 1. Verificações de Validade
    if (!qrCode) {
      throw new AppError('QR Code inválido ou já desativado.', 404);
    }

    if (qrCode.expires_at && new Date() > qrCode.expires_at) {
      await qrCode.update({ status: 'expired' });
      throw new AppError('Este QR Code expirou.', 400);
    }

    if (qrCode.max_uses > 0 && qrCode.current_uses >= qrCode.max_uses) {
      await qrCode.update({ status: 'exhausted' });
      throw new AppError('Este código atingiu o limite máximo de utilizações.', 400);
    }

    // 2. Verificação de Duplicidade (Se for do tipo que permite apenas 1 por usuário)
    if (qrCode.type === 'private' || qrCode.type === 'campaign') {
      const alreadyScanned = await ScanLog.findOne({
        where: { qrcode_id: qrCode.id, user_id: userId }
      });
      if (alreadyScanned) {
        throw new AppError('Você já resgatou este código anteriormente.', 400);
      }
    }

    // 3. Processamento do Scan (Transacional)
    const transaction = await QRCode.sequelize.transaction();
    try {
      // Incrementar uso
      await qrCode.increment('current_uses', { transaction });

      // Registar Log de Scan
      await ScanLog.create({
        user_id: userId,
        qrcode_id: qrCode.id,
        store_id: qrCode.store_id,
        metadata: { ...location, timestamp: new Date() }
      }, { transaction });

      // 4. Lógica Extra baseada no tipo (Gamificação)
      let rewardInfo = null;
      if (qrCode.type === 'campaign') {
        // Ex: Adiciona XP extra por campanha especial
        rewardInfo = await UserService.addExperience(userId, 50, 'SPECIAL_CAMPAIGN_SCAN');
      }

      await transaction.commit();

      logger.info(`QR Code ${code} validado com sucesso para o usuário ${userId}`);

      return {
        success: true,
        type: qrCode.type,
        metadata: qrCode.metadata,
        reward: rewardInfo
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`Erro ao processar scan de QR Code: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lista QR Codes de um parceiro com contagem de scans em tempo real
   */
  async listPartnerQRCodes(partnerId, { page = 1, limit = 10, type }) {
    const offset = (page - 1) * limit;
    const where = { partner_id: partnerId };
    if (type) where.type = type;

    return await QRCode.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Obtém estatísticas detalhadas de um QR Code
   */
  async getQRCodeWithStats(id, partnerId) {
    const qrCode = await QRCode.findOne({
      where: { id, partner_id: partnerId },
      include: [
        { model: ScanLog, as: 'scans', limit: 5, order: [['created_at', 'DESC']] }
      ]
    });

    if (!qrCode) throw new AppError('QR Code não encontrado.', 404);

    return qrCode;
  }

  /**
   * Revoga um QR Code manualmente
   */
  async deactivateQRCode(id, partnerId) {
    const qrCode = await QRCode.findOne({ where: { id, partner_id: partnerId } });
    if (!qrCode) throw new AppError('QR Code não encontrado.', 404);

    return await qrCode.update({ status: 'revoked' });
  }
}

module.exports = new QRCodeService();
