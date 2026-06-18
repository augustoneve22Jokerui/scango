const { Notification, User, Profile, Sequelize } = require('../../database/models');
const EmailProvider = require('../providers/EmailProvider');
const PushProvider = require('../providers/PushProvider');
const AppError = require('../../shared/errors/AppError');
const logger = require('../../config/logger');

class NotificationService {
  /**
   * Dispara uma notificação multicanal
   * @param {Object} data - { userId, title, message, type, metadata, channels: ['push', 'email', 'inbox'] }
   */
  async sendNotification({ userId, title, message, type, metadata = {}, channels = ['inbox'] }) {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: Profile, as: 'profile' }]
      });

      if (!user) throw new AppError('Utilizador destino não encontrado.', 404);

      const results = {};

      // 1. Canal: INBOX (Persistência no Banco de Dados)
      if (channels.includes('inbox')) {
        results.inbox = await Notification.create({
          user_id: userId,
          title,
          message,
          type, // 'system', 'promo', 'security', 'achievement'
          metadata,
          read: false
        });

        // Enviar via Socket.IO se o utilizador estiver online (Real-time In-App)
        // O app.js injetará a instância do IO no global ou usaremos um helper
        if (global.io) {
          global.io.to(`user:${userId}`).emit('notification', results.inbox);
        }
      }

      // 2. Canal: PUSH (Firebase/OneSignal)
      if (channels.includes('push') && user.push_token) {
        PushProvider.sendPush(user.push_token, { title, body: message, data: metadata })
          .catch(err => logger.error(`Falha no Push (User ${userId}): ${err.message}`));
      }

      // 3. Canal: EMAIL (Nodemailer)
      if (channels.includes('email')) {
        EmailProvider.sendTransactionalEmail(user.email, title, message)
          .catch(err => logger.error(`Falha no Email (User ${userId}): ${err.message}`));
      }

      return results;
    } catch (error) {
      logger.error(`Erro ao processar notificação: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtém notificações do utilizador com paginação
   */
  async getUserNotifications(userId, { page = 1, limit = 20, type, read }) {
    const offset = (page - 1) * limit;
    const where = { user_id: userId };

    if (type) where.type = type;
    if (read !== undefined) where.read = read === 'true';

    return await Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Marca uma notificação específica como lida
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, user_id: userId }
    });

    if (!notification) throw new AppError('Notificação não encontrada.', 404);

    return await notification.update({ read: true, read_at: new Date() });
  }

  /**
   * Marca todas como lidas
   */
  async markAllAsRead(userId) {
    return await Notification.update(
      { read: true, read_at: new Date() },
      { where: { user_id: userId, read: false } }
    );
  }

  /**
   * Eliminação de notificação
   */
  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, user_id: userId }
    });

    if (!notification) throw new AppError('Notificação não encontrada.', 404);

    return await notification.destroy();
  }

  /**
   * Gestão de Preferências (Ex: Utilizador desativa emails de marketing)
   */
  async getUserPreferences(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['notification_preferences']
    });
    return user.notification_preferences || { push: true, email: true, promo: true };
  }

  async updateUserPreferences(userId, preferences) {
    const user = await User.findByPk(userId);
    return await user.update({ notification_preferences: preferences });
  }
}

module.exports = new NotificationService();
