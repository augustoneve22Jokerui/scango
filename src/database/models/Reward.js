const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Reward extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma recompensa é oferecida por um parceiro
      this.belongsTo(models.Partner, { foreignKey: 'partner_id', as: 'partner' });

      // Uma recompensa pode ser exclusiva de uma loja específica
      this.belongsTo(models.Store, { foreignKey: 'store_id', as: 'store' });

      // Uma recompensa pode gerar muitos vouchers (redemções)
      this.hasMany(models.Voucher, { foreignKey: 'reward_id', as: 'vouchers' });
    }
  }

  Reward.init({
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
      allowNull: true,
      references: { model: 'stores', key: 'id' },
      comment: 'Se nulo, o prêmio pode ser resgatado em qualquer loja do parceiro'
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    points_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Custo em pontos para resgatar este prêmio'
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('food', 'service', 'product', 'discount', 'experience', 'digital'),
      defaultValue: 'product',
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Quantidade disponível. Se nulo, é ilimitado (ex: voucher digital)'
    },
    validity_days: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: 'Prazo em dias para usar o voucher após o resgate'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'out_of_stock', 'archived'),
      defaultValue: 'active',
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Termos e condições específicos ou dados técnicos'
    }
  }, {
    sequelize,
    modelName: 'Reward',
    tableName: 'rewards',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['partner_id'] },
      { fields: ['store_id'] },
      { fields: ['points_cost'] },
      { fields: ['status'] },
      { fields: ['category'] }
    ]
  });

  return Reward;
};
