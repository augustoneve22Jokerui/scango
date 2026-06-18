const { Router } = require('express');
const AuditController = require('../controllers/AuditController');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

/**
 * SEGURANÇA MÁXIMA
 * Apenas utilizadores com a role 'admin' (ou uma role específica 'auditor')
 * podem aceder a estas rotas.
 */
router.use(authMiddleware);
router.use(checkRole(['admin']));

/**
 * @route GET /api/v1/audit
 * @desc Lista logs de auditoria com filtros avançados (autor, ação, entidade, data)
 * @access Private (Admin Only)
 */
router.get(
  '/',
  commonValidation.pagination,
  commonValidation.dateRange,
  validate,
  AuditController.index
);

/**
 * @route GET /api/v1/audit/security-stats
 * @desc Obtém um resumo de eventos de segurança (tentativas de login falhadas, etc)
 * @access Private (Admin Only)
 */
router.get('/security-stats', AuditController.getSecurityStats);

/**
 * @route GET /api/v1/audit/:id
 * @desc Obtém os detalhes técnicos de um evento de auditoria específico
 * @access Private (Admin Only)
 */
router.get(
  '/:id',
  commonValidation.requiredId,
  validate,
  AuditController.show
);

/**
 * @route POST /api/v1/audit/export
 * @desc Solicita a exportação da trilha de auditoria para fins de compliance
 * @access Private (Admin Only)
 */
router.post(
  '/export',
  commonValidation.dateRange,
  validate,
  AuditController.exportAudit
);

module.exports = router;
