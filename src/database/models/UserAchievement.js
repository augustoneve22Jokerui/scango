const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserAchievement extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma conquista desbloqueada pertence a um perfil de utilizador
      this.belongsTo(models.Profile, { foreignKey: 'profile_id', as: 'profile' });

      // Uma conquista desbloqueada refere-se a uma conquista do catálogo
      this.belongsTo(models.Achievement, { foreignKey: 'achievement_id', as: 'achievement' });
    }
  }

  UserAchievement.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'profiles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    achievement_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'achievements', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    unlocked_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    notified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Define se o utilizador já visualizou a animação/notificação de conquista no App'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Dados do momento do desbloqueio (ex: XP total na altura, localidade)'
    }
  }, {
    sequelize,
    modelName: 'UserAchievement',
    tableName: 'user_achievements',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['profile_id'] },
      { fields: ['achievement_id'] },
      { fields: ['unlocked_at'] },
      // Garante que um utilizador não ganhe a mesma conquista duas vezes (se for única)
      { fields: ['profile_id', 'achievement_id'], unique: true }
    ]
  });

  return UserAchievement;
};
