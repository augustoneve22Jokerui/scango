const { body } = require('express-validator');

const authValidation = {
  // Regras para o Registro de novos usuários
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('O nome é obrigatório.')
      .isLength({ min: 3, max: 50 }).withMessage('O nome deve ter entre 3 e 50 caracteres.'),

    body('email')
      .trim()
      .notEmpty().withMessage('O e-mail é obrigatório.')
      .isEmail().withMessage('Informe um e-mail válido.')
      .normalizeEmail(),

    body('password')
      .notEmpty().withMessage('A senha é obrigatória.')
      .isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.'),

    body('phone')
      .optional()
      .trim()
      .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Informe um número de telefone válido no formato internacional.'),
  ],

  // Regras para o Login
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('E-mail é obrigatório.')
      .isEmail().withMessage('Informe um e-mail válido.'),

    body('password')
      .notEmpty().withMessage('A senha é obrigatória.'),

    body('device_id')
      .optional()
      .trim()
      .isUUID().withMessage('Device ID inválido.'),
  ],

  // Regras para Recuperação de Senha (Solicitação)
  forgotPassword: [
    body('email')
      .trim()
      .notEmpty().withMessage('E-mail é obrigatório.')
      .isEmail().withMessage('Informe um e-mail válido.'),
  ],

  // Regras para Redefinição de Senha (Reset)
  resetPassword: [
    body('token')
      .notEmpty().withMessage('Token de reset é obrigatório.'),
    body('newPassword')
      .notEmpty().withMessage('A nova senha é obrigatória.')
      .isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.'),
  ],

  // Regras para Verificação de OTP (One-Time Password)
  verifyOTP: [
    body('email')
      .trim()
      .isEmail().withMessage('E-mail inválido.'),
    body('code')
      .notEmpty().withMessage('O código OTP é obrigatório.')
      .isLength({ min: 6, max: 6 }).withMessage('O código OTP deve ter 6 dígitos.')
      .isNumeric().withMessage('O código OTP deve ser apenas números.'),
  ],

  // Regras para Refresh Token
  refreshToken: [
    body('refreshToken')
      .notEmpty().withMessage('Refresh token é obrigatório.'),
  ]
};

module.exports = authValidation;
