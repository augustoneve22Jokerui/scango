const AuthService = require('../../../core/services/AuthService');
const logger = require('../../../config/logger');

class AuthController {
  /**
   * Registra um novo usuário na plataforma
   */
  async register(req, res, next) {
    try {
      const userData = req.body;
      const result = await AuthService.register(userData);

      logger.info(`Novo usuário registrado: ${result.user.email}`);

      return res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso. Verifique seu e-mail.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Autentica um usuário e retorna os tokens
   */
  async login(req, res, next) {
    try {
      const { email, password, device_id } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const result = await AuthService.login({
        email,
        password,
        device_id,
        ipAddress,
        userAgent
      });

      logger.info(`Login realizado: ${email}`);

      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Renova o Access Token usando um Refresh Token
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Finaliza a sessão do usuário
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Solicita recuperação de senha
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);

      return res.status(200).json({
        success: true,
        message: 'Se o e-mail existir em nossa base, um código de recuperação será enviado.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica o código OTP enviado ao usuário
   */
  async verifyOTP(req, res, next) {
    try {
      const { email, code, type } = req.body;
      const result = await AuthService.verifyOTP(email, code, type);

      return res.status(200).json({
        success: true,
        message: 'Código verificado com sucesso.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
