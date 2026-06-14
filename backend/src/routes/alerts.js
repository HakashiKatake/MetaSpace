const router = require('express').Router();
const ctrl = require('../controllers/alertController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.post('/', requireRole('operator', 'manager', 'admin'), ctrl.create);
router.put('/:id/acknowledge', requireRole('manager', 'admin'), ctrl.acknowledge);
router.put('/:id/resolve', requireRole('manager', 'admin'), ctrl.resolve);

module.exports = router;
