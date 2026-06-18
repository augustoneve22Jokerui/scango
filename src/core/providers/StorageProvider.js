const fs = require('fs').promises;
const path = require('path');
const storageConfig = require('../../config/storage');
const logger = require('../../config/logger');

class StorageProvider {
  constructor() {
    // Define o tipo de armazenamento baseado no .env (local ou s3/cloud)
    this.storageType = process.env.STORAGE_TYPE || 'local';
  }

  /**
   * Salva um arquivo no destino final
   * @param {Object} file - Objeto de arquivo do Multer
   * @param {string} folder - Subpasta de destino (ex: 'avatars', 'products')
   * @returns {string} - Caminho relativo ou URL do arquivo salvo
   */
  async saveFile(file, folder) {
    if (this.storageType === 'local') {
      return this.saveLocal(file, folder);
    } else {
      return this.saveCloud(file, folder);
    }
  }

  /**
   * Implementação para armazenamento Local
   */
  async saveLocal(file, folder) {
    try {
      // O Multer já salvou o arquivo na pasta temporária definida no config/storage.js
      // Aqui apenas confirmamos o nome gerado e retornamos o path relativo
      const fileName = file.filename;

      logger.info(`Arquivo salvo localmente: ${folder}/${fileName}`);

      // Retorna a URL relativa para ser acessada via static files ou salva no DB
      return `/uploads/${folder}/${fileName}`;
    } catch (error) {
      logger.error(`Erro ao processar arquivo local: ${error.message}`);
      throw new Error('Falha ao processar upload de arquivo.');
    }
  }

  /**
   * Implementação para armazenamento em Cloud (Ex: S3/DigitalOcean Spaces)
   * Placeholder para expansão Enterprise
   */
  async saveCloud(file, folder) {
    try {
      logger.info(`Iniciando upload para Cloud: ${folder}/${file.filename}`);

      // Aqui entraria a lógica do SDK da AWS (S3.putObject)
      // const fileContent = await fs.readFile(file.path);
      // await s3.upload({...}).promise();
      // await fs.unlink(file.path); // Remove o arquivo temporário local

      return `https://cdn.scango.com/${folder}/${file.filename}`;
    } catch (error) {
      logger.error(`Erro no upload Cloud: ${error.message}`);
      throw new Error('Falha ao enviar arquivo para o servidor de nuvem.');
    }
  }

  /**
   * Remove um arquivo do armazenamento
   * @param {string} filePath - Caminho relativo ou URL do arquivo
   */
  async deleteFile(filePath) {
    if (!filePath) return;

    try {
      if (this.storageType === 'local') {
        // Converte URL relativa em caminho absoluto no servidor
        const absolutePath = path.resolve(
          storageConfig.directory,
          '..',
          filePath.replace(/^\//, '') // Remove a barra inicial se houver
        );

        // Verifica se o arquivo existe antes de tentar deletar
        await fs.access(absolutePath);
        await fs.unlink(absolutePath);

        logger.info(`Arquivo deletado: ${absolutePath}`);
      } else {
        // Lógica para deletar do S3/Cloud
        logger.info(`Solicitação de remoção Cloud: ${filePath}`);
      }
    } catch (error) {
      // Se o arquivo não existir, apenas logamos um aviso e seguimos
      logger.warn(`Tentativa de deletar arquivo inexistente ou sem permissão: ${filePath}`);
    }
  }
}

module.exports = new StorageProvider();
