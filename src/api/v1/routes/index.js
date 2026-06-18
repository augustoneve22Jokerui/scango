const { Router } = require('express');

// Importação de todas as rotas modulares
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const partnerRoutes = require('./partner.routes');
const storeRoutes = require('./store.routes');
const productRoutes = require('./product.routes');
const qrcodeRoutes = require('./qrcode.routes');
const missionRoutes = require('./mission.routes');
const rewardRoutes = require('./reward.routes');
const walletRoutes = require('./wallet.routes');
const rankingRoutes = require('./ranking.routes');
const achievementRoutes = require('./achievement.routes');
const campaignRoutes = require('./campaign.routes');
const promotionRoutes = require('./promotion.routes');
const feedRoutes = require('./feed.routes');
const mapRoutes = require('./map.routes');
const notificationRoutes = require('./notification.routes');
const supportRoutes = require('./support.routes');
const adminRoutes = require('./admin.routes');
const analyticsRoutes = require('./analytics.routes');
const financeRoutes = require('./finance.routes');
const auditRoutes = require('./audit.routes');

const router = Router();

/**
 * Agregação de Módulos
 * Cada módulo é isolado e recebe seu próprio prefixo
 */
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/partners', partnerRoutes);
router.use('/stores', storeRoutes);
router.use('/products', productRoutes);
router.use('/qrcodes', qrcodeRoutes);
router.use('/missions', missionRoutes);
router.use('/rewards', rewardRoutes);
router.use('/wallet', walletRoutes);
router.use('/rankings', rankingRoutes);
router.use('/achievements', achievementRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/promotions', promotionRoutes);
router.use('/feed', feedRoutes);
router.use('/map', mapRoutes);
router.use('/notifications', notificationRoutes);
router.use('/support', supportRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/finance', financeRoutes);
router.use('/audit', auditRoutes);

module.exports = router;
