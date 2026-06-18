const { Router } = require('express');
const NotificationController = require('../controllers/NotificationController');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas de notificações exigem autenticação do utilizador
router.use(authMiddleware);

/**
 * @route GET /api/v1/notifications
 * @desc Lista o histórico de notificações (Push, Email, Sistema)
 * @access Private
 */
router.get(
  '/',
  commonValidation.pagination,
  validate,
  NotificationController.index
);

/**
 * @route PATCH /api/v1/notifications/:id/read
 * @desc Marca uma notificação específica como lida
 * @access Private
 */
router.patch(
  '/:id/read',
  commonValidation.requiredId,
  validate,
  NotificationController.markAsRead
);

/**
 * @route POST /api/v1/notifications/read-all
 * @desc Marca todas as notificações do utilizador como lidas
 * @access Private
 */
router.post('/read-all', NotificationController.markAllAsRead);

/**
 * @route DELETE /api/v1/notifications/:id
 * @desc Remove permanentemente uma notificação do histórico
 * @access Private
 */
router.delete(
  '/:id',
  commonValidation.requiredId,
  validate,
  NotificationController.delete
);

/**
 * @route GET /api/v1/notifications/preferences
 * @desc Obtém as configurações de alertas do utilizador
 * @access Private
 */
router.get('/preferences', NotificationController.getPreferences);

/**
 * @route PUT /api/v1/notifications/preferences
 * @desc Atualiza as preferências (Ex: Ativar/Desativar SMS ou Push de Promoções)
 * @access Private
 */
router.put('/preferences', NotificationController.updatePreferences);

module.exports = router;
