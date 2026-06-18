const ProductService = require('../../../core/services/ProductService');
const logger = require('../../../config/logger');

class ProductController {
  /**
   * Lista produtos com paginação e filtros (nome, categoria, loja)
   */
  async index(req, res, next) {
    try {
      const filters = req.query;
      const products = await ProductService.listProducts(filters);

      return res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * O CORE do ScanGo: Busca um produto pelo código de barras (EAN/GTIN)
   */
  async getByBarcode(req, res, next) {
    try {
      const { barcode } = req.params;
      const userId = req.user.id; // Para registrar quem escaneou

      const product = await ProductService.findByBarcode(barcode, userId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado em nossa base de dados.'
        });
      }

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém detalhes de um produto específico por ID
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cadastra um novo produto (Ação de Parceiro/Lojista)
   */
  async store(req, res, next) {
    try {
      const productData = req.body;
      const partnerId = req.partner.id; // Garante que o produto pertence ao parceiro logado

      const newProduct = await ProductService.createProduct(partnerId, productData);

      logger.info(`Novo produto cadastrado: ${newProduct.name} (Barcode: ${newProduct.barcode})`);

      return res.status(201).json({
        success: true,
        message: 'Produto cadastrado com sucesso.',
        data: newProduct
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza dados de um produto (Preço, Descrição, Estoque)
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const partnerId = req.partner.id;

      const updatedProduct = await ProductService.updateProduct(id, partnerId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Produto atualizado com sucesso.',
        data: updatedProduct
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta ou inativa um produto
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const partnerId = req.partner.id;

      await ProductService.deleteProduct(id, partnerId);

      return res.status(200).json({
        success: true,
        message: 'Produto removido com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
