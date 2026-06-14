const { sequelize, User, Asset, Metric, Alert } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('[SEED] Connected to database to seed...');
    
    // Delete existing rows in correct order to respect constraints
    console.log('[SEED] Clearing existing records...');
    await Alert.destroy({ where: {} });
    await Metric.destroy({ where: {} });
    await Asset.destroy({ where: {} });
    await User.destroy({ where: {} });
    
    // Reset auto-increment counters by executing raw queries
    await sequelize.query('ALTER TABLE users AUTO_INCREMENT = 1;');
    await sequelize.query('ALTER TABLE assets AUTO_INCREMENT = 1;');
    await sequelize.query('ALTER TABLE metrics AUTO_INCREMENT = 1;');
    await sequelize.query('ALTER TABLE alerts AUTO_INCREMENT = 1;');

    console.log('[SEED] Creating users...');
    // Hooks will hash the password 'Admin@123' automatically
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@metaspace.io',
      password: 'Admin@123',
      role: 'admin'
    });
    
    await User.create({
      name: 'Ops Manager',
      email: 'manager@metaspace.io',
      password: 'Admin@123',
      role: 'manager'
    });
    
    await User.create({
      name: 'Field Ops',
      email: 'operator@metaspace.io',
      password: 'Admin@123',
      role: 'operator'
    });
    
    console.log('[SEED] Creating assets...');
    const asset1 = await Asset.create({
      name: 'Twin-Alpha-01',
      asset_type: 'device',
      status: 'online',
      location: 'Mumbai Data Center',
      region: 'ap-south-1',
      ip_address: '10.0.1.101',
      health_score: 97,
      description: 'Primary digital twin node for Zone A',
      created_by: admin.id
    });
    
    const asset2 = await Asset.create({
      name: 'Metaverse-Hub-01',
      asset_type: 'environment',
      status: 'online',
      location: 'Singapore Hub',
      region: 'ap-southeast-1',
      ip_address: '10.0.1.102',
      health_score: 88,
      description: 'Main metaverse environment cluster',
      created_by: admin.id
    });
    
    const asset3 = await Asset.create({
      name: 'Sensor-Grid-07',
      asset_type: 'sensor',
      status: 'degraded',
      location: 'London Operations',
      region: 'eu-west-2',
      ip_address: '10.0.1.103',
      health_score: 61,
      description: 'IoT sensor mesh for UK region',
      created_by: admin.id
    });
    
    const asset4 = await Asset.create({
      name: 'Gateway-West-03',
      asset_type: 'gateway',
      status: 'online',
      location: 'Oregon Edge Node',
      region: 'us-west-2',
      ip_address: '10.0.1.104',
      health_score: 100,
      description: 'Western US edge gateway',
      created_by: admin.id
    });
    
    const asset5 = await Asset.create({
      name: 'VObj-Rig-12',
      asset_type: 'virtual_object',
      status: 'maintenance',
      location: 'Frankfurt Compute',
      region: 'eu-central-1',
      ip_address: '10.0.1.105',
      health_score: 45,
      description: 'Virtual rendering rig under maintenance',
      created_by: admin.id
    });
    
    console.log('[SEED] Creating metrics...');
    await Metric.bulkCreate([
      { asset_id: asset1.id, cpu_usage: 42.50, memory_usage: 61.20, network_in: 245.80, network_out: 189.30, uptime_pct: 99.90 },
      { asset_id: asset1.id, cpu_usage: 55.10, memory_usage: 63.40, network_in: 301.20, network_out: 210.70, uptime_pct: 99.90 },
      { asset_id: asset1.id, cpu_usage: 38.90, memory_usage: 59.80, network_in: 220.10, network_out: 175.40, uptime_pct: 99.90 },
      { asset_id: asset2.id, cpu_usage: 71.30, memory_usage: 78.10, network_in: 820.50, network_out: 654.30, uptime_pct: 99.70 },
      { asset_id: asset3.id, cpu_usage: 89.20, memory_usage: 91.50, network_in: 120.30, network_out: 88.10, uptime_pct: 94.20 }
    ]);
    
    console.log('[SEED] Creating alerts...');
    await Alert.bulkCreate([
      { asset_id: asset3.id, severity: 'warning', type: 'cpu_spike', message: 'CPU utilization exceeded 85% threshold on Sensor-Grid-07', status: 'active' },
      { asset_id: asset5.id, severity: 'critical', type: 'offline', message: 'VObj-Rig-12 entered maintenance mode unexpectedly', status: 'active' },
      { asset_id: asset2.id, severity: 'info', type: 'low_memory', message: 'Memory usage at 78% on Metaverse-Hub-01', status: 'acknowledged' }
    ]);
    
    console.log('[SEED] Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[SEED] Seeding failed:', err.message, err.stack);
    process.exit(1);
  }
}

// Ensure database config loads correctly
if (require.main === module) {
  require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
  seed();
}
