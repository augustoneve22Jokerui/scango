const { Router } = require('express');
const AchievementController = require('../controllers/AchievementController');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas de conquistas exigem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/v1/achievements
 * @desc Lista todas as conquistas existentes no ecossistema
 * @access Private
 */
router.get('/', AchievementController.index);

/**
 * @route GET /api/v1/achievements/my
 * @desc Lista as medalhas e badges desbloqueados pelo utilizador logado
 * @access Private
 */
router.get('/my', AchievementController.myAchievements);

/**
 * @route GET /api/v1/achievements/:id
 * @desc Detalhes de uma conquista específica e requisitos
 * @access Private
 */
router.get(
  '/:id',
  commonValidation.requiredId,
  validate,
  AchievementController.show
);

/**
 * @route POST /api/v1/achievements/check
 * @desc Força a verificação de novas conquistas desbloqueadas
 * @access Private
 */
router.post('/check', AchievementController.checkNew);

module.exports = router;
