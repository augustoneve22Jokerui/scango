const jwt = require('jsonwebtoken');
const authConfig = require('../../../config/auth');
const { User } = require('../../../database/models');
const logger = require('../../../config/logger');

/**
 * Middleware para proteção de rotas privadas via JWT
 */
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Verifica se o header de autorização está presente
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Token de acesso não fornecido.'
    });
  }

  // 2. Verifica se o formato é "Bearer <token>"
  const [, token] = authHeader.split(' ');

  try {
    // 3. Decodifica e valida o token
    const decoded = jwt.verify(token, authConfig.jwt.secret);

    // 4. Verifica se o utilizador ainda existe no banco de dados e está ativo
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'role', 'status']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilizador associado ao token não encontrado.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Esta conta está inativa ou suspensa.'
      });
    }

    // 5. Injeta os dados do utilizador e da role na requisição
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor, renove sua sessão.'
      });
    }

    logger.error(`Erro na validação do JWT: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Token inválido.'
    });
  }
};
