const { validationResult } = require('express-validator');

/**
 * Middleware para processar o resultado das validações
 * Deve ser chamado logo após a lista de validações nas rotas
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  // Se não houver erros de validação, segue para o próximo middleware/controller
  if (errors.isEmpty()) {
    return next();
  }

  // Se houver erros, extrai as mensagens e formata a resposta
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({
    field: err.path,
    message: err.msg
  }));

  // Retorna erro 422 (Unprocessable Entity) que é o padrão para falhas de validação semântica
  return res.status(422).json({
    success: false,
    message: 'Falha na validação dos dados enviados.',
    errors: extractedErrors
  });
};

module.exports = validate;
