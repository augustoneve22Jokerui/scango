const cron = require('node-cron');
const { Promotion, Campaign, Voucher, Sequelize } = require('../../database/models');
const logger = require('../../config/logger');

/**
 * Job: Limpeza de Conteúdo Expirado
 * Executa de hora em hora (no minuto 0)
 */
const expiredContentJob = cron.schedule('0 * * * *', async () => {
  const now = new Date();
  logger.info('[CRON] Verificando conteúdos expirados (Promoções, Campanhas e Vouchers)...');

  try {
    // 1. Desativar Promoções Expiradas
    const [promoCount] = await Promotion.update(
      { status: 'expired' },
      {
        where: {
          status: 'active',
          end_date: { [Sequelize.Op.lt]: now }
        }
      }
    );

    // 2. Desativar Campanhas Expiradas
    const [campaignCount] = await Campaign.update(
      { status: 'expired' },
      {
        where: {
          status: 'active',
          end_date: { [Sequelize.Op.lt]: now }
        }
      }
    );

    // 3. Invalidar Vouchers Expirados (que nunca foram usados)
    const [voucherCount] = await Voucher.update(
      { status: 'expired' },
      {
        where: {
          status: 'active',
          expires_at: { [Sequelize.Op.lt]: now }
        }
      }
    );

    if (promoCount > 0 || campaignCount > 0 || voucherCount > 0) {
      logger.info(`[CRON] Limpeza concluída: ${promoCount} Promoções, ${campaignCount} Campanhas e ${voucherCount} Vouchers expirados.`);
    } else {
      logger.debug('[CRON] Nenhum conteúdo expirado para desativar nesta hora.');
    }

  } catch (error) {
    logger.error(`[CRON ERROR] Falha na desativação de conteúdos expirados: ${error.message}`);
  }
}, {
  scheduled: true,
  timezone: "Africa/Luanda"
});

module.exports = expiredContentJob;
