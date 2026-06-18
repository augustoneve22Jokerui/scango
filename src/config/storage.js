const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Caminho base para os uploads
const uploadFolder = path.resolve(__dirname, '..', 'public', 'uploads');

module.exports = {
  // Diretório base exposto para a aplicação
  directory: uploadFolder,

  // Configuração de armazenamento em disco
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Lógica para separar arquivos por tipo baseado no fieldname da requisição
      let folder = '';
      
      switch (file.fieldname) {
        case 'avatar':
          folder = 'avatars';
          break;
        case 'product':
          folder = 'products';
          break;
        case 'document':
          folder = 'documents';
          break;
        default:
          folder = 'images';
      }
      
      cb(null, path.resolve(uploadFolder, folder));
    },
    filename: (req, file, cb) => {
      // Gera um hash aleatório para o nome do arquivo para evitar sobrescrita e nomes maliciosos
      const fileHash = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileHash}-${Date.now()}${path.extname(file.originalname)}`;
      
      cb(null, fileName);
    }
  }),

  // Filtros de Segurança
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif',
      'application/pdf' // Permitido apenas para documentos
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido.'));
    }
  },

  // Limites (Enterprise Standard)
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por arquivo
  }
};