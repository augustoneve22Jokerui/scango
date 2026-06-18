const { Product, Category, Partner, Store, ScanLog, Sequelize } = require('../../database/models');
const UserService = require('./UserService');
const AppError = require('../../shared/errors/AppError');
const logger = require('../../config/logger');

class ProductService {
  /**
   * Lista produtos com filtros avançados e paginação
   */
  async listProducts(filters) {
    const {
      page = 1,
      limit = 10,
      category_id,
      partner_id,
      store_id,
      search,
      status = 'active'
    } = filters;

    const offset = (page - 1) * limit;
    const where = { status };

    if (category_id) where.category_id = category_id;
    if (partner_id) where.partner_id = partner_id;
    if (store_id) where.store_id = store_id;

    if (search) {
      where.name = { [Sequelize.Op.iLike]: `%${search}%` };
    }

    return await Product.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: Category, as: 'category', attributes: ['name'] },
        { model: Partner, as: 'partner', attributes: ['company_name'] }
      ],
      order: [['name', 'ASC']]
    });
  }

  /**
   * CORE: Busca produto por código de barras e processa o evento de Scan
   */
  async findByBarcode(barcode, userId) {
    // 1. Localiza o produto na base de dados
    const product = await Product.findOne({
      where: { barcode, status: 'active' },
      include: [
        { model: Category, as: 'category' },
        { model: Partner, as: 'partner' }
      ]
    });

    if (!product) {
      return null;
    }

    // 2. Regista o log de scan para Analytics (Background)
    ScanLog.create({
      user_id: userId,
      product_id: product.id,
      store_id: product.store_id,
      scanned_at: new Date()
    }).catch(err => logger.error(`Erro ao gravar ScanLog: ${err.message}`));

    // 3. Recompensa o utilizador com XP via UserService
    // Definimos uma constante de XP por Scan (ex: 10 XP)
    await UserService.addExperience(userId, 10, 'PRODUCT_SCAN')
      .catch(err => logger.error(`Erro ao atribuir XP por scan: ${err.message}`));

    return product;
  }

  /**
   * Obtém detalhes de um produto por ID
   */
  async getProductById(productId) {
    const product = await Product.findByPk(productId, {
      include: ['category', 'partner', 'store']
    });

    if (!product) {
      throw new AppError('Produto não encontrado.', 404);
    }

    return product;
  }

  /**
   * Criação de novo produto no catálogo
   */
  async createProduct(partnerId, productData) {
    // Verifica se o código de barras já existe
    const existing = await Product.findOne({ where: { barcode: productData.barcode } });
    if (existing) {
      throw new AppError('Já existe um produto registado com este código de barras.', 400);
    }

    return await Product.create({
      ...productData,
      partner_id: partnerId,
      status: 'active'
    });
  }

  /**
   * Atualização de produto (Garante que o parceiro é o dono)
   */
  async updateProduct(productId, partnerId, updateData) {
    const product = await Product.findOne({ where: { id: productId, partner_id: partnerId } });

    if (!product) {
      throw new AppError('Produto não encontrado ou permissão negada.', 404);
    }

    // Impede alteração manual do barcode se houver regras rígidas de integridade
    delete updateData.barcode;

    return await product.update(updateData);
  }

  /**
   * Inativação de produto (Soft Delete)
   */
  async deleteProduct(productId, partnerId) {
    const product = await Product.findOne({ where: { id: productId, partner_id: partnerId } });

    if (!product) {
      throw new AppError('Produto não encontrado ou permissão negada.', 404);
    }

    return await product.update({ status: 'inactive' });
  }
}

module.exports = new ProductService();
