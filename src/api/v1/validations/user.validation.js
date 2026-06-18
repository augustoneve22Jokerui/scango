const { body, param } = require('express-validator');

const userValidation = {
  // Validação para atualização de perfil básico
  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 }).withMessage('O nome deve ter entre 3 e 50 caracteres.'),

    body('bio')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('A bio não pode exceder 255 caracteres.'),

    body('phone')
      .optional()
      .trim()
      .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Informe um número de telefone válido.'),

    body('birth_date')
      .optional()
      .isISO8601().withMessage('Informe uma data de nascimento válida (AAAA-MM-DD).')
      .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        if (birthDate > today) {
          throw new Error('A data de nascimento não pode ser no futuro.');
        }
        return true;
      }),
  ],

  // Validação para alteração de senha (logado)
  changePassword: [
    body('oldPassword')
      .notEmpty().withMessage('A senha atual é obrigatória.'),

    body('newPassword')
      .notEmpty().withMessage('A nova senha é obrigatória.')
      .isLength({ min: 8 }).withMessage('A nova senha deve ter no mínimo 8 caracteres.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('A nova senha deve conter letra maiúscula, minúscula, número e caractere especial.')
      .custom((value, { req }) => {
        if (value === req.body.oldPassword) {
          throw new Error('A nova senha não pode ser igual à senha atual.');
        }
        return true;
      }),
  ],

  // Validação para busca de perfis de terceiros ou ID específico
  getById: [
    param('id')
      .isUUID().withMessage('ID de usuário inválido (formato UUID esperado).')
  ]
};

module.exports = userValidation;
