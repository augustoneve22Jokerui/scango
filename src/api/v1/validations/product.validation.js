const { body, param, query } = require('express-validator');

const productValidation = {
  // Validação para criação ou atualização total do produto
  save: [
    body('name')
      .trim()
      .notEmpty().withMessage('O nome do produto é obrigatório.')
      .isLength({ min: 2, max: 150 }).withMessage('O nome deve ter entre 2 e 150 caracteres.'),

    body('barcode')
      .trim()
      .notEmpty().withMessage('O código de barras é obrigatório.')
      .isAlphanumeric().withMessage('O código de barras deve conter apenas letras e números.')
      .isLength({ min: 8, max: 14 }).withMessage('O código de barras deve ter entre 8 e 14 dígitos (padrão EAN/GTIN).'),

    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('A descrição não pode exceder 500 caracteres.'),

    body('price')
      .notEmpty().withMessage('O preço é obrigatório.')
      .isFloat({ min: 0 }).withMessage('O preço deve ser um valor positivo.'),

    body('category_id')
      .notEmpty().withMessage('A categoria do produto é obrigatória.')
      .isUUID().withMessage('ID de categoria inválido.'),

    body('store_id')
      .notEmpty().withMessage('A loja vinculada é obrigatória.')
      .isUUID().withMessage('ID de loja inválido.'),
  ],

  // Validação para o core do ScanGo: Busca por Código de Barras
  scan: [
    param('barcode')
      .trim()
      .notEmpty().withMessage('O código de barras é necessário para o scan.')
      .isAlphanumeric().withMessage('Código de barras malformado.')
      .isLength({ min: 8, max: 14 }).withMessage('Comprimento de código de barras inválido.')
  ],

  // Validação para filtros de listagem
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('O termo de busca deve ter pelo menos 2 caracteres.'),

    query('category')
      .optional()
      .isUUID().withMessage('Filtro de categoria inválido.')
  ]
};

module.exports = productValidation;
