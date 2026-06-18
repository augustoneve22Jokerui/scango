const cron = require('node-cron');
const RankingService = require('../../core/services/RankingService');
const logger = require('../../config/logger');

/**
 * Job: Atualização de Rankings Diários
 * Executa todos os dias à meia-noite (00:00)
 */
const dailyRankingsJob = cron.schedule('0 0 * * *', async () => {
  const startTime = Date.now();
  logger.info('[CRON] Iniciando processamento dos rankings diários...');

  try {
    // 1. Processa o snapshot dos rankings (Nacional, Provincial, Municipal)
    // O service pode internamente persistir isso em uma tabela de cache ou Redis
    await RankingService.getGlobalRanking({ page: 1, limit: 100, period: 'daily' });

    // 2. Calcula métricas de destaque (ex: Utilizador que mais subiu no ranking)
    // Isso pode ser usado para enviar notificações de parabéns

    const duration = Date.now() - startTime;
    logger.info(`[CRON] Rankings atualizados com sucesso. Duração: ${duration}ms`);
  } catch (error) {
    logger.error(`[CRON ERROR] Falha ao processar rankings diários: ${error.message}`);
  }
}, {
  scheduled: true,
  timezone: "Africa/Luanda" // Configuração para o fuso horário local
});

module.exports = dailyRankingsJob;
