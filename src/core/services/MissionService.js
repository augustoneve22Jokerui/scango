const { Mission, UserMission, Wallet, Transaction, Profile, Sequelize } = require('../../database/models');
const AppError = require('../../shared/errors/AppError');
const logger = require('../../config/logger');

class MissionService {
  /**
   * Lista missões disponíveis para o utilizador, cruzando com o seu progresso atual
   */
  async getAvailableMissions(userId) {
    const now = new Date();

    return await Mission.findAll({
      where: {
        status: 'active',
        start_date: { [Sequelize.Op.lte]: now },
        end_date: { [Sequelize.Op.gte]: now }
      },
      include: [
        {
          model: UserMission,
          as: 'user_progress',
          where: { user_id: userId },
          required: false // Traz a missão mesmo que o utilizador ainda não a tenha iniciado
        }
      ],
      order: [['priority', 'DESC'], ['created_at', 'ASC']]
    });
  }

  /**
   * Obtém detalhes de uma missão e o progresso detalhado do utilizador
   */
  async getMissionProgress(missionId, userId) {
    const mission = await Mission.findByPk(missionId, {
      include: [{
        model: UserMission,
        as: 'user_progress',
        where: { user_id: userId },
        required: false
      }]
    });

    if (!mission) throw new AppError('Missão não encontrada.', 404);

    return mission;
  }

  /**
   * Atualiza o progresso de uma missão (Chamado internamente por outros services como ProductService)
   */
  async updateProgress(userId, missionType, increment = 1) {
    // Busca missões ativas que correspondam ao gatilho (ex: 'SCAN_PRODUCT')
    const activeMissions = await Mission.findAll({
      where: { type: missionType, status: 'active' }
    });

    for (const mission of activeMissions) {
      const [userMission, created] = await UserMission.findOrCreate({
        where: { user_id: userId, mission_id: mission.id },
        defaults: { progress: 0, status: 'in_progress' }
      });

      if (userMission.status === 'in_progress') {
        const newProgress = userMission.progress + increment;
        const isCompleted = newProgress >= mission.requirement_count;

        await userMission.update({
          progress: newProgress,
          status: isCompleted ? 'completed' : 'in_progress',
          completed_at: isCompleted ? new Date() : null
        });

        if (isCompleted) {
          logger.info(`Utilizador ${userId} completou a missão: ${mission.title}`);
          // Notificar via Socket/Push poderia ser disparado aqui
        }
      }
    }
  }

  /**
   * Processa o resgate da recompensa de uma missão concluída
   * Utiliza transação para garantir integridade entre status da missão e saldo da carteira
   */
  async claimMissionReward(missionId, userId) {
    const userMission = await UserMission.findOne({
      where: { mission_id: missionId, user_id: userId },
      include: [{ model: Mission, as: 'mission' }]
    });

    if (!userMission || userMission.status !== 'completed') {
      throw new AppError('Esta missão ainda não foi concluída ou não existe.', 400);
    }

    if (userMission.reward_claimed) {
      throw new AppError('A recompensa desta missão já foi resgatada.', 400);
    }

    const transaction = await UserMission.sequelize.transaction();

    try {
      // 1. Marcar como resgatado
      await userMission.update({
        reward_claimed: true,
        claimed_at: new Date(),
        status: 'archived'
      }, { transaction });

      // 2. Atualizar a carteira (Wallet)
      const wallet = await Wallet.findOne({ where: { user_id: userId }, transaction });

      const rewardType = userMission.mission.reward_type; // 'points' ou 'credits'
      const rewardValue = userMission.mission.reward_value;

      if (rewardType === 'points') {
        await wallet.increment('balance_points', { by: rewardValue, transaction });
      } else {
        await wallet.increment('balance_credits', { by: rewardValue, transaction });
      }

      // 3. Gerar Log de Transação
      await Transaction.create({
        wallet_id: wallet.id,
        user_id: userId,
        type: rewardType === 'points' ? 'points_earn' : 'credit_deposit',
        amount: rewardValue,
        description: `Recompensa da missão: ${userMission.mission.title}`,
        reference_type: 'mission',
        reference_id: missionId
      }, { transaction });

      await transaction.commit();

      return {
        reward_type: rewardType,
        reward_value: rewardValue,
        new_balance: rewardType === 'points' ? wallet.balance_points + rewardValue : wallet.balance_credits + rewardValue
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`Erro ao resgatar recompensa de missão: ${error.message}`);
      throw error;
    }
  }

  /**
   * Criação de novas missões (Admin)
   */
  async createMission(missionData) {
    return await Mission.create({
      ...missionData,
      status: 'active'
    });
  }
}

module.exports = new MissionService();
