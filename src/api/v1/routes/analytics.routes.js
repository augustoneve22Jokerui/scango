const { Router } = require('express');
const AnalyticsController = require('../controllers/AnalyticsController');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

/**
 * Todas as rotas de Analytics exigem autenticação e privilégios elevados
 */
router.use(authMiddleware);
router.use(checkRole(['partner', 'admin']));

/**
 * @route GET /api/v1/analytics/global
 * @desc Obtém KPIs globais da plataforma (Crescimento, Atividade)
 * @access Private (Admin Only)
 */
router.get(
  '/global',
  checkRole(['admin']),
  commonValidation.dateRange,
  validate,
  AnalyticsController.getGlobalKPIs
);

/**
 * @route GET /api/v1/analytics/partners/:id
 * @desc Insights detalhados de um parceiro específico
 * @access Private (Admin ou o próprio Parceiro)
 */
router.get(
  '/partners/:id',
  commonValidation.requiredId,
  commonValidation.dateRange,
  validate,
  AnalyticsController.getPartnerInsights
);

/**
 * @route GET /api/v1/analytics/stores/:storeId
 * @desc Métricas de performance de uma loja específica
 * @access Private (Admin ou o próprio Parceiro)
 */
router.get(
  '/stores/:storeId',
  // Validação customizada para o storeId (UUID)
  AnalyticsController.getStorePerformance
);

/**
 * @route POST /api/v1/analytics/export
 * @desc Solicita a exportação de um relatório em PDF ou CSV
 * @access Private (Partner/Admin)
 */
router.post(
  '/export',
  // Validação do tipo de relatório e formato
  AnalyticsController.exportReport
);

module.exports = router;
