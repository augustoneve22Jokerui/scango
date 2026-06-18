const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Campaign extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma campanha pertence a um parceiro (patrocinador)
      this.belongsTo(models.Partner, { foreignKey: 'partner_id', as: 'partner' });

      // Uma campanha pode gerar muitos QR Codes específicos
      this.hasMany(models.QRCode, { foreignKey: 'metadata->campaign_id', as: 'qrcodes' });
    }
  }

  Campaign.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    partner_id: {
      type: DataTypes.UUID,
      allowNull: true, // Null para campanhas institucionais da própria ScanGo
      references: { model: 'partners', key: 'id' }
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('sponsored', 'seasonal', 'event', 'social'),
      defaultValue: 'sponsored',
      allowNull: false
    },
    banner_url: {
      type: DataTypes.STRING,
      allowNull: true
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
      type: DataTypes.ENUM('draft', 'active', 'paused', 'expired', 'finished'),
      defaultValue: 'draft',
      allowNull: false
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Define a ordem de exibição no Feed/Destaques'
    },
    target_locations: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Cidades ou Províncias alvo da campanha'
    },
    points_multiplier: {
      type: DataTypes.FLOAT,
      defaultValue: 1.0,
      comment: 'Bónus de XP/Pontos para ações dentro desta campanha'
    }
  }, {
    sequelize,
    modelName: 'Campaign',
    tableName: 'campaigns',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['partner_id'] },
      { fields: ['status'] },
      { fields: ['start_date', 'end_date'] }
    ]
  });

  return Campaign;
};
