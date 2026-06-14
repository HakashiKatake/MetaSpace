const { Alert, Asset, User } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const { status, severity, asset_id, limit = 50, page = 1 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (asset_id) where.asset_id = asset_id;

    const { count, rows } = await Alert.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['triggered_at', 'DESC']],
      include: [
        { model: Asset, attributes: ['name', 'asset_type', 'status'] },
        { model: User, as: 'resolver', attributes: ['name', 'email'] }
      ]
    });

    res.json({
      data: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) { next(err); }
};

const acknowledge = async (req, res, next) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found.' });
    }
    
    if (alert.status !== 'active') {
      return res.status(400).json({ error: `Alert is already ${alert.status}.` });
    }

    await alert.update({ status: 'acknowledged' });
    res.json({ data: alert, message: 'Alert acknowledged successfully.' });
  } catch (err) { next(err); }
};

const resolve = async (req, res, next) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found.' });
    }

    if (alert.status === 'resolved') {
      return res.status(400).json({ error: 'Alert is already resolved.' });
    }

    await alert.update({
      status: 'resolved',
      resolved_at: new Date(),
      resolved_by: req.user.id
    });
    
    res.json({ data: alert, message: 'Alert resolved successfully.' });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { asset_id, severity, type, message } = req.body;
    
    // Verify asset exists
    const asset = await Asset.findByPk(asset_id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    const alert = await Alert.create({
      asset_id,
      severity,
      type,
      message,
      status: 'active',
      triggered_at: new Date()
    });

    res.status(201).json({ data: alert, message: 'Alert triggered successfully.' });
  } catch (err) { next(err); }
};

module.exports = { getAll, acknowledge, resolve, create };
