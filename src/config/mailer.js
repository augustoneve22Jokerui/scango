require('dotenv').config();

module.exports = {
  // Configurações do Servidor SMTP
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT == 465, // true para porta 465, false para outras
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },

  // Configurações de Remetente Padrão
  defaults: {
    from: process.env.MAIL_FROM || 'ScanGo <noreply@scango.com>',
  },

  // Configurações de Retentativa (Retry Strategy)
  pool: true, // Usa conexões simultâneas para maior performance
  maxConnections: 5,
  maxMessages: 100
};
