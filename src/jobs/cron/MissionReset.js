const cron = require('node-cron');
const { Mission, UserMission, Sequelize } = require('../../database/models');
const logger = require('../../config/logger');

/**
 * Job: Reset de Missões Recorrentes
 * Executa todos os dias às 00:05 (logo após o ranking)
 */
const missionResetJob = cron.schedule('5 0 * * *', async () => {
  const transaction = await UserMission.sequelize.transaction();

  logger.info('[CRON] Iniciando reset de missões diárias...');

  try {
    // 1. Identificar missões do tipo 'daily' que precisam de reset
    // Em um cenário Enterprise, arquivamos o progresso anterior em vez de deletar
    // para manter o histórico de auditoria e analytics.

    const [updatedCount] = await UserMission.update({
      status: 'expired', // Marca como expirada se não foi concluída
      updated_at: new Date()
    }, {
      where: {
        status: 'in_progress',
        // Join implícito com a tabela Mission para filtrar apenas as diárias
        '$mission.frequency$': 'daily'
      },
      include: [{
        model: Mission,
        as: 'mission',
        where: { frequency: 'daily' }
      }],
      transaction
    });

    // 2. Opcional: Resetar missões concluídas que são recorrentes
    // Isso permite que o utilizador a veja como "nova" no dia seguinte
    const [resetCount] = await UserMission.update({
      progress: 0,
      status: 'in_progress',
      reward_claimed: false,
      completed_at: null
    }, {
      where: {
        status: 'archived', // Já concluída e resgatada anteriormente
        '$mission.frequency$': 'daily',
        '$mission.is_recurring$': true
      },
      include: [{
        model: Mission,
        as: 'mission',
        where: { frequency: 'daily', is_recurring: true }
      }],
      transaction
    });

    await transaction.commit();
    logger.info(`[CRON] Reset de missões concluído. Expiradas: ${updatedCount} | Reiniciadas: ${resetCount}`);
  } catch (error) {
    if (transaction) await transaction.rollback();
    logger.error(`[CRON ERROR] Falha no reset de missões: ${error.message}`);
  }
}, {
  scheduled: true,
  timezone: "Africa/Luanda"
});

module.exports = missionResetJob;
