const { Router } = require('express');
const CampaignController = require('../controllers/CampaignController');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas de campanhas exigem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/v1/campaigns
 * @desc Lista todas as campanhas ativas e disponíveis
 * @access Private (User/Partner/Admin)
 */
router.get('/', commonValidation.pagination, CampaignController.index);

/**
 * @route GET /api/v1/campaigns/:id
 * @desc Detalhes completos, regras e prémios de uma campanha
 * @access Private (User/Partner/Admin)
 */
router.get(
  '/:id',
  commonValidation.requiredId,
  validate,
  CampaignController.show
);

/**
 * @route POST /api/v1/campaigns/:id/participate
 * @desc Regista a participação do utilizador numa campanha específica
 * @access Private (User/Partner/Admin)
 */
router.post(
  '/:id/participate',
  commonValidation.requiredId,
  validate,
  CampaignController.participate
);

/**
 * ROTAS DE GESTÃO E MÉTRICAS (Apenas Parceiros Master ou Admin)
 */
router.use(checkRole(['partner', 'admin']));

/**
 * @route POST /api/v1/campaigns
 * @desc Cria uma nova campanha patrocinada ou promocional
 * @access Private (Partner/Admin)
 */
router.post('/', CampaignController.store);

/**
 * @route GET /api/v1/campaigns/:id/stats
 * @desc Obtém métricas de alcance e conversão da campanha
 * @access Private (Partner/Admin)
 */
router.get(
  '/:id/stats',
  commonValidation.requiredId,
  validate,
  CampaignController.getStats
);

module.exports = router;
