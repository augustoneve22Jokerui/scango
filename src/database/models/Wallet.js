const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Wallet extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma carteira pertence obrigatoriamente a um utilizador
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

      // Uma carteira possui um histórico de transações
      this.hasMany(models.Transaction, { foreignKey: 'wallet_id', as: 'transactions' });
    }
  }

  Wallet.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    balance_credits: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0 // Impede saldo de créditos negativo a nível de modelo
      }
    },
    balance_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0 // Impede saldo de pontos negativo a nível de modelo
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'frozen', 'blocked'),
      defaultValue: 'active',
      allowNull: false,
      comment: 'frozen: saldo bloqueado para uso temporariamente; blocked: impedido de transacionar'
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'AOA', // Exemplo: Kwanza Angolano
      allowNull: false
    },
    last_transaction_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Dados extras como limites de gastos diários ou configurações de cashback'
    }
  }, {
    sequelize,
    modelName: 'Wallet',
    tableName: 'wallets',
    underscored: true,
    timestamps: true,
    indexes: [
      { fields: ['user_id'], unique: true },
      { fields: ['status'] },
      { fields: ['balance_credits'] },
      { fields: ['balance_points'] }
    ]
  });

  return Wallet;
};
