const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Feed extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma publicação pertence a um autor (pode ser um Admin/User ou vinculado a um Partner)
      this.belongsTo(models.User, { foreignKey: 'author_id', as: 'author' });

      // Se a notícia for específica de um parceiro
      this.belongsTo(models.Partner, { foreignKey: 'partner_id', as: 'partner' });
    }
  }

  Feed.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    partner_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'partners', key: 'id' },
      comment: 'Opcional: preenchido se a notícia for de um parceiro específico'
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    summary: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Breve resumo para exibição em cards de lista'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('news', 'event', 'update', 'promotion', 'system'),
      defaultValue: 'news',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'published',
      allowNull: false
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Destaque no topo do feed'
    },
    // Geolocalização para conteúdos regionais
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    radius_km: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Raio de visibilidade em KM (0 = global)'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Dados extras (ex: links externos, configurações de botões)'
    },
    published_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Feed',
    tableName: 'feeds',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['author_id'] },
      { fields: ['partner_id'] },
      { fields: ['status'] },
      { fields: ['category'] },
      { fields: ['published_at'] },
      { fields: ['latitude', 'longitude'] } // Índice para busca espacial simplificada
    ]
  });

  return Feed;
};
