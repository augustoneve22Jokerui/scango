const { Router } = require('express');
const StoreController = require('../controllers/StoreController');
const storeValidation = require('../validations/store.validation');
const validate = require('../middlewares/validation.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');

const router = Router();

/**
 * ROTAS PÚBLICAS (Acesso para todos os utilizadores autenticados)
 */
router.use(authMiddleware);

/**
 * @route GET /api/v1/stores
 * @desc Lista todas as lojas com filtros
 * @access Private (User/Partner/Admin)
 */
router.get('/', StoreController.index);

/**
 * @route GET /api/v1/stores/nearby
 * @desc Busca lojas próximas via geolocalização (Mapa)
 * @access Private (User/Partner/Admin)
 */
router.get(
  '/nearby',
  storeValidation.nearby,
  validate,
  StoreController.getNearby
);

/**
 * @route GET /api/v1/stores/:id
 * @desc Detalhes completos de uma loja específica
 * @access Private (User/Partner/Admin)
 */
router.get(
  '/:id',
  storeValidation.getById,
  validate,
  StoreController.show
);

/**
 * ROTAS ADMINISTRATIVAS (Apenas Parceiros ou Admin)
 */
router.use(checkRole(['partner', 'admin']));

/**
 * @route POST /api/v1/stores
 * @desc Cria uma nova unidade física
 * @access Private (Partner/Admin)
 */
router.post(
  '/',
  storeValidation.save,
  validate,
  StoreController.store
);

/**
 * @route PUT /api/v1/stores/:id
 * @desc Atualiza dados da loja (horários, geolocalização)
 * @access Private (Partner/Admin)
 */
router.put(
  '/:id',
  storeValidation.getById,
  storeValidation.save,
  validate,
  StoreController.update
);

/**
 * @route DELETE /api/v1/stores/:id
 * @desc Remove ou desativa uma loja
 * @access Private (Partner/Admin)
 */
router.delete(
  '/:id',
  storeValidation.getById,
  validate,
  StoreController.delete
);

module.exports = router;
