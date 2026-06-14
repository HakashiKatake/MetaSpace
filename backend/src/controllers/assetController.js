const { Asset, Metric, Alert } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res, next) => {
  try {
    const { status, type, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.asset_type = type;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const { count, rows } = await Asset.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    res.json({
      data: rows,
      meta: { total: count, page: parseInt(page), limit: parseInt(limit),
               pages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: Metric, limit: 10, order: [['recorded_at', 'DESC']] },
        { model: Alert, where: { status: 'active' }, required: false },
      ],
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });
    res.json({ data: asset });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const asset = await Asset.create({ ...req.body, created_by: req.user.id });
    res.status(201).json({ data: asset, message: 'Asset created successfully.' });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });
    await asset.update(req.body);
    res.json({ data: asset, message: 'Asset updated successfully.' });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });
    await asset.destroy();
    res.json({ message: 'Asset deleted successfully.' });
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const [total, online, offline, degraded, maintenance] = await Promise.all([
      Asset.count(),
      Asset.count({ where: { status: 'online' } }),
      Asset.count({ where: { status: 'offline' } }),
      Asset.count({ where: { status: 'degraded' } }),
      Asset.count({ where: { status: 'maintenance' } }),
    ]);
    const avgHealth = await Asset.findOne({
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('health_score')), 'avg']],
      raw: true,
    });
    res.json({ data: { total, online, offline, degraded, maintenance,
      avg_health: parseFloat(avgHealth.avg || 0).toFixed(1) } });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove, getStats };
