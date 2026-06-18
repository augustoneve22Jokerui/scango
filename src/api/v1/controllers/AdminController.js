const AdminService = require('../../../core/services/AdminService');
const logger = require('../../../config/logger');

class AdminController {
  /**
   * Obtém estatísticas rápidas para o Dashboard Admin (Visão Geral)
   */
  async getOverview(req, res, next) {
    try {
      const stats = await AdminService.getGlobalStats();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista utilizadores com filtros avançados para gestão
   */
  async listUsers(req, res, next) {
    try {
      const filters = req.query;
      const users = await AdminService.getAllUsers(filters);

      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Altera o status de um utilizador (Ativar, Suspender, Banir)
   */
  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const adminId = req.user.id;

      const result = await AdminService.changeUserStatus(id, status, reason, adminId);

      logger.warn(`Status do utilizador ${id} alterado para ${status} por Admin ${adminId}`);

      return res.status(200).json({
        success: true,
        message: `Status do utilizador atualizado para ${status}.`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aprova ou Rejeita a solicitação de um novo Parceiro
   */
  async reviewPartnerRequest(req, res, next) {
    try {
      const { id } = req.params;
      const { action, note } = req.body; // action: 'approve' ou 'reject'
      const adminId = req.user.id;

      const result = await AdminService.processPartnerOnboarding(id, action, note, adminId);

      return res.status(200).json({
        success: true,
        message: `Parceiro ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso.`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gestão de permissões e Roles (RBAC)
   */
  async updatePermissions(req, res, next) {
    try {
      const { id } = req.params; // ID do utilizador
      const { roles } = req.body;

      const result = await AdminService.setUserRoles(id, roles);

      return res.status(200).json({
        success: true,
        message: 'Permissões atualizadas com sucesso.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
