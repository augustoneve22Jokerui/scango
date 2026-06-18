const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Notification extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma notificação pertence a um utilizador
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  Notification.init({
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
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('system', 'promo', 'security', 'achievement', 'mission', 'reward', 'support'),
      defaultValue: 'system',
      allowNull: false
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Dados para Deep Linking (ex: { "screen": "Product", "id": "uuid" })'
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['read'] },
      { fields: ['type'] },
      { fields: ['created_at'] },
      // Índice composto para busca rápida de notificações não lidas do utilizador
      { fields: ['user_id', 'read'] }
    ]
  });

  return Notification;
};
