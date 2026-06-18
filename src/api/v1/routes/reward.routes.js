const { Router } = require('express');
const RewardController = require('../controllers/RewardController');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas de recompensas exigem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/v1/rewards
 * @desc Lista o catálogo de recompensas disponíveis para resgate
 * @access Private (User/Partner/Admin)
 */
router.get('/', commonValidation.pagination, RewardController.index);

/**
 * @route GET /api/v1/rewards/my-rewards
 * @desc Lista os vouchers e prêmios que o utilizador já resgatou
 * @access Private (User/Partner/Admin)
 */
router.get('/my-rewards', RewardController.myRewards);

/**
 * @route GET /api/v1/rewards/:id
 * @desc Detalhes de uma recompensa específica
 * @access Private (User/Partner/Admin)
 */
router.get(
  '/:id',
  commonValidation.requiredId,
  validate,
  RewardController.show
);

/**
 * @route POST /api/v1/rewards/:id/redeem
 * @desc Realiza a troca de pontos por uma recompensa (Gera Voucher)
 * @access Private (User/Partner/Admin)
 */
router.post(
  '/:id/redeem',
  commonValidation.requiredId,
  validate,
  RewardController.redeem
);

/**
 * ROTAS PARA LOJISTAS/PARCEIROS
 */

/**
 * @route POST /api/v1/rewards/validate-voucher
 * @desc Valida e consome um voucher apresentado pelo cliente na loja
 * @access Private (Partner/Admin)
 */
router.post(
  '/validate-voucher',
  checkRole(['partner', 'admin']),
  RewardController.validateVoucher
);

module.exports = router;
