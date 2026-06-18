const { User, Profile, XPHistory, Level } = require('../../database/models');
const StorageProvider = require('../providers/StorageProvider');
const AppError = require('../../shared/errors/AppError');
const logger = require('../../config/logger');

class UserService {
  /**
   * Obtém o perfil completo do utilizador, incluindo nível e conquistas
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'role', 'status'],
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['name', 'avatar_url', 'bio', 'phone', 'xp', 'level_id']
        }
      ]
    });

    if (!user) {
      throw new AppError('Utilizador não encontrado.', 404);
    }

    return user;
  }

  /**
   * Atualiza dados básicos do perfil
   */
  async updateProfile(userId, updateData) {
    const profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      throw new AppError('Perfil não encontrado.', 404);
    }

    // Filtra apenas campos permitidos para atualização manual
    const { name, bio, phone } = updateData;

    await profile.update({ name, bio, phone });

    return profile;
  }

  /**
   * Processa a troca de avatar e remove a imagem antiga do storage
   */
  async updateAvatar(userId, file) {
    const profile = await Profile.findOne({ where: { user_id: userId } });

    // 1. Upload da nova imagem via Provider (abstração de Local/Cloud)
    const avatarUrl = await StorageProvider.saveFile(file, 'avatars');

    // 2. Se já existia um avatar, apaga o antigo para economizar espaço
    if (profile.avatar_url) {
      await StorageProvider.deleteFile(profile.avatar_url);
    }

    // 3. Atualiza o banco de dados
    await profile.update({ avatar_url: avatarUrl });

    return avatarUrl;
  }

  /**
   * Motor de Gamificação: Adiciona XP ao utilizador e verifica Level Up
   */
  async addExperience(userId, amount, reason) {
    const transaction = await Profile.sequelize.transaction();

    try {
      const profile = await Profile.findOne({
        where: { user_id: userId },
        transaction
      });

      // 1. Registra o histórico de XP
      await XPHistory.create({
        user_id: userId,
        amount,
        reason, // ex: 'PRODUCT_SCAN', 'MISSION_COMPLETED'
      }, { transaction });

      // 2. Atualiza XP acumulado
      const newXp = profile.xp + amount;

      // 3. Lógica de Level Up (Pode ser baseada em tabela ou fórmula)
      // Exemplo: Nível = Math.floor(Math.sqrt(xp / 100))
      const newLevelId = await this.calculateLevel(newXp);

      const hasLeveledUp = newLevelId > profile.level_id;

      await profile.update({
        xp: newXp,
        level_id: newLevelId
      }, { transaction });

      await transaction.commit();

      if (hasLeveledUp) {
        logger.info(`Utilizador ${userId} subiu para o nível ${newLevelId}`);
        // Aqui poderíamos disparar uma notificação Push de Level Up
      }

      return { xp: newXp, level: newLevelId, leveledUp: hasLeveledUp };
    } catch (error) {
      await transaction.rollback();
      logger.error(`Erro ao adicionar XP: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cálculo de nível baseado em faixas de XP (Consulda a tabela Levels)
   */
  async calculateLevel(xpAmount) {
    const level = await Level.findOne({
      where: {
        required_xp: {
          [Level.sequelize.Op.lte]: xpAmount
        }
      },
      order: [['required_xp', 'DESC']]
    });

    return level ? level.id : 1;
  }

  /**
   * Obtém histórico de atividades paginado
   */
  async getHistory(userId, { page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    return await XPHistory.findAndCountAll({
      where: { user_id: userId },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }
}

module.exports = new UserService();
