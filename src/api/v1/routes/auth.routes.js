const { Router } = require('express');
const AuthController = require('../controllers/AuthController');
const authValidation = require('../validations/auth.validation');
const validate = require('../middlewares/validation.middleware');
const { authLimiter, otpLimiter } = require('../middlewares/rateLimit.middleware');
const deviceMiddleware = require('../middlewares/device.middleware');

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Registro de novo utilizador
 * @access Public
 */
router.post(
  '/register',
  authLimiter,
  authValidation.register,
  validate,
  AuthController.register
);

/**
 * @route POST /api/v1/auth/login
 * @desc Autenticação e geração de tokens
 * @access Public
 */
router.post(
  '/login',
  authLimiter,
  deviceMiddleware,
  authValidation.login,
  validate,
  AuthController.login
);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Renovação do Access Token via Refresh Token
 * @access Public
 */
router.post(
  '/refresh',
  authValidation.refreshToken,
  validate,
  AuthController.refresh
);

/**
 * @route POST /api/v1/auth/logout
 * @desc Invalidação de sessão e token
 * @access Public (Requires Refresh Token in body)
 */
router.post(
  '/logout',
  authValidation.refreshToken,
  validate,
  AuthController.logout
);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Solicitação de recuperação de senha
 * @access Public
 */
router.post(
  '/forgot-password',
  otpLimiter,
  authValidation.forgotPassword,
  validate,
  AuthController.forgotPassword
);

/**
 * @route POST /api/v1/auth/verify-otp
 * @desc Validação de código OTP (Email/Telefone/Password Reset)
 * @access Public
 */
router.post(
  '/verify-otp',
  authLimiter,
  authValidation.verifyOTP,
  validate,
  AuthController.verifyOTP
);

module.exports = router;
