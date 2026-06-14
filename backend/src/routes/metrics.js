const router = require('express').Router();
const ctrl = require('../controllers/metricsController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.post('/', requireRole('operator', 'manager', 'admin'), ctrl.create);

module.exports = router;
