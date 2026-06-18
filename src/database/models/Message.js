const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Message extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma mensagem pertence a um ticket específico
      this.belongsTo(models.Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

      // Uma mensagem é enviada por um utilizador (Cliente ou Admin/Suporte)
      this.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
    }
  }

  Message.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ticket_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'tickets', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Conteúdo da mensagem de texto'
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array de URLs de imagens ou documentos anexados'
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data/Hora em que a mensagem foi lida pelo destinatário'
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['ticket_id'] },
      { fields: ['sender_id'] },
      { fields: ['created_at'] }
    ]
  });

  return Message;
};
