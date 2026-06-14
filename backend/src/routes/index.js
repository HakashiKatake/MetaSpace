const router = require('express').Router();
const authRoutes   = require('./auth');
const assetRoutes  = require('./assets');
const metricRoutes = require('./metrics');
const alertRoutes  = require('./alerts');

router.use('/auth',    authRoutes);
router.use('/assets',  assetRoutes);
router.use('/metrics', metricRoutes);
router.use('/alerts',  alertRoutes);

module.exports = router;
