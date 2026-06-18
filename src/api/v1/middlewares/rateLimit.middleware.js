const rateLimit = require('express-rate-limit');

/**
 * Configuração base para as mensagens de erro do Rate Limit
 */
const limitReachedHandler = (req, res) => {
  return res.status(429).json({
    success: false,
    message: 'Muitas requisições originadas deste IP. Por favor, tente novamente mais tarde.'
  });
};

/**
 * Limite Geral para a API (Consultas, Feed, Mapa)
 * Permite 100 requisições a cada 15 minutos por IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  handler: limitReachedHandler,
  standardHeaders: true, // Retorna info de limite nos headers RateLimit-*
  legacyHeaders: false,  // Desabilita os headers X-RateLimit-*
});

/**
 * Limite Estrito para Autenticação (Login, Registro, Password Reset)
 * Permite apenas 5 tentativas a cada 15 minutos por IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Muitas tentativas de login ou registro. Por segurança, tente novamente em 15 minutos.'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limite para Envio de OTP (SMS/Email)
 * Evita gastos excessivos com provedores de disparo e spam
 */
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Limite de solicitação de código atingido. Tente novamente em 1 hora.'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter
};
