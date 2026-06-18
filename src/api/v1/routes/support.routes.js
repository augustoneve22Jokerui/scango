const { Router } = require('express');
const SupportController = require('../controllers/SupportController');
const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validation.middleware');
const commonValidation = require('../validations/common.validation');

const router = Router();

// Todas as rotas de suporte exigem autenticação
router.use(authMiddleware);

/**
 * @route GET /api/v1/support
 * @desc Lista todos os tickets abertos pelo utilizador
 * @access Private
 */
router.get(
  '/',
  commonValidation.pagination,
  validate,
  SupportController.index
);

/**
 * @route POST /api/v1/support
 * @desc Abre um novo chamado/ticket de suporte
 * @access Private
 */
router.post(
  '/',
  // Validações de assunto e descrição seriam injetadas aqui
  SupportController.store
);

/**
 * @route GET /api/v1/support/:id
 * @desc Obtém detalhes do ticket e histórico de mensagens
 * @access Private
 */
router.get(
  '/:id',
  commonValidation.requiredId,
  validate,
  SupportController.show
);

/**
 * @route POST /api/v1/support/:id/messages
 * @desc Envia uma nova mensagem no chat do ticket (aceita anexos)
 * @access Private
 */
router.post(
  '/:id/messages',
  commonValidation.requiredId,
  uploadMiddleware.feedImages, // Reutilizando middleware de múltiplas imagens para prints
  validate,
  SupportController.sendMessage
);

/**
 * @route PATCH /api/v1/support/:id/close
 * @desc Encerra um ticket de suporte
 * @access Private
 */
router.patch(
  '/:id/close',
  commonValidation.requiredId,
  validate,
  SupportController.close
);

module.exports = router;
