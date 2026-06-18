const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserMission extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // O progresso pertence a um utilizador
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

      // O progresso refere-se a uma missão específica
      this.belongsTo(models.Mission, { foreignKey: 'mission_id', as: 'mission' });
    }
  }

  UserMission.init({
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
    mission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'missions', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Contagem atual do requisito (ex: 3 de 10 scans)'
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'completed', 'archived', 'expired'),
      defaultValue: 'in_progress',
      allowNull: false
    },
    reward_claimed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    claimed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Logs de progresso específicos ou snapshots'
    }
  }, {
    sequelize,
    modelName: 'UserMission',
    tableName: 'user_missions',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['mission_id'] },
      { fields: ['status'] },
      { fields: ['reward_claimed'] },
      // Índice composto para busca rápida de missões específicas de um utilizador
      { fields: ['user_id', 'mission_id'] }
    ]
  });

  return UserMission;
};
