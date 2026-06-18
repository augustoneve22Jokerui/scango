const path = require('path');

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'ScanGo API Documentation',
    version: '1.0.0',
    description: 'Documentação completa do ecossistema ScanGo: Autenticação, Gamificação, Carteira e Marketplace.',
    contact: {
      name: 'ScanGo Dev Team',
      email: 'tech@scango.com'
    },
  },
  servers: [
    {
      url: process.env.APP_URL || 'http://localhost:3000',
      description: 'Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  // Caminhos onde o Swagger buscará as anotações de rotas e schemas
  apis: [
    path.resolve(__dirname, '..', 'api', 'v1', 'routes', '*.js'),
    path.resolve(__dirname, '..', 'database', 'models', '*.js')
  ]
};
