const NotificationService = require('../../../core/services/NotificationService');
const logger = require('../../../config/logger');

class NotificationController {
  /**
   * Lista todas as notificações do utilizador autenticado com paginação
   */
  async index(req, res, next) {
    try {
      const userId = req.user.id;
      const { page, limit, type, read } = req.query;

      const notifications = await NotificationService.getUserNotifications(userId, {
        page,
        limit,
        type, // 'push', 'email', 'system', 'promo'
        read  // 'true' or 'false'
      });

      return res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marca uma notificação específica como lida
   */
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await NotificationService.markAsRead(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Notificação marcada como lida.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marca todas as notificações do utilizador como lidas
   */
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;

      await NotificationService.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message: 'Todas as notificações foram marcadas como lidas.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina uma notificação do histórico
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await NotificationService.deleteNotification(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Notificação removida com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém as preferências de notificação do utilizador
   * (Ex: Se aceita Push de promoções, se quer e-mail de segurança, etc.)
   */
  async getPreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const preferences = await NotificationService.getUserPreferences(userId);

      return res.status(200).json({
        success: true,
        data: preferences
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza as preferências de notificação
   */
  async updatePreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const preferencesData = req.body;

      const updatedPreferences = await NotificationService.updateUserPreferences(userId, preferencesData);

      logger.info(`Preferências de notificação atualizadas para o utilizador ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Preferências atualizadas com sucesso.',
        data: updatedPreferences
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
