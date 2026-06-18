const { Router } = require('express');
const FeedController = require('../controllers/FeedController');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas do feed exigem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/v1/feed
 * @desc Obtém a lista de publicações, notícias e eventos
 * @access Private (User/Partner/Admin)
 */
router.get(
  '/',
  commonValidation.pagination,
  commonValidation.coordinates, // Opcional: para feed geolocalizado
  validate,
  FeedController.index
);

/**
 * @route GET /api/v1/feed/:id
 * @desc Obtém os detalhes de uma publicação específica
 * @access Private (User/Partner/Admin)
 */
router.get(
  '/:id',
  commonValidation.requiredId,
  validate,
  FeedController.show
);

/**
 * ROTAS DE PUBLICAÇÃO (Apenas Parceiros Master ou Admin)
 */
router.use(checkRole(['partner', 'admin']));

/**
 * @route POST /api/v1/feed
 * @desc Cria uma nova publicação no feed
 * @access Private (Partner/Admin)
 */
router.post('/', FeedController.store);

/**
 * @route PUT /api/v1/feed/:id
 * @desc Atualiza uma publicação existente
 * @access Private (Partner/Admin)
 */
router.put(
  '/:id',
  commonValidation.requiredId,
  validate,
  FeedController.update
);

/**
 * @route DELETE /api/v1/feed/:id
 * @desc Remove ou inativa uma publicação do feed
 * @access Private (Partner/Admin)
 */
router.delete(
  '/:id',
  commonValidation.requiredId,
  validate,
  FeedController.delete
);

module.exports = router;
