const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define('Alert', {
  id:           { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  asset_id:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  severity:     { type: DataTypes.ENUM('critical', 'warning', 'info'), allowNull: false },
  type:         { type: DataTypes.STRING(100), allowNull: false },
  message:      { type: DataTypes.TEXT, allowNull: false },
  status:       { type: DataTypes.ENUM('active', 'acknowledged', 'resolved'), defaultValue: 'active' },
  triggered_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
  resolved_at:  { type: DataTypes.DATE, allowNull: true },
  resolved_by:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
}, {
  tableName: 'alerts',
  timestamps: false,
  underscored: true
});

module.exports = Alert;
