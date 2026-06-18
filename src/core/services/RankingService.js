const { Profile, User, Store, ScanLog, Sequelize } = require('../../database/models');
const { Op } = Sequelize;
const logger = require('../../config/logger');

class RankingService {
  /**
   * Obtém o ranking global de utilizadores baseado no XP total
   */
  async getGlobalRanking({ page = 1, limit = 10, period = 'all_time' }) {
    const offset = (page - 1) * limit;

    // Em uma implementação de produção, o "period" (weekly, monthly)
    // filtraria a tabela XPHistory em vez de ler o XP total do Profile.

    const ranking = await Profile.findAndCountAll({
      attributes: ['name', 'avatar_url', 'xp', 'level_id'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id'],
        where: { status: 'active' }
      }],
      limit,
      offset,
      order: [['xp', 'DESC']]
    });

    return ranking;
  }

  /**
   * Obtém o ranking segmentado por localização (Província ou Município)
   */
  async getLocationRanking({ province, city, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    const whereProfile = {};
    if (province) whereProfile.province = province;
    if (city) whereProfile.city = city;

    return await Profile.findAndCountAll({
      where: whereProfile,
      attributes: ['name', 'avatar_url', 'xp', 'level_id', 'province', 'city'],
      limit,
      offset,
      order: [['xp', 'DESC']]
    });
  }

  /**
   * Calcula a posição exata de um utilizador específico no ranking
   */
  async getUserPositions(userId) {
    const userProfile = await Profile.findOne({ where: { user_id: userId } });
    if (!userProfile) return null;

    // 1. Posição Nacional: Conta quantos utilizadores têm mais XP que o atual + 1
    const nationalPosition = await Profile.count({
      where: {
        xp: { [Op.gt]: userProfile.xp }
      }
    }) + 1;

    // 2. Posição Municipal (se o perfil tiver cidade definida)
    let cityPosition = null;
    if (userProfile.city) {
      cityPosition = await Profile.count({
        where: {
          city: userProfile.city,
          xp: { [Op.gt]: userProfile.xp }
        }
      }) + 1;
    }

    return {
      user_xp: userProfile.xp,
      national_rank: nationalPosition,
      city_rank: cityPosition,
      city_name: userProfile.city
    };
  }

  /**
   * Ranking de Parceiros/Lojas (Baseado no volume de Scans realizados)
   */
  async getStoresRanking({ category, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    // Consulta complexa: Agrega scans por loja
    const stores = await Store.findAll({
      attributes: [
        'id', 'name', 'logo_url',
        [Sequelize.fn('COUNT', Sequelize.col('scans.id')), 'total_scans']
      ],
      include: [{
        model: ScanLog,
        as: 'scans',
        attributes: [],
        required: false
      }],
      where: category ? { category_id: category } : {},
      group: ['Store.id'],
      order: [[Sequelize.literal('total_scans'), 'DESC']],
      limit,
      offset,
      subQuery: false // Necessário para usar LIMIT com GROUP BY e associações
    });

    return stores;
  }
}

module.exports = new RankingService();
