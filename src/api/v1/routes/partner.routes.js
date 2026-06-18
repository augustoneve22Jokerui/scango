const { Router } = require('express');
const PartnerController = require('../controllers/PartnerController');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validation.middleware');

const router = Router();

/**
 * @route POST /api/v1/partners/register
 * @desc Solicitação pública de nova parceria (Onboarding)
 * @access Public
 */
router.post('/register', PartnerController.register);

/**
 * Rotas Protegidas - Apenas para Parceiros Autenticados ou Admins
 */
router.use(authMiddleware);
router.use(checkRole(['partner', 'admin']));

/**
 * @route GET /api/v1/partners/me
 * @desc Obtém o perfil corporativo do parceiro
 * @access Private (Partner/Admin)
 */
router.get('/me', PartnerController.getProfile);

/**
 * @route PUT /api/v1/partners/me
 * @desc Atualiza dados da empresa
 * @access Private (Partner/Admin)
 */
router.put('/me', PartnerController.updateProfile);

/**
 * @route GET /api/v1/partners/dashboard
 * @desc Obtém métricas consolidadas de todas as lojas do parceiro
 * @access Private (Partner/Admin)
 */
router.get('/dashboard', PartnerController.getDashboard);

/**
 * @route POST /api/v1/partners/documents
 * @desc Upload de documentos legais para verificação de conta
 * @access Private (Partner/Admin)
 */
router.post(
  '/documents',
  uploadMiddleware.partnerDocuments,
  PartnerController.uploadDocuments
);

module.exports = router;
