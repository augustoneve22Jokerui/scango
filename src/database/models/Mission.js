const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Mission extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma missão pode ser criada por um parceiro específico (ex: Missão de uma Loja)
      this.belongsTo(models.Partner, { foreignKey: 'partner_id', as: 'partner' });

      // Relacionamento N:M com User através de UserMission
      this.hasMany(models.UserMission, { foreignKey: 'mission_id', as: 'user_progress' });
    }
  }

  Mission.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    partner_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'partners', key: 'id' },
      comment: 'Se nulo, é uma missão global da plataforma'
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('scan_product', 'visit_store', 'share_app', 'complete_profile', 'social_action'),
      allowNull: false,
      defaultValue: 'scan_product'
    },
    frequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'once', 'special'),
      allowNull: false,
      defaultValue: 'once'
    },
    requirement_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Ex: "total_scans", "specific_category_id"'
    },
    requirement_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      comment: 'Quantidade necessária para completar (ex: 5 scans)'
    },
    reward_type: {
      type: DataTypes.ENUM('points', 'xp', 'credits'),
      allowNull: false,
      defaultValue: 'xp'
    },
    reward_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'archived'),
      defaultValue: 'active',
      allowNull: false
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Define se a missão reseta após o cumprimento ou ciclo'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Se nulo, a missão não expira'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Dados extras (ex: ID da categoria ou produto específico)'
    }
  }, {
    sequelize,
    modelName: 'Mission',
    tableName: 'missions',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['partner_id'] },
      { fields: ['status'] },
      { fields: ['type'] },
      { fields: ['frequency'] },
      { fields: ['start_date', 'end_date'] }
    ]
  });

  return Mission;
};
