const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Achievement extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Relacionamento N:M com Profile através de UserAchievement
      this.hasMany(models.UserAchievement, {
        foreignKey: 'achievement_id',
        as: 'user_unlocks'
      });
    }
  }

  Achievement.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('scan', 'social', 'mission', 'loyalty', 'special'),
      allowNull: false,
      defaultValue: 'scan'
    },
    icon_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    points_reward: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Pontos bónus concedidos ao desbloquear esta conquista'
    },
    secret: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Se verdadeiro, a conquista só aparece após ser desbloqueada'
    },
    requirements: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Regras para desbloqueio (ex: { "scans": 100 })'
    }
  }, {
    sequelize,
    modelName: 'Achievement',
    tableName: 'achievements',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['category'] },
      { fields: ['name'] }
    ]
  });

  return Achievement;
};
