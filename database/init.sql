-- Create and select database
CREATE DATABASE IF NOT EXISTS metaspace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE metaspace_db;

-- Drop existing tables to make the script rerun-safe
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS metrics;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('admin','manager','operator') NOT NULL DEFAULT 'operator',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  last_login  DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
);

-- =============================================
-- ASSETS TABLE (Digital Twin Registry)
-- =============================================
CREATE TABLE IF NOT EXISTS assets (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)  NOT NULL,
  asset_type    ENUM('device','environment','virtual_object','sensor','gateway') NOT NULL,
  status        ENUM('online','offline','degraded','maintenance') NOT NULL DEFAULT 'offline',
  location      VARCHAR(200)  NOT NULL,
  region        VARCHAR(100)  NOT NULL,
  ip_address    VARCHAR(45)   NULL,
  health_score  TINYINT UNSIGNED NOT NULL DEFAULT 100 COMMENT '0-100',
  description   TEXT          NULL,
  tags          JSON          NULL,
  created_by    INT UNSIGNED  NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_status      (status),
  INDEX idx_asset_type  (asset_type),
  INDEX idx_region      (region)
);

-- =============================================
-- METRICS TABLE (Time-series operational data)
-- =============================================
CREATE TABLE IF NOT EXISTS metrics (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_id      INT UNSIGNED NOT NULL,
  cpu_usage     DECIMAL(5,2) NULL COMMENT 'Percentage 0.00–100.00',
  memory_usage  DECIMAL(5,2) NULL,
  network_in    DECIMAL(10,2) NULL COMMENT 'KB/s',
  network_out   DECIMAL(10,2) NULL COMMENT 'KB/s',
  uptime_pct    DECIMAL(5,2) NULL COMMENT 'Percentage',
  custom_value  DECIMAL(12,4) NULL,
  recorded_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  INDEX idx_asset_recorded (asset_id, recorded_at),
  INDEX idx_recorded_at    (recorded_at)
);

-- =============================================
-- ALERTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS alerts (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_id      INT UNSIGNED NOT NULL,
  severity      ENUM('critical','warning','info') NOT NULL,
  type          VARCHAR(100) NOT NULL COMMENT 'e.g. cpu_spike, offline, low_memory',
  message       TEXT NOT NULL,
  status        ENUM('active','acknowledged','resolved') NOT NULL DEFAULT 'active',
  triggered_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at   DATETIME NULL,
  resolved_by   INT UNSIGNED NULL,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id),
  INDEX idx_severity   (severity),
  INDEX idx_status     (status),
  INDEX idx_triggered  (triggered_at)
);

-- =============================================
-- SEED DATA
-- =============================================

-- Default admin user (password: Admin@123)
-- bcrypt hash of 'Admin@123' with salt rounds 12
INSERT INTO users (name, email, password, role) VALUES
  ('Admin User',   'admin@metaspace.io',    '$2a$12$sBd3cg3CE7oAFEw0Jpvzw.5L2kwo/uA.9DtaO1kZbDvLFnUiVln5W', 'admin'),
  ('Ops Manager',  'manager@metaspace.io',  '$2a$12$sBd3cg3CE7oAFEw0Jpvzw.5L2kwo/uA.9DtaO1kZbDvLFnUiVln5W', 'manager'),
  ('Field Ops',    'operator@metaspace.io', '$2a$12$sBd3cg3CE7oAFEw0Jpvzw.5L2kwo/uA.9DtaO1kZbDvLFnUiVln5W', 'operator');

-- Sample assets
INSERT INTO assets (name, asset_type, status, location, region, ip_address, health_score, description, created_by) VALUES
  ('Twin-Alpha-01',   'device',         'online',      'Mumbai Data Center',    'ap-south-1',  '10.0.1.101', 97,  'Primary digital twin node for Zone A', 1),
  ('Metaverse-Hub-01','environment',    'online',      'Singapore Hub',         'ap-southeast-1','10.0.1.102',88, 'Main metaverse environment cluster', 1),
  ('Sensor-Grid-07',  'sensor',         'degraded',    'London Operations',     'eu-west-2',   '10.0.1.103', 61,  'IoT sensor mesh for UK region', 1),
  ('Gateway-West-03', 'gateway',        'online',      'Oregon Edge Node',      'us-west-2',   '10.0.1.104', 100, 'Western US edge gateway', 1),
  ('VObj-Rig-12',     'virtual_object', 'maintenance', 'Frankfurt Compute',     'eu-central-1','10.0.1.105', 45,  'Virtual rendering rig under maintenance', 1);

-- Sample metrics for assets
INSERT INTO metrics (asset_id, cpu_usage, memory_usage, network_in, network_out, uptime_pct) VALUES
  (1, 42.5, 61.2, 245.8, 189.3, 99.9),
  (1, 55.1, 63.4, 301.2, 210.7, 99.9),
  (1, 38.9, 59.8, 220.1, 175.4, 99.9),
  (2, 71.3, 78.1, 820.5, 654.3, 99.7),
  (3, 89.2, 91.5, 120.3,  88.1, 94.2);

-- Sample alerts
INSERT INTO alerts (asset_id, severity, type, message, status) VALUES
  (3, 'warning',  'cpu_spike',   'CPU utilization exceeded 85% threshold on Sensor-Grid-07', 'active'),
  (5, 'critical', 'offline',     'VObj-Rig-12 entered maintenance mode unexpectedly',         'active'),
  (2, 'info',     'low_memory',  'Memory usage at 78% on Metaverse-Hub-01',                  'acknowledged');
