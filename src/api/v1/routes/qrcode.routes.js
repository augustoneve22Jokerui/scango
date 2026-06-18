const { Router } = require('express');
const QRCodeController = require('../controllers/QRCodeController');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas de QR Code exigem autenticação
router.use(authMiddleware);

/**
 * @route POST /api/v1/qrcodes/validate
 * @desc Validação de scan de QR Code realizado pelo utilizador
 * @access Private (User/Partner/Admin)
 */
router.post(
  '/validate',
  // Aqui poderíamos ter uma validação específica para o formato do código
  QRCodeController.validate
);

/**
 * ROTAS DE GESTÃO (Apenas Parceiros ou Admin)
 */
router.use(checkRole(['partner', 'admin']));

/**
 * @route GET /api/v1/qrcodes
 * @desc Lista QR Codes gerados pelo parceiro/sistema
 * @access Private (Partner/Admin)
 */
router.get('/', commonValidation.pagination, validate, QRCodeController.index);

/**
 * @route POST /api/v1/qrcodes
 * @desc Gera um novo QR Code (Campanha, Evento, etc)
 * @access Private (Partner/Admin)
 */
router.post('/', QRCodeController.generate);

/**
 * @route GET /api/v1/qrcodes/:id
 * @desc Detalhes e estatísticas de um QR Code específico
 * @access Private (Partner/Admin)
 */
router.get(
  '/:id',
  commonValidation.requiredId,
  validate,
  QRCodeController.show
);

/**
 * @route DELETE /api/v1/qrcodes/:id/revoke
 * @desc Revoga/Desativa um QR Code manualmente
 * @access Private (Partner/Admin)
 */
router.delete(
  '/:id/revoke',
  commonValidation.requiredId,
  validate,
  QRCodeController.revoke
);

module.exports = router;
