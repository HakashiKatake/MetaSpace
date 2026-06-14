const router = require('express').Router();
const ctrl = require('../controllers/assetController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticate);

router.get('/',            ctrl.getAll);
router.get('/stats',       ctrl.getStats);
router.get('/:id',         ctrl.getById);
router.post('/',           requireRole('manager', 'admin'), ctrl.create);
router.put('/:id',         requireRole('manager', 'admin'), ctrl.update);
router.delete('/:id',      requireRole('admin'),            ctrl.remove);

module.exports = router;
