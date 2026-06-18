const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Subscription extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma assinatura pertence a um único parceiro
      this.belongsTo(models.Partner, { foreignKey: 'partner_id', as: 'partner' });

      // Uma assinatura possui muitas faturas (Invoices)
      this.hasMany(models.Invoice, { foreignKey: 'subscription_id', as: 'invoices' });

      // Nota: Embora 'Plan' não esteja na lista de arquivos da imagem,
      // a Subscription armazena o plano_id para referência de regras de negócio.
    }
  }

  Subscription.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    partner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // Um parceiro só pode ter uma assinatura ativa por vez
      references: { model: 'partners', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    plan_id: {
      type: DataTypes.STRING, // Referência ao ID do plano (ex: 'basic', 'premium', 'enterprise')
      allowNull: false
    },
    external_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'ID da assinatura no Gateway de Pagamento (Stripe/PayPal/etc)'
    },
    status: {
      type: DataTypes.ENUM('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused'),
      defaultValue: 'active',
      allowNull: false
    },
    current_period_start: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    current_period_end: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cancel_at_period_end: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Se verdadeiro, a assinatura será encerrada ao final do período atual'
    },
    trial_start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    trial_end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Dados extras do gateway ou configurações específicas da assinatura'
    }
  }, {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['partner_id'] },
      { fields: ['status'] },
      { fields: ['external_id'] },
      { fields: ['current_period_end'] }
    ]
  });

  return Subscription;
};
