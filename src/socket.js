const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const authConfig = require('./config/auth');
const logger = require('./config/logger');

class SocketHandler {
  constructor() {
    this.io = null;
  }

  /**
   * Inicializa o Socket.IO acoplado ao servidor HTTP
   */
  init(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
        methods: ['GET', 'POST']
      }
    });

    // Middleware de Autenticação para WebSockets
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Autenticação via Socket falhou: Token ausente.'));
      }

      try {
        const decoded = jwt.verify(token, authConfig.jwt.secret);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (err) {
        return next(new Error('Autenticação via Socket falhou: Token inválido.'));
      }
    });

    this.setupEvents();

    // Injeta a instância no global para ser acessível pelos Services (como NotificationService)
    global.io = this.io;

    logger.info('Servidor Socket.IO inicializado e protegido com JWT.');
    return this.io;
  }

  /**
   * Define os eventos básicos de conexão e gestão de salas
   */
  setupEvents() {
    this.io.on('connection', (socket) => {
      logger.info(`Utilizador conectado ao Socket: ${socket.userId} (Socket ID: ${socket.id})`);

      // Coloca o utilizador numa sala privada baseada no seu ID
      // Isso permite enviar mensagens para um utilizador específico via io.to(`user:${userId}`)
      socket.join(`user:${socket.userId}`);

      // Se o utilizador for um parceiro, entra na sala do parceiro
      if (socket.userRole === 'partner') {
        socket.join('partners_room');
      }

      socket.on('disconnect', () => {
        logger.info(`Utilizador desconectado do Socket: ${socket.id}`);
      });

      // Evento de erro genérico
      socket.on('error', (err) => {
        logger.error(`Erro no Socket para o utilizador ${socket.userId}: ${err.message}`);
      });
    });
  }
}

module.exports = new SocketHandler();
