require('dotenv').config();

module.exports = {
  // Configurações do Access Token (JWT Principal)
  jwt: {
    secret: process.env.JWT_SECRET || 'scango_default_secret_key_123',
    expiresIn: process.env.JWT_EXPIRATION || '15m', // Curta duração por segurança
  },

  // Configurações do Refresh Token (Para renovação de sessão)
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'scango_refresh_secret_key_456',
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d', // Longa duração
  },

  // Configurações de Criptografia (Bcrypt)
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },

  // Configurações de OTP (One-Time Password)
  otp: {
    expiresInMinutes: 10,
    length: 6,
  },

  // Configurações de Sessão e Segurança de Dispositivos
  sessions: {
    maxDevicesPerUser: 5, // Limite de dispositivos logados simultaneamente
  }
};
