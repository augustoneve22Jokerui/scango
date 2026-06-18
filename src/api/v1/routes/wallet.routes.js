const { Router } = require('express');
const WalletController = require('../controllers/WalletController');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas da carteira exigem autenticação obrigatória
router.use(authMiddleware);

/**
 * @route GET /api/v1/wallet/balance
 * @desc Obtém o saldo atual (Créditos e Pontos)
 * @access Private
 */
router.get('/balance', WalletController.getBalance);

/**
 * @route GET /api/v1/wallet/history
 * @desc Obtém o extrato de transações com filtros e paginação
 * @access Private
 */
router.get(
  '/history',
  commonValidation.pagination,
  commonValidation.dateRange,
  validate,
  WalletController.getHistory
);

/**
 * @route POST /api/v1/wallet/deposit
 * @desc Adiciona créditos à carteira (Simulação ou Gateway)
 * @access Private
 */
router.post(
  '/deposit',
  // Aqui entrariam validações específicas de montante e método de pagamento
  WalletController.deposit
);

/**
 * @route POST /api/v1/wallet/transfer
 * @desc Transfere pontos para outro utilizador
 * @access Private
 */
router.post(
  '/transfer',
  // Validação de email do destinatário e quantidade de pontos
  WalletController.transferPoints
);

module.exports = router;
