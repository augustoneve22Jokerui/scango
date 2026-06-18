const { Router } = require('express');
const PromotionController = require('../controllers/PromotionController');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas de promoções exigem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/v1/promotions
 * @desc Lista todas as promoções ativas com filtros
 * @access Private (User/Partner/Admin)
 */
router.get('/', commonValidation.pagination, PromotionController.index);

/**
 * @route GET /api/v1/promotions/:id
 * @desc Detalhes de uma promoção específica (produto, desconto, validade)
 * @access Private (User/Partner/Admin)
 */
router.get(
  '/:id',
  commonValidation.requiredId,
  validate,
  PromotionController.show
);

/**
 * ROTAS DE GESTÃO (Apenas Parceiros ou Admin)
 */
router.use(checkRole(['partner', 'admin']));

/**
 * @route POST /api/v1/promotions
 * @desc Cria uma nova promoção de produto ou categoria
 * @access Private (Partner/Admin)
 */
router.post('/', PromotionController.store);

/**
 * @route PUT /api/v1/promotions/:id
 * @desc Atualiza dados de uma promoção existente
 * @access Private (Partner/Admin)
 */
router.put(
  '/:id',
  commonValidation.requiredId,
  validate,
  PromotionController.update
);

/**
 * @route DELETE /api/v1/promotions/:id
 * @desc Encerra ou inativa uma promoção antecipadamente
 * @access Private (Partner/Admin)
 */
router.delete(
  '/:id',
  commonValidation.requiredId,
  validate,
  PromotionController.delete
);

module.exports = router;
