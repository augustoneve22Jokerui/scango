const { Router } = require('express');
const MapController = require('../controllers/MapController');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas do mapa exigem autenticação para garantir a segurança dos dados dos parceiros
router.use(authMiddleware);

/**
 * @route GET /api/v1/map/points
 * @desc Obtém todos os pontos de interesse (Lojas, Missões, Promoções) dentro de um raio
 * @access Private
 */
router.get(
  '/points',
  commonValidation.coordinates, // Exige lat e lng
  validate,
  MapController.getPoints
);

/**
 * @route GET /api/v1/map/points/:id
 * @desc Obtém um resumo rápido de um ponto específico ao ser clicado no mapa
 * @access Private
 */
router.get(
  '/points/:id',
  commonValidation.requiredId,
  validate,
  MapController.getPointDetails
);

/**
 * @route GET /api/v1/map/search
 * @desc Busca por endereços ou nomes de locais para reposicionar o mapa
 * @access Private
 */
router.get(
  '/search',
  MapController.searchLocation
);

/**
 * @route GET /api/v1/map/coverage
 * @desc Retorna os limites geográficos onde o ScanGo opera
 * @access Private
 */
router.get('/coverage', MapController.getCoverage);

module.exports = router;
