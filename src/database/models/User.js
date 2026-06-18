const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  class User extends Model {
    /**
     * Definição das associações
     */
    static associate(models) {
      this.hasOne(models.Profile, { foreignKey: 'user_id', as: 'profile' });
      this.hasOne(models.Wallet, { foreignKey: 'user_id', as: 'wallet' });
      this.hasMany(models.Device, { foreignKey: 'user_id', as: 'devices' });
      this.hasMany(models.RefreshToken, { foreignKey: 'user_id', as: 'refresh_tokens' });
      this.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' });
      this.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'audit_logs' });
    }

    /**
     * Método para validar a senha (usado no AuthService)
     */
    checkPassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'partner', 'user'),
      defaultValue: 'user',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
      defaultValue: 'active',
      allowNull: false
    },
    push_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notification_preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        push: true,
        email: true,
        promo: true
      }
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    hooks: {
      // Hook automático para hash de senha antes de salvar/atualizar
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
    // Proteção: Nunca retornar a senha em consultas por padrão
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: { attributes: {} }
    }
  });

  return User;
};
