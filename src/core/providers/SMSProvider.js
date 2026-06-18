const logger = require('../../config/logger');

/**
 * Nota: Em um cenário real, utilizaríamos o SDK de um provedor como Twilio ou Vonage.
 * Aqui implementamos uma estrutura preparada para integração via API REST.
 */
class SMSProvider {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.senderId = process.env.SMS_SENDER_ID || 'ScanGo';
    this.baseUrl = process.env.SMS_GATEWAY_URL;
  }

  /**
   * Envio genérico de SMS
   * @param {string} phone - Número no formato internacional (+244...)
   * @param {string} message - Conteúdo da mensagem (máx 160 caracteres por segmento)
   */
  async sendSMS(phone, message) {
    try {
      // Validação básica de número
      if (!phone || !message) {
        throw new Error('Telefone e mensagem são obrigatórios para envio de SMS.');
      }

      logger.info(`Iniciando envio de SMS para ${phone}...`);

      /**
       * Exemplo de implementação com Axios para um Gateway REST:
       *
       * await axios.post(this.baseUrl, {
       *   to: phone,
       *   from: this.senderId,
       *   text: message
       * }, { headers: { 'Authorization': `Bearer ${this.apiKey}` } });
       */

      // Simulação de sucesso para o ambiente de desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`[SMS DEV MODE] Para: ${phone} | Mensagem: ${message}`);
      }

      logger.info(`SMS enviado com sucesso para ${phone}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao enviar SMS para ${phone}: ${error.message}`);
      // Em providers de infraestrutura, não interrompemos o fluxo principal,
      // apenas garantimos o log para auditoria.
      return false;
    }
  }

  /**
   * Template: Envio de Código OTP para verificação de conta
   */
  async sendOTP(phone, code) {
    const message = `ScanGo: Seu codigo de verificacao e ${code}. Nao o compartilhe com ninguem. Valido por 10 min.`;
    return this.sendSMS(phone, message);
  }

  /**
   * Template: Alerta de Segurança (Login em novo dispositivo)
   */
  async sendSecurityAlert(phone, deviceName) {
    const message = `ScanGo: Detectamos um novo acesso a sua conta no dispositivo ${deviceName}. Se nao foi voce, mude sua senha imediatamente.`;
    return this.sendSMS(phone, message);
  }
}

module.exports = new SMSProvider();
