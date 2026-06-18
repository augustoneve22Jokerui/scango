const { Router } = require('express');
const RankingController = require('../controllers/RankingController');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas de ranking exigem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/v1/rankings/global
 * @desc Obtém o ranking nacional (Geral)
 * @access Private
 */
router.get(
  '/global',
  commonValidation.pagination,
  validate,
  RankingController.getGlobal
);

/**
 * @route GET /api/v1/rankings/location
 * @desc Obtém o ranking filtrado por Província ou Município
 * @access Private
 */
router.get(
  '/location',
  commonValidation.pagination,
  validate,
  RankingController.getByLocation
);

/**
 * @route GET /api/v1/rankings/me
 * @desc Obtém a posição atual do utilizador logado nos rankings
 * @access Private
 */
router.get('/me', RankingController.getMyPosition);

/**
 * @route GET /api/v1/rankings/partners
 * @desc Ranking de performance das lojas/parceiros
 * @access Private
 */
router.get(
  '/partners',
  commonValidation.pagination,
  validate,
  RankingController.getPartnerRanking
);

module.exports = router;
