const nodemailer = require('nodemailer');
const mailConfig = require('../../config/mailer');
const logger = require('../../config/logger');

class EmailProvider {
  constructor() {
    // Inicializa o transportador com as configurações de pool do mailer.js
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: mailConfig.auth,
      pool: mailConfig.pool,
      maxConnections: mailConfig.maxConnections,
      maxMessages: mailConfig.maxMessages
    });

    // Verifica a conexão ao iniciar (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      this.transporter.verify((error) => {
        if (error) {
          logger.error(`Falha ao conectar ao servidor SMTP: ${error.message}`);
        } else {
          logger.info('Servidor SMTP pronto para enviar mensagens.');
        }
      });
    }
  }

  /**
   * Envio genérico de e-mail transacional
   */
  async sendTransactionalEmail(to, subject, content) {
    try {
      const info = await this.transporter.sendMail({
        from: mailConfig.defaults.from,
        to,
        subject,
        html: content, // Aqui poderíamos usar um motor de templates como Handlebars
        text: content.replace(/<[^>]*>?/gm, '') // Versão texto simples básica
      });

      logger.info(`E-mail enviado: ${info.messageId} para ${to}`);
      return info;
    } catch (error) {
      logger.error(`Erro ao enviar e-mail para ${to}: ${error.message}`);
      // Não lançamos erro para não quebrar o fluxo principal do Service
      return null;
    }
  }

  /**
   * Template: E-mail de Boas-vindas
   */
  async sendWelcomeEmail(email, name) {
    const html = `
      <h1>Bem-vindo ao ScanGo, ${name}!</h1>
      <p>Estamos felizes por ter você connosco. Comece agora a escanear produtos e ganhar recompensas.</p>
    `;
    return this.sendTransactionalEmail(email, 'Bem-vindo ao ScanGo!', html);
  }

  /**
   * Template: Código OTP para Verificação
   */
  async sendOTPEmail(email, code) {
    const html = `
      <h1>Seu código de verificação ScanGo</h1>
      <p>Utilize o código abaixo para validar sua ação:</p>
      <h2 style="letter-spacing: 5px; font-size: 32px;">${code}</h2>
      <p>Este código expira em 10 minutos.</p>
    `;
    return this.sendTransactionalEmail(email, `${code} é seu código de verificação`, html);
  }

  /**
   * Template: Envio de Fatura (Invoice) para Parceiros
   */
  async sendInvoice(partnerEmail, invoiceData) {
    const html = `
      <h1>Nova Fatura Gerada</h1>
      <p>Olá, o pagamento do seu plano ScanGo foi processado com sucesso.</p>
      <p>Valor: ${invoiceData.amount}</p>
      <p>Data: ${new Date(invoiceData.paid_at).toLocaleDateString()}</p>
    `;
    return this.sendTransactionalEmail(partnerEmail, 'Sua fatura ScanGo chegou', html);
  }
}

module.exports = new EmailProvider();
