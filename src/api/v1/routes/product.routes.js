const { Router } = require('express');
const ProductController = require('../controllers/ProductController');
const productValidation = require('../validations/product.validation');
const validate = require('../middlewares/validation.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');

const router = Router();

/**
 * ROTAS PARA UTILIZADORES (Consulta e Scan)
 * Exige autenticação básica
 */
router.use(authMiddleware);

/**
 * @route GET /api/v1/products
 * @desc Lista produtos com paginação e filtros
 * @access Private (User/Partner/Admin)
 */
router.get(
  '/',
  productValidation.search,
  validate,
  ProductController.index
);

/**
 * @route GET /api/v1/products/scan/:barcode
 * @desc FUNCIONALIDADE CORE: Busca produto por código de barras
 * @access Private (User/Partner/Admin)
 */
router.get(
  '/scan/:barcode',
  productValidation.scan,
  validate,
  ProductController.getByBarcode
);

/**
 * @route GET /api/v1/products/:id
 * @desc Obtém detalhes de um produto específico por ID
 * @access Private (User/Partner/Admin)
 */
router.get('/:id', ProductController.show);

/**
 * ROTAS DE GESTÃO (Apenas Parceiros ou Admin)
 */
router.use(checkRole(['partner', 'admin']));

/**
 * @route POST /api/v1/products
 * @desc Cadastra um novo produto no catálogo do parceiro
 * @access Private (Partner/Admin)
 */
router.post(
  '/',
  productValidation.save,
  validate,
  ProductController.store
);

/**
 * @route PUT /api/v1/products/:id
 * @desc Atualiza informações de um produto existente
 * @access Private (Partner/Admin)
 */
router.put(
  '/:id',
  productValidation.save,
  validate,
  ProductController.update
);

/**
 * @route DELETE /api/v1/products/:id
 * @desc Remove ou inativa um produto do sistema
 * @access Private (Partner/Admin)
 */
router.delete('/:id', ProductController.delete);

module.exports = router;
