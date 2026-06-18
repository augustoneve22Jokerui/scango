const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Store extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma loja pertence a um parceiro (empresa detentora)
      this.belongsTo(models.Partner, { foreignKey: 'partner_id', as: 'partner' });

      // Uma loja pertence a uma categoria (ex: Supermercado)
      this.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });

      // Uma loja possui muitos produtos vinculados localmente
      this.hasMany(models.Product, { foreignKey: 'store_id', as: 'products' });

      // Uma loja pode ter missões exclusivas
      this.hasMany(models.Mission, { foreignKey: 'store_id', as: 'missions' });

      // Uma loja pode ter promoções específicas
      this.hasMany(models.Promotion, { foreignKey: 'store_id', as: 'promotions' });

      // Histórico de scans realizados nesta unidade
      this.hasMany(models.ScanLog, { foreignKey: 'store_id', as: 'scans' });
    }
  }

  Store.init({
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
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'categories', key: 'id' }
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    // Precisão geográfica (Decimal Degrees)
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    operating_hours: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Estrutura: { "seg": "08:00-18:00", "dom": "closed" }'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
      defaultValue: 'active',
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Comodidades: { "wifi": true, "parking": true }'
    }
  }, {
    sequelize,
    modelName: 'Store',
    tableName: 'stores',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['partner_id'] },
      { fields: ['category_id'] },
      { fields: ['status'] },
      // Índice para otimizar buscas por coordenadas no StoreService
      { fields: ['latitude', 'longitude'] }
    ]
  });

  return Store;
};
