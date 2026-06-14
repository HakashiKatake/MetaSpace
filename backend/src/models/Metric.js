const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Metric = sequelize.define('Metric', {
  id:           { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  asset_id:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  cpu_usage:    { type: DataTypes.DECIMAL(5,2), allowNull: true },
  memory_usage: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  network_in:   { type: DataTypes.DECIMAL(10,2), allowNull: true },
  network_out:  { type: DataTypes.DECIMAL(10,2), allowNull: true },
  uptime_pct:   { type: DataTypes.DECIMAL(5,2), allowNull: true },
  custom_value: { type: DataTypes.DECIMAL(12,4), allowNull: true },
  recorded_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
}, {
  tableName: 'metrics',
  timestamps: false,
  underscored: true
});

module.exports = Metric;
