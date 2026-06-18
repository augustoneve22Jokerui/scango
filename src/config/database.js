require('dotenv').config();

module.exports = {
  // Configuração para ambiente de Desenvolvimento
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log, // Log de SQL no console em dev
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      createdAt: 'created_at',
      updated_at: 'updated_at'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  // Configuração para ambiente de Testes
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_TEST || 'scango_test',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true
    }
  },

  // Configuração para ambiente de Produção (Enterprise Ready)
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true
    },
    pool: {
      max: 20, // Aumentado para suportar maior carga
      min: 5,
      acquire: 60000,
      idle: 20000
    },
    // SSL é obrigatório em provedores como AWS RDS ou Azure
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
