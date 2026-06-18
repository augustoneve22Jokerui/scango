const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Partner extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Um parceiro pode ter múltiplas lojas (unidades físicas)
      this.hasMany(models.Store, { foreignKey: 'partner_id', as: 'stores' });

      // Um parceiro possui um catálogo de produtos
      this.hasMany(models.Product, { foreignKey: 'partner_id', as: 'products' });

      // Um parceiro pode criar campanhas de marketing
      this.hasMany(models.Campaign, { foreignKey: 'partner_id', as: 'campaigns' });

      // Um parceiro tem uma assinatura (financeiro)
      this.hasOne(models.Subscription, { foreignKey: 'partner_id', as: 'subscription' });

      // Histórico de faturas
      this.hasMany(models.Invoice, { foreignKey: 'partner_id', as: 'invoices' });
    }
  }

  Partner.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    company_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    tax_id: {
      type: DataTypes.STRING(50), // NIF / CNPJ
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    contact_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending_approval', 'under_review', 'active', 'suspended', 'rejected'),
      defaultValue: 'pending_approval',
      allowNull: false
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    documents: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Lista de URLs dos documentos enviados (Alvará, Identidade, etc)'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Informações comerciais adicionais'
    }
  }, {
    sequelize,
    modelName: 'Partner',
    tableName: 'partners',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['tax_id'] },
      { fields: ['email'] },
      { fields: ['status'] }
    ]
  });

  return Partner;
};
