const SupportService = require('../../../core/services/SupportService');
const logger = require('../../../config/logger');

class SupportController {
  /**
   * Lista todos os tickets de suporte abertos pelo utilizador autenticado
   */
  async index(req, res, next) {
    try {
      const userId = req.user.id;
      const { status, page, limit } = req.query;

      const tickets = await SupportService.getUserTickets(userId, { status, page, limit });

      return res.status(200).json({
        success: true,
        data: tickets
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Abre um novo ticket de suporte
   */
  async store(req, res, next) {
    try {
      const userId = req.user.id;
      const ticketData = req.body;

      const newTicket = await SupportService.createTicket(userId, ticketData);

      logger.info(`Novo ticket de suporte aberto pelo utilizador ${userId}: ${newTicket.id}`);

      return res.status(201).json({
        success: true,
        message: 'Ticket de suporte aberto com sucesso.',
        data: newTicket
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém os detalhes de um ticket específico e o histórico de mensagens (chat)
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const ticketDetails = await SupportService.getTicketDetails(id, userId);

      return res.status(200).json({
        success: true,
        data: ticketDetails
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adiciona uma nova mensagem a um ticket existente (Réplica do utilizador)
   */
  async sendMessage(req, res, next) {
    try {
      const { id } = req.params; // ID do ticket
      const userId = req.user.id;
      const { message } = req.body;
      const attachments = req.files; // Suporta envio de prints/documentos

      const newMessage = await SupportService.addMessage(id, userId, {
        message,
        attachments
      });

      return res.status(201).json({
        success: true,
        message: 'Mensagem enviada com sucesso.',
        data: newMessage
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Encerra um ticket de suporte (Ação do utilizador ou Admin)
   */
  async close(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await SupportService.closeTicket(id, userId);

      logger.info(`Ticket de suporte ${id} encerrado.`);

      return res.status(200).json({
        success: true,
        message: 'Ticket encerrado com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SupportController();
