/**
 * Middleware para rastreamento de impressões digitais do dispositivo (Device Tracking)
 */
module.exports = (req, res, next) => {
  // 1. Extração de metadados do cabeçalho
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const deviceId = req.headers['x-device-id'] || null; // Enviado pelo App Mobile/Web

  // 2. Injeção de metadados no objeto da requisição
  // Isso facilita o uso posterior no AuthService e AuditService
  req.deviceInfo = {
    userAgent,
    ip: ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip,
    deviceId,
    // Identificação básica de plataforma
    platform: userAgent.toLowerCase().includes('android') ? 'android' :
              userAgent.toLowerCase().includes('iphone') ? 'ios' : 'web'
  };

  // 3. Log de segurança preventiva
  // Se uma rota de login for acessada sem Device ID, poderíamos marcar como suspeita

  return next();
};
