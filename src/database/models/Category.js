const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Category extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma categoria pode estar vinculada a muitos produtos
      this.hasMany(models.Product, { foreignKey: 'category_id', as: 'products' });

      // Uma categoria pode estar vinculada a muitas lojas
      this.hasMany(models.Store, { foreignKey: 'category_id', as: 'stores' });
    }
  }

  Category.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Nome amigável para URLs e filtros de API'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Ícone representativo para exibição no App'
    },
    type: {
      type: DataTypes.ENUM('product', 'store', 'both'),
      defaultValue: 'product',
      allowNull: false,
      comment: 'Define se a categoria é para produtos, lojas ou ambos'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['type'] },
      { fields: ['status'] }
    ]
  });

  return Category;
};
