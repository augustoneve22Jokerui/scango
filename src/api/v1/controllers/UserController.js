const UserService = require('../../../core/services/UserService');
const logger = require('../../../config/logger');

class UserController {
  /**
   * Obtém os dados do perfil do usuário autenticado
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id; // Injetado pelo authMiddleware
      const profile = await UserService.getProfile(userId);

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza informações do perfil (nome, bio, telefone, etc)
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      
      const updatedUser = await UserService.updateProfile(userId, updateData);

      logger.info(`Perfil atualizado: ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso.',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza a foto de perfil (Avatar)
   */
  async updateAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo de imagem enviado.'
        });
      }

      const userId = req.user.id;
      const avatarUrl = await UserService.updateAvatar(userId, req.file);

      return res.status(200).json({
        success: true,
        message: 'Avatar atualizado com sucesso.',
        data: { avatar_url: avatarUrl }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém estatísticas de gamificação (Nível, XP, Próximo Nível)
   */
  async getStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await UserService.getStats(userId);

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém o histórico de atividades do usuário (Scans, Missões completas)
   */
  async getHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { page, limit } = req.query;
      
      const history = await UserService.getHistory(userId, { page, limit });

      return res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();