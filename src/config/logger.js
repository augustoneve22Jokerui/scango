const winston = require('winston');
const path = require('path');

// Define os níveis de log (padrão RFC5424)
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define qual nível deve ser exibido baseado no ambiente
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Cores para os logs no console
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formatação customizada
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Formatação para arquivos (JSON para facilitar análise por ferramentas de Log Management)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json()
);

// Define onde os logs serão armazenados
const transports = [
  // Console para desenvolvimento
  new winston.transports.Console({ format }),

  // Arquivo para erros críticos
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: fileFormat,
  }),

  // Arquivo para todos os logs (Combined)
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: fileFormat,
  }),
];

// Instancia o logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

module.exports = logger;
