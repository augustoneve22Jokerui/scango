const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Profile, Wallet, Device, Session, RefreshToken } = require('../../database/models');
const authConfig = require('../../config/auth');
const EmailProvider = require('../providers/EmailProvider');
const AppError = require('../../shared/errors/AppError');

class AuthService {
  /**
   * Registra um novo utilizador e cria as entidades básicas (Perfil e Carteira)
   */
  async register(userData) {
    const { name, email, password, phone } = userData;

    // 1. Verificar se o e-mail já existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      throw new AppError('Este e-mail já está em uso.', 400);
    }

    // 2. Criar utilizador com transação (Garantir que cria Perfil e Carteira ou nada)
    const transaction = await User.sequelize.transaction();

    try {
      const hashedPassword = await bcrypt.hash(password, authConfig.bcrypt.saltRounds);

      const user = await User.create({
        email,
        password: hashedPassword,
        phone,
        role: 'user',
        status: 'active'
      }, { transaction });

      await Profile.create({
        user_id: user.id,
        name
      }, { transaction });

      await Wallet.create({
        user_id: user.id,
        balance_credits: 0,
        balance_points: 0
      }, { transaction });

      await transaction.commit();

      // Enviar e-mail de boas-vindas em background
      EmailProvider.sendWelcomeEmail(email, name);

      return { user: { id: user.id, email: user.email, name } };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Autentica utilizador e gera o par de tokens (Access + Refresh)
   */
  async login({ email, password, device_id, ipAddress, userAgent }) {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Profile, as: 'profile' }]
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Credenciais inválidas.', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('Esta conta está inativa.', 403);
    }

    // Gerar Tokens
    const accessToken = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Registrar dispositivo e sessão
    await this.registerDeviceAndSession(user.id, { device_id, ipAddress, userAgent, refreshToken });

    return {
      user: {
        id: user.id,
        name: user.profile.name,
        email: user.email,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  /**
   * Gera JWT Access Token
   */
  generateToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn }
    );
  }

  /**
   * Gera JWT Refresh Token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      authConfig.refreshToken.secret,
      { expiresIn: authConfig.refreshToken.expiresIn }
    );
  }

  /**
   * Persiste o Refresh Token e dados do dispositivo no DB
   */
  async registerDeviceAndSession(userId, data) {
    const { device_id, ipAddress, userAgent, refreshToken } = data;

    // Upsert do Dispositivo
    if (device_id) {
      await Device.upsert({
        user_id: userId,
        device_identifier: device_id,
        last_ip: ipAddress,
        user_agent: userAgent
      });
    }

    // Salvar Refresh Token para controle de logout/revogação
    await RefreshToken.create({
      user_id: userId,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
    });
  }

  /**
   * Valida e gera novo Access Token a partir de um Refresh Token
   */
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, authConfig.refreshToken.secret);

      const storedToken = await RefreshToken.findOne({ where: { token, user_id: decoded.id } });
      if (!storedToken) throw new Error();

      const user = await User.findByPk(decoded.id);
      const newAccessToken = this.generateToken(user);

      return { accessToken: newAccessToken };
    } catch (err) {
      throw new AppError('Refresh token inválido ou expirado.', 401);
    }
  }

  /**
   * Invalida o Refresh Token (Logout)
   */
  async logout(token) {
    await RefreshToken.destroy({ where: { token } });
  }
}

module.exports = new AuthService();
