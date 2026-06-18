const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AuditLog extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // O log de auditoria pertence a um utilizador (autor da ação)
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  AuditLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, // Pode ser null para ações do sistema ou falhas de login
      references: { model: 'users', key: 'id' }
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Ex: UPDATE_PRODUCT_PRICE, DELETE_STORE, LOGIN_FAILURE'
    },
    entity: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Nome da tabela/entidade afetada (ex: Product, Store, User)'
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID do registro específico que foi afetado'
    },
    old_values: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Estado do registro antes da alteração'
    },
    new_values: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Estado do registro após a alteração (ou payload da requisição)'
    },
    ip_address: {
      type: DataTypes.STRING(45), // Suporta IPv6
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Status HTTP do resultado da operação'
    }
  }, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    underscored: true,
    timestamps: true, // createdAt servirá como a data do evento
    updatedAt: false, // Logs de auditoria nunca devem ser atualizados
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['entity', 'entity_id'] },
      { fields: ['created_at'] }
    ]
  });

  return AuditLog;
};
