const { body, param, query } = require('express-validator');

const storeValidation = {
  // Validação para criação/atualização de Loja
  save: [
    body('name')
      .trim()
      .notEmpty().withMessage('O nome da loja é obrigatório.')
      .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres.'),

    body('category_id')
      .notEmpty().withMessage('A categoria é obrigatória.')
      .isUUID().withMessage('ID de categoria inválido.'),

    body('address')
      .trim()
      .notEmpty().withMessage('O endereço é obrigatório.'),

    // Validação de Geolocalização (Decimal Degrees)
    body('latitude')
      .notEmpty().withMessage('A latitude é obrigatória.')
      .isFloat({ min: -90, max: 90 }).withMessage('Latitude deve estar entre -90 e 90.'),

    body('longitude')
      .notEmpty().withMessage('A longitude é obrigatória.')
      .isFloat({ min: -180, max: 180 }).withMessage('Longitude deve estar entre -180 e 180.'),

    body('phone')
      .optional()
      .trim()
      .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Telefone da loja inválido.'),

    body('operating_hours')
      .optional()
      .isObject().withMessage('Os horários de funcionamento devem ser um objeto válido.'),
  ],

  // Validação para busca por proximidade (Mapa)
  nearby: [
    query('lat')
      .notEmpty().withMessage('Latitude de origem é necessária.')
      .isFloat({ min: -90, max: 90 }).withMessage('Latitude inválida.'),

    query('lng')
      .notEmpty().withMessage('Longitude de origem é necessária.')
      .isFloat({ min: -180, max: 180 }).withMessage('Longitude inválida.'),

    query('radius')
      .optional()
      .isFloat({ min: 0.1, max: 50 }).withMessage('O raio de busca deve ser entre 0.1km e 50km.'),
  ],

  // Validação de ID na URL
  getById: [
    param('id')
      .isUUID().withMessage('ID da loja inválido.')
  ]
};

module.exports = storeValidation;
