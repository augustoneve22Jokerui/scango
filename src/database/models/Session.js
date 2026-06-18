const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Session extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma sessão pertence a um utilizador
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  Session.init({
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
      allowNull: true,
      comment: 'Vinculação opcional com o ID do dispositivo'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    last_activity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Session',
    tableName: 'sessions',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['device_identifier'] },
      { fields: ['is_active'] },
      { fields: ['expires_at'] }
    ]
  });

  return Session;
};
