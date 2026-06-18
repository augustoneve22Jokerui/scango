const { Router } = require('express');
const AdminController = require('../controllers/AdminController');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

/**
 * SEGURANÇA MÁXIMA
 * Todas as rotas deste arquivo exigem autenticação E a role de 'admin'
 */
router.use(authMiddleware);
router.use(checkRole(['admin']));

/**
 * @route GET /api/v1/admin/overview
 * @desc Obtém KPIs globais rápidos para o dashboard administrativo
 * @access Private (Admin Only)
 */
router.get('/overview', AdminController.getOverview);

/**
 * @route GET /api/v1/admin/users
 * @desc Lista todos os utilizadores do sistema com filtros avançados
 * @access Private (Admin Only)
 */
router.get(
  '/users',
  commonValidation.pagination,
  validate,
  AdminController.listUsers
);

/**
 * @route PATCH /api/v1/admin/users/:id/status
 * @desc Altera o status de um utilizador (Ativar, Suspender, Banir)
 * @access Private (Admin Only)
 */
router.patch(
  '/users/:id/status',
  commonValidation.requiredId,
  validate,
  AdminController.updateUserStatus
);

/**
 * @route POST /api/v1/admin/partners/:id/review
 * @desc Aprova ou Rejeita a solicitação de adesão de um novo parceiro
 * @access Private (Admin Only)
 */
router.post(
  '/partners/:id/review',
  commonValidation.requiredId,
  validate,
  AdminController.reviewPartnerRequest
);

/**
 * @route PUT /api/v1/admin/users/:id/roles
 * @desc Atualiza os privilégios/roles de um utilizador
 * @access Private (Admin Only)
 */
router.put(
  '/users/:id/roles',
  commonValidation.requiredId,
  validate,
  AdminController.updatePermissions
);

module.exports = router;
