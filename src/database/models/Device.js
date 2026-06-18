const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Device extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Um dispositivo pertence a um utilizador específico
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  Device.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    device_identifier: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ID único gerado pelo hardware ou fingerprint do navegador'
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Ex: iPhone 15 Pro, Samsung S23'
    },
    os: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Ex: iOS 17.2, Android 14'
    },
    last_ip: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_trusted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Define se o utilizador marcou este dispositivo como confiável'
    },
    last_login: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Device',
    tableName: 'user_devices',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['device_identifier'] },
      // Índice composto para busca rápida de dispositivo específico de um utilizador
      { fields: ['user_id', 'device_identifier'], unique: true }
    ]
  });

  return Device;
};
