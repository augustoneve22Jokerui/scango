const multer = require('multer');
const storageConfig = require('../../../config/storage');

/**
 * Instância configurada do Multer
 */
const upload = multer({
  storage: storageConfig.storage,
  fileFilter: storageConfig.fileFilter,
  limits: storageConfig.limits
});

/**
 * Middleware wrapper para facilitar o uso nos diferentes módulos
 */
const uploadMiddleware = {
  // Upload de imagem única (Avatar do Utilizador)
  singleAvatar: upload.single('avatar'),

  // Upload de imagem única (Foto do Produto)
  singleProduct: upload.single('product'),

  // Upload de imagem única (Logo da Loja)
  singleStore: upload.single('store'),

  // Upload de múltiplos documentos (KYC / Documentação de Parceiro)
  partnerDocuments: upload.array('documents', 5), // Limite de 5 arquivos

  // Upload genérico de imagens para o Feed
  feedImages: upload.array('images', 3)
};

module.exports = uploadMiddleware;
