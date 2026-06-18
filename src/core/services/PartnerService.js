const { Partner, Store, Product, ScanLog, User } = require('../../database/models');
const StorageProvider = require('../providers/StorageProvider');
const EmailProvider = require('../providers/EmailProvider');
const AppError = require('../../shared/errors/AppError');
const logger = require('../../config/logger');

class PartnerService {
  /**
   * Cria uma solicitação de parceria (Lead de Onboarding)
   */
  async createPartnerRequest(partnerData) {
    const { company_name, tax_id, email, contact_name } = partnerData;

    // 1. Verifica se já existe um parceiro com este NIF/TaxID ou Email
    const existingPartner = await Partner.findOne({
      where: { [Partner.sequelize.Op.or]: [{ tax_id }, { email }] }
    });

    if (existingPartner) {
      throw new AppError('Esta empresa ou e-mail já possui uma solicitação ou conta ativa.', 400);
    }

    // 2. Cria o registro com status 'pending_approval'
    const partner = await Partner.create({
      company_name,
      tax_id,
      email,
      contact_name,
      status: 'pending_approval'
    });

    // 3. Notifica a equipe administrativa por e-mail
    // EmailProvider.sendAdminNotification('NEW_PARTNER_REQUEST', partner);

    return partner;
  }

  /**
   * Obtém o perfil corporativo completo
   */
  async getPartnerProfile(partnerId) {
    const partner = await Partner.findByPk(partnerId, {
      include: [{ model: Store, as: 'stores' }]
    });

    if (!partner) {
      throw new AppError('Parceiro não encontrado.', 404);
    }

    return partner;
  }

  /**
   * Atualiza dados do parceiro
   */
  async updatePartner(partnerId, updateData) {
    const partner = await Partner.findByPk(partnerId);

    if (!partner) {
      throw new AppError('Parceiro não encontrado.', 404);
    }

    await partner.update(updateData);
    return partner;
  }

  /**
   * Consolida estatísticas para o Dashboard do Parceiro
   * Agrega dados de todas as lojas vinculadas ao parceiro
   */
  async getDashboardStats(partnerId) {
    // 1. Busca todas as lojas do parceiro
    const stores = await Store.findAll({
      where: { partner_id: partnerId },
      attributes: ['id']
    });

    const storeIds = stores.map(s => s.id);

    // 2. Agrega métricas (Exemplo de contagem de scans e produtos ativos)
    const totalScans = await ScanLog.count({
      where: { store_id: { [Store.sequelize.Op.in]: storeIds } }
    });

    const activeProducts = await Product.count({
      where: { partner_id: partnerId, status: 'active' }
    });

    // 3. Busca crescimento (ex: scans nos últimos 7 dias)
    const lastWeekScans = await ScanLog.count({
      where: {
        store_id: { [Store.sequelize.Op.in]: storeIds },
        created_at: { [Store.sequelize.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    return {
      total_stores: stores.length,
      total_products: activeProducts,
      total_scans: totalScans,
      scans_last_week: lastWeekScans,
      conversion_rate: totalScans > 0 ? (lastWeekScans / totalScans).toFixed(2) : 0
    };
  }

  /**
   * Processa o upload e vinculação de documentos KYC
   */
  async processDocuments(partnerId, files) {
    const partner = await Partner.findByPk(partnerId);

    const documentUrls = [];

    // Faz o upload de cada arquivo individualmente usando o StorageProvider
    for (const file of files) {
      const url = await StorageProvider.saveFile(file, 'documents');
      documentUrls.push(url);
    }

    // Atualiza a lista de documentos no banco (assumindo campo JSON ou tabela relacionada)
    const updatedDocs = [...(partner.documents || []), ...documentUrls];
    await partner.update({ documents: updatedDocs, status: 'under_review' });

    logger.info(`Documentos enviados para o parceiro ${partnerId}. Status: under_review`);

    return { documents: updatedDocs };
  }
}

module.exports = new PartnerService();
