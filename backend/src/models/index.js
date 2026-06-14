const sequelize = require('../config/database');
const User = require('./User');
const Asset = require('./Asset');
const Metric = require('./Metric');
const Alert = require('./Alert');

// Relationships

// User <-> Asset
User.hasMany(Asset, { foreignKey: 'created_by', onDelete: 'RESTRICT' });
Asset.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Asset <-> Metric
Asset.hasMany(Metric, { foreignKey: 'asset_id', onDelete: 'CASCADE' });
Metric.belongsTo(Asset, { foreignKey: 'asset_id' });

// Asset <-> Alert
Asset.hasMany(Alert, { foreignKey: 'asset_id', onDelete: 'CASCADE' });
Alert.belongsTo(Asset, { foreignKey: 'asset_id' });

// User <-> Alert (Resolver relationship)
User.hasMany(Alert, { foreignKey: 'resolved_by', onDelete: 'SET NULL' });
Alert.belongsTo(User, { foreignKey: 'resolved_by', as: 'resolver' });

module.exports = {
  sequelize,
  User,
  Asset,
  Metric,
  Alert
};
