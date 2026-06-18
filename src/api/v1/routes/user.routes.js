const { Router } = require('express');
const UserController = require('../controllers/UserController');
const userValidation = require('../validations/user.validation');
const validate = require('../middlewares/validation.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');

const router = Router();

// Todas as rotas de usuários exigem autenticação prévia
router.use(authMiddleware);

/**
 * @route GET /api/v1/users/me
 * @desc Obtém o perfil do utilizador autenticado
 * @access Private
 */
router.get('/me', UserController.getProfile);

/**
 * @route PUT /api/v1/users/me
 * @desc Atualiza dados do perfil (Nome, Bio, Telefone)
 * @access Private
 */
router.put(
  '/me',
  userValidation.updateProfile,
  validate,
  UserController.updateProfile
);

/**
 * @route PATCH /api/v1/users/me/avatar
 * @desc Atualiza a foto de perfil
 * @access Private
 */
router.patch(
  '/me/avatar',
  uploadMiddleware.singleAvatar,
  UserController.updateAvatar
);

/**
 * @route GET /api/v1/users/me/stats
 * @desc Obtém estatísticas de XP e Nível
 * @access Private
 */
router.get('/me/stats', UserController.getStats);

/**
 * @route GET /api/v1/users/me/history
 * @desc Obtém o histórico de atividades do utilizador
 * @access Private
 */
router.get('/me/history', UserController.getHistory);

module.exports = router;
