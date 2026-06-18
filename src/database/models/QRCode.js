const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class QRCode extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Um QR Code pode pertencer a um parceiro
      this.belongsTo(models.Partner, { foreignKey: 'partner_id', as: 'partner' });

      // Um QR Code pode estar vinculado a uma loja específica
      this.belongsTo(models.Store, { foreignKey: 'store_id', as: 'store' });

      // Um QR Code regista muitos logs de scan
      this.hasMany(models.ScanLog, { foreignKey: 'qrcode_id', as: 'scans' });
    }
  }

  QRCode.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    partner_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'partners', key: 'id' }
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'stores', key: 'id' }
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'O código único/hash contido no QR Code'
    },
    type: {
      type: DataTypes.ENUM('public', 'private', 'campaign', 'event', 'store_checkin'),
      allowNull: false,
      defaultValue: 'public'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'expired', 'exhausted', 'revoked'),
      defaultValue: 'active',
      allowNull: false
    },
    max_uses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '0 significa usos ilimitados'
    },
    current_uses: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Dados extras (ex: id_campanha, pontos_bonus, coordenadas_obrigatorias)'
    }
  }, {
    sequelize,
    modelName: 'QRCode',
    tableName: 'qrcodes',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['partner_id'] },
      { fields: ['store_id'] },
      { fields: ['status'] },
      { fields: ['type'] }
    ]
  });

  return QRCode;
};
