const FeedService = require('../../../core/services/FeedService');
const logger = require('../../../config/logger');

class FeedController {
  /**
   * Obtém o feed de notícias e eventos com paginação
   * Pode ser filtrado por categoria ou relevância geográfica
   */
  async index(req, res, next) {
    try {
      const { page, limit, category, lat, lng } = req.query;
      const feedItems = await FeedService.getFeed({
        page,
        limit,
        category,
        lat,
        lng
      });

      return res.status(200).json({
        success: true,
        data: feedItems
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém os detalhes de um post ou notícia específica
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const post = await FeedService.getPostById(id);

      return res.status(200).json({
        success: true,
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria uma nova publicação no feed (Ação de Admin ou Parceiro Verificado)
   */
  async store(req, res, next) {
    try {
      const postData = req.body;
      const authorId = req.user?.id || req.partner?.id; // Suporta Admin ou Parceiro

      const newPost = await FeedService.createPost(authorId, postData);

      logger.info(`Nova publicação no feed: ${newPost.title} por ID: ${authorId}`);

      return res.status(201).json({
        success: true,
        message: 'Publicação criada com sucesso.',
        data: newPost
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza uma publicação existente
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const authorId = req.user?.id || req.partner?.id;

      const updatedPost = await FeedService.updatePost(id, authorId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Publicação atualizada com sucesso.',
        data: updatedPost
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove uma publicação (Soft delete ou inativação)
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const authorId = req.user?.id || req.partner?.id;

      await FeedService.deletePost(id, authorId);

      logger.warn(`Publicação removida do feed: ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Publicação removida com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeedController();
