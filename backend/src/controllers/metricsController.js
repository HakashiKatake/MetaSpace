const { Metric, Asset } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const { asset_id, limit = 50 } = req.query;
    const where = {};
    if (asset_id) where.asset_id = asset_id;

    const metrics = await Metric.findAll({
      where,
      limit: parseInt(limit),
      order: [['recorded_at', 'DESC']]
    });

    res.json({ data: metrics });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { asset_id, cpu_usage, memory_usage, network_in, network_out, uptime_pct, custom_value } = req.body;
    
    // Verify asset exists
    const asset = await Asset.findByPk(asset_id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    const metric = await Metric.create({
      asset_id,
      cpu_usage,
      memory_usage,
      network_in,
      network_out,
      uptime_pct,
      custom_value,
      recorded_at: new Date()
    });

    res.status(201).json({ data: metric, message: 'Metric point recorded successfully.' });
  } catch (err) { next(err); }
};

module.exports = { getAll, create };
