const MapService = require('../../../core/services/MapService');
const logger = require('../../../config/logger');

class MapController {
  /**
   * Obtém todos os pontos de interesse (POIs) para o mapa dentro de um raio
   * Consolida: Lojas Parceiras, Missões Ativas e Promoções Geolocalizadas.
   */
  async getPoints(req, res, next) {
    try {
      const { lat, lng, radius, filters } = req.query;
      // filters pode conter: 'stores', 'missions', 'promotions', 'events'

      const points = await MapService.getMapPoints({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius: parseFloat(radius) || 5, // Default 5km
        filters: filters ? filters.split(',') : ['stores', 'missions', 'promotions']
      });

      return res.status(200).json({
        success: true,
        data: points
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém um resumo rápido de um ponto específico ao clicar no marcador do mapa
   */
  async getPointDetails(req, res, next) {
    try {
      const { id } = req.params;
      const { type } = req.query; // 'store', 'mission', etc.

      const details = await MapService.getPointSummary(id, type);

      return res.status(200).json({
        success: true,
        data: details
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca por endereços ou locais específicos para reposicionar o mapa
   */
  async searchLocation(req, res, next) {
    try {
      const { q } = req.query;
      const locations = await MapService.searchGeocode(q);

      return res.status(200).json({
        success: true,
        data: locations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna os limites geográficos (Boundaries) onde o ScanGo está ativo
   * Útil para o App restringir a área de navegação ou mostrar cobertura.
   */
  async getCoverage(req, res, next) {
    try {
      const coverage = await MapService.getServiceCoverage();

      return res.status(200).json({
        success: true,
        data: coverage
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MapController();
