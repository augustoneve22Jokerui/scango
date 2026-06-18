const logger = require('../../config/logger');

/**
 * Nota: Esta implementação utiliza a estrutura para integração com o Firebase Admin SDK.
 * Para fins de arquitetura, focamos na abstração do método de envio.
 */
class PushProvider {
  constructor() {
    this.enabled = process.env.PUSH_ENABLED === 'true';

    // Inicialização do Firebase Admin (Exemplo)
    /*
    if (this.enabled) {
      admin.initializeApp({
        credential: admin.credential.cert(require('../../config/firebase-service-account.json'))
      });
    }
    */
  }

  /**
   * Envia uma notificação Push para um dispositivo específico
   * @param {string} deviceToken - Token FCM do dispositivo do utilizador
   * @param {Object} payload - { title, body, data }
   */
  async sendPush(deviceToken, { title, body, data = {} }) {
    if (!this.enabled) {
      logger.debug(`Push desativado: ${title} para token ${deviceToken.substring(0, 10)}...`);
      return null;
    }

    try {
      const message = {
        notification: { title, body },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK', // Padrão para apps Flutter/React Native
        },
        token: deviceToken,
      };

      // Simulação do disparo via Firebase
      // const response = await admin.messaging().send(message);

      logger.info(`Push enviado com sucesso para o token ${deviceToken.substring(0, 10)}...`);
      return true;
    } catch (error) {
      logger.error(`Erro ao enviar Push Notification: ${error.message}`);

      // Se o token for inválido (not_registered), o serviço de notificação deve ser avisado
      // para remover o token do banco de dados (Cleanup)
      if (error.code === 'messaging/registration-token-not-registered') {
        logger.warn(`Token inválido detectado. Deve ser removido do banco: ${deviceToken}`);
      }

      return false;
    }
  }

  /**
   * Envia notificações em massa para um tópico (Ex: 'promocoes_luanda')
   */
  async sendToTopic(topic, { title, body, data = {} }) {
    if (!this.enabled) return null;

    try {
      const message = {
        notification: { title, body },
        data,
        topic,
      };

      // await admin.messaging().send(message);
      logger.info(`Push enviado para o tópico: ${topic}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao enviar Push para tópico ${topic}: ${error.message}`);
      return false;
    }
  }

  /**
   * Template: Notificação de Recompensa Recebida
   */
  async notifyRewardClaimed(deviceToken, points) {
    return this.sendPush(deviceToken, {
      title: '🎉 Parabéns!',
      body: `Você acaba de ganhar ${points} pontos. Continue escaneando!`,
      data: { type: 'REWARD', points: String(points) }
    });
  }
}

module.exports = new PushProvider();
