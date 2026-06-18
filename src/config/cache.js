require('dotenv').config();

module.exports = {
  // Configurações de Conexão com Redis
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,

  // Prefixo para evitar colisão de chaves se o Redis for compartilhado
  keyPrefix: 'scango:',

  // Configurações de TTL (Time To Live) Padrão
  ttl: {
    short: 60 * 5,          // 5 minutos (ex: Rankings em tempo real)
    medium: 60 * 60,       // 1 hora (ex: Catálogo de produtos)
    long: 60 * 60 * 24,    // 1 dia (ex: Configurações globais)
  },

  // Configurações de Retry Strategy (Resiliência)
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },

  // Habilitar/Desabilitar Cache Globalmente
  enabled: process.env.CACHE_ENABLED === 'true',
};
