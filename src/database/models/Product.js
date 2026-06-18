const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Um produto pertence a uma categoria
      this.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });

      // Um produto pertence a um parceiro (dono do catálogo)
      this.belongsTo(models.Partner, { foreignKey: 'partner_id', as: 'partner' });

      // Um produto está vinculado a uma loja específica (ponto de venda)
      this.belongsTo(models.Store, { foreignKey: 'store_id', as: 'store' });

      // Um produto pode ter muitos logs de scan (para analytics)
      this.hasMany(models.ScanLog, { foreignKey: 'product_id', as: 'scans' });

      // Um produto pode estar em várias promoções
      this.hasMany(models.Promotion, { foreignKey: 'product_id', as: 'promotions' });
    }
  }

  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    partner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'partners', key: 'id' }
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'stores', key: 'id' }
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'categories', key: 'id' }
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Código EAN/GTIN para identificação via Scanner'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Opcional: quantidade disponível em loja'
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'out_of_stock'),
      defaultValue: 'active',
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Atributos extras (ex: peso, marca, validade)'
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['barcode'], unique: true },
      { fields: ['partner_id'] },
      { fields: ['store_id'] },
      { fields: ['category_id'] },
      { fields: ['status'] },
      // Índice para busca textual por nome
      { fields: ['name'] }
    ]
  });

  return Product;
};
