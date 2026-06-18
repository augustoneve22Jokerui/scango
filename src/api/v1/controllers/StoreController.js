const StoreService = require('../../../core/services/StoreService');
const logger = require('../../../config/logger');

class StoreController {
  /**
   * Lista todas as lojas com filtros (Categoria, Nome, Status)
   */
  async index(req, res, next) {
    try {
      const filters = req.query;
      const stores = await StoreService.listStores(filters);

      return res.status(200).json({
        success: true,
        data: stores
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca lojas próximas com base na latitude e longitude do usuário
   */
  async getNearby(req, res, next) {
    try {
      const { lat, lng, radius } = req.query;
      const stores = await StoreService.findNearby(lat, lng, radius);

      return res.status(200).json({
        success: true,
        data: stores
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém detalhes completos de uma loja específica
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const store = await StoreService.getStoreDetails(id);

      return res.status(200).json({
        success: true,
        data: store
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria uma nova unidade física (Ação de Parceiro ou Admin)
   */
  async store(req, res, next) {
    try {
      const storeData = req.body;
      const partnerId = req.partner?.id || req.body.partner_id; // Suporta Admin criando para parceiro

      const newStore = await StoreService.createStore(partnerId, storeData);

      logger.info(`Nova loja cadastrada: ${newStore.name} (Partner ID: ${partnerId})`);

      return res.status(201).json({
        success: true,
        message: 'Loja cadastrada com sucesso.',
        data: newStore
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza informações da loja (Geolocalização, Horários, Categorias)
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedStore = await StoreService.updateStore(id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Informações da loja atualizadas com sucesso.',
        data: updatedStore
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove uma loja ou marca como inativa
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await StoreService.deleteStore(id);

      logger.warn(`Loja removida/inativada: ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Loja removida com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StoreController();
