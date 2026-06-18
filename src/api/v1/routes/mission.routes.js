const { Router } = require('express');
const MissionController = require('../controllers/MissionController');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas de missões exigem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/v1/missions
 * @desc Lista todas as missões disponíveis para o utilizador
 * @access Private (User/Partner/Admin)
 */
router.get('/', MissionController.index);

/**
 * @route GET /api/v1/missions/history
 * @desc Histórico de missões completadas pelo utilizador
 * @access Private (User/Partner/Admin)
 */
router.get(
  '/history',
  commonValidation.pagination,
  validate,
  MissionController.history
);

/**
 * @route GET /api/v1/missions/:id
 * @desc Detalhes de uma missão e progresso atual
 * @access Private (User/Partner/Admin)
 */
router.get(
  '/:id',
  commonValidation.requiredId,
  validate,
  MissionController.show
);

/**
 * @route POST /api/v1/missions/:id/claim
 * @desc Resgate de recompensa após conclusão da missão
 * @access Private (User/Partner/Admin)
 */
router.post(
  '/:id/claim',
  commonValidation.requiredId,
  validate,
  MissionController.claim
);

/**
 * ROTAS DE GESTÃO (Apenas Parceiros ou Admin)
 */
router.use(checkRole(['partner', 'admin']));

/**
 * @route POST /api/v1/missions
 * @desc Cria uma nova missão no sistema
 * @access Private (Partner/Admin)
 */
router.post('/', MissionController.store);

module.exports = router;
