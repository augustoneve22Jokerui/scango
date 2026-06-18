const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Transaction extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      // Uma transação pertence a uma carteira específica
      this.belongsTo(models.Wallet, { foreignKey: 'wallet_id', as: 'wallet' });

      // Uma transação pertence a um utilizador
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  Transaction.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    wallet_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'wallets', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    type: {
      type: DataTypes.ENUM(
        'credit_deposit',    // Depósito de dinheiro real
        'credit_spend',      // Gasto de créditos em compras
        'points_earn',       // Ganho de pontos (scans, missões)
        'points_spend',      // Troca de pontos por recompensas
        'points_transfer',   // Transferência entre utilizadores
        'refund',            // Estorno
        'adjustment'         // Ajuste administrativo (correções)
      ),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2), // Suporta valores altos e precisão decimal
      allowNull: false,
      defaultValue: 0.00
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Texto descritivo para o extrato do utilizador'
    },
    reference_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Entidade que originou a transação (ex: mission, scan, reward, payment)'
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID do registro de referência (ex: UUID da missão concluída)'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Dados extras técnicos (ex: gateway_id, old_balance, new_balance)'
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    underscored: true,
    timestamps: true,
    updatedAt: false, // Transações financeiras são imutáveis (append-only)
    indexes: [
      { fields: ['wallet_id'] },
      { fields: ['user_id'] },
      { fields: ['type'] },
      { fields: ['reference_type', 'reference_id'] },
      { fields: ['created_at'] }
    ]
  });

  return Transaction;
};
