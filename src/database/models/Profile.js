const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Profile extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Relacionamento reverso com User
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

      // Relacionamento com a tabela de Níveis
      this.belongsTo(models.Level, { foreignKey: 'level_id', as: 'level' });

      // Um perfil pode ter muitas conquistas desbloqueadas
      this.hasMany(models.UserAchievement, { foreignKey: 'profile_id', as: 'achievements' });
    }
  }

  Profile.init({
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    // Dados de Gamificação
    xp: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    level_id: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    // Localização para Rankings segmentados
    province: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('M', 'F', 'O'),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'profiles',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['xp'] }, // Índice para otimizar busca de rankings
      { fields: ['province', 'city'] } // Índice composto para rankings regionais
    ]
  });

  return Profile;
};
