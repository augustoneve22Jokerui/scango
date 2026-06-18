const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Ticket extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Um ticket pertence a um utilizador (quem abriu o chamado)
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

      // Um ticket possui muitas mensagens de chat
      this.hasMany(models.Message, { foreignKey: 'ticket_id', as: 'messages' });

      // Opcional: Um ticket pode ser atribuído a um administrador/agente específico
      this.belongsTo(models.User, { foreignKey: 'assigned_to', as: 'agent' });
    }
  }

  Ticket.init({
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
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      comment: 'ID do Admin ou Agente de Suporte responsável'
    },
    subject: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('account', 'billing', 'scan_error', 'reward_issue', 'technical', 'other'),
      defaultValue: 'technical',
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'awaiting_user', 'resolved', 'closed'),
      defaultValue: 'open',
      allowNull: false
    },
    last_message_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Usado para ordenar tickets por atividade recente'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Dados extras do contexto (ex: versão do App, modelo do telemóvel)'
    }
  }, {
    sequelize,
    modelName: 'Ticket',
    tableName: 'tickets',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['category'] },
      { fields: ['assigned_to'] },
      { fields: ['last_message_at'] }
    ]
  });

  return Ticket;
};
