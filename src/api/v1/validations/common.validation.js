const { query, param } = require('express-validator');

const commonValidation = {
  // Validação padrão para paginação em listagens
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('A página deve ser um número inteiro maior que 0.')
      .toInt(),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('O limite deve estar entre 1 e 100 por página.')
      .toInt(),
  ],

  // Validação genérica para qualquer endpoint que receba um UUID na URL (:id)
  requiredId: [
    param('id')
      .notEmpty().withMessage('O ID é obrigatório na URL.')
      .isUUID().withMessage('O ID fornecido não é um UUID válido.')
  ],

  // Validação para filtros de data (Relatórios, Transações, Logs)
  dateRange: [
    query('startDate')
      .optional()
      .isISO8601().withMessage('A data inicial deve estar no formato ISO8601 (AAAA-MM-DD).'),

    query('endDate')
      .optional()
      .isISO8601().withMessage('A data final deve estar no formato ISO8601 (AAAA-MM-DD).')
      .custom((value, { req }) => {
        if (value && req.query.startDate && new Date(value) < new Date(req.query.startDate)) {
          throw new Error('A data final não pode ser anterior à data inicial.');
        }
        return true;
      }),
  ],

  // Validação para coordenadas geográficas genéricas
  coordinates: [
    query('lat')
      .notEmpty().withMessage('Latitude é obrigatória.')
      .isFloat({ min: -90, max: 90 }).withMessage('Latitude inválida.'),
    query('lng')
      .notEmpty().withMessage('Longitude é obrigatória.')
      .isFloat({ min: -180, max: 180 }).withMessage('Longitude inválida.'),
  ]
};

module.exports = commonValidation;
