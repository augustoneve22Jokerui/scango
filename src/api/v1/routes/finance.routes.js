const { Router } = require('express');
const FinanceController = require('../controllers/FinanceController');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas financeiras exigem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/v1/finance/plans
 * @desc Lista os planos de assinatura disponíveis (Basic, Premium, Enterprise)
 * @access Private (Auth Users/Partners)
 */
router.get('/plans', FinanceController.listPlans);

/**
 * ROTAS PARA PARCEIROS (Gestão da própria conta)
 */
router.get(
  '/subscription',
  checkRole(['partner', 'admin']),
  FinanceController.getMySubscription
);

/**
 * @route POST /api/v1/finance/subscribe
 * @desc Realiza a assinatura de um plano ou upgrade
 * @access Private (Partner Only)
 */
router.post(
  '/subscribe',
  checkRole(['partner']),
  // Aqui entrariam validações de ID de plano e método de pagamento
  FinanceController.subscribe
);

/**
 * @route GET /api/v1/finance/invoices
 * @desc Lista o histórico de faturas do parceiro
 * @access Private (Partner/Admin)
 */
router.get(
  '/invoices',
  checkRole(['partner', 'admin']),
  commonValidation.pagination,
  validate,
  FinanceController.getInvoices
);

/**
 * @route PATCH /api/v1/finance/cancel
 * @desc Cancela a renovação automática da assinatura atual
 * @access Private (Partner Only)
 */
router.patch(
  '/cancel',
  checkRole(['partner']),
  FinanceController.cancelSubscription
);

/**
 * ROTAS ADMINISTRATIVAS (Gestão Global)
 */

/**
 * @route GET /api/v1/finance/revenue
 * @desc Relatório de receita global da plataforma
 * @access Private (Admin Only)
 */
router.get(
  '/revenue',
  checkRole(['admin']),
  commonValidation.dateRange,
  validate,
  FinanceController.getGlobalRevenue
);

module.exports = router;
