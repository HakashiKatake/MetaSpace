const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asset = sequelize.define('Asset', {
  id:           { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:         { type: DataTypes.STRING(150), allowNull: false },
  asset_type:   { type: DataTypes.ENUM('device','environment','virtual_object','sensor','gateway'), allowNull: false },
  status:       { type: DataTypes.ENUM('online','offline','degraded','maintenance'), defaultValue: 'offline' },
  location:     { type: DataTypes.STRING(200), allowNull: false },
  region:       { type: DataTypes.STRING(100), allowNull: false },
  ip_address:   { type: DataTypes.STRING(45), allowNull: true },
  health_score: { type: DataTypes.TINYINT.UNSIGNED, defaultValue: 100,
                  validate: { min: 0, max: 100 } },
  description:  { type: DataTypes.TEXT, allowNull: true },
  tags:         { type: DataTypes.JSON, allowNull: true },
  created_by:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, {
  tableName: 'assets',
  timestamps: true,
  underscored: true,
});

module.exports = Asset;
