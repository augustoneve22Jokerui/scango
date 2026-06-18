const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Promotion extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma promoção pertence a um parceiro
      this.belongsTo(models.Partner, { foreignKey: 'partner_id', as: 'partner' });

      // Uma promoção pode ser específica de uma loja
      this.belongsTo(models.Store, { foreignKey: 'store_id', as: 'store' });

      // Uma promoção geralmente está vinculada a um produto específico
      this.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    }
  }

  Promotion.init({
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
      allowNull: true, // Pode ser uma promoção válida para todas as lojas do parceiro
      references: { model: 'stores', key: 'id' }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true, // Pode ser uma promoção de "compre e ganhe" genérica ou cupom de loja
      references: { model: 'products', key: 'id' }
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed_amount', 'bogo'), // BOGO = Buy One Get One
      allowNull: false,
      defaultValue: 'percentage'
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'expired', 'scheduled'),
      defaultValue: 'active',
      allowNull: false
    },
    banner_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Regras extras (ex: valor mínimo de compra, limite por utilizador)'
    }
  }, {
    sequelize,
    modelName: 'Promotion',
    tableName: 'promotions',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['partner_id'] },
      { fields: ['product_id'] },
      { fields: ['status'] },
      { fields: ['start_date', 'end_date'] }
    ]
  });

  return Promotion;
};
