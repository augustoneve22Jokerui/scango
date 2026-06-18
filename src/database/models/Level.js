const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Level extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Um nível pode estar associado a muitos perfis (utilizadores naquele nível)
      this.hasMany(models.Profile, { foreignKey: 'level_id', as: 'profiles' });
    }
  }

  Level.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    level_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING(50), // Ex: 'Iniciante', 'Explorador', 'Mestre do Scan'
      allowNull: false
    },
    required_xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: 'XP total acumulado necessário para atingir este nível'
    },
    icon_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Ícone/Badge representativo do nível'
    },
    reward_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Pontos bónus concedidos automaticamente ao atingir este nível'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Level',
    tableName: 'levels',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['level_number'] },
      { fields: ['required_xp'] }
    ]
  });

  return Level;
};
