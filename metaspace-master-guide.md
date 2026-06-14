# MetaSpace Digital Twin Operations Cloud
## Master Implementation Guide — Case Study 145
**B.Tech CSE 2024–2028 | Semester IV | AWS Case Study**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack & Versions](#2-technology-stack--versions)
3. [Architecture Design](#3-architecture-design)
4. [Project Structure](#4-project-structure)
5. [Local Development Setup (macOS)](#5-local-development-setup-macos)
6. [Database Design](#6-database-design)
7. [Backend — Node.js + Express API](#7-backend--nodejs--express-api)
8. [Frontend — Vite + React Dashboard](#8-frontend--vite--react-dashboard)
9. [Docker & Docker Compose](#9-docker--docker-compose)
10. [Linux Administration on EC2](#10-linux-administration-on-ec2)
11. [AWS Infrastructure — Terraform IaC](#11-aws-infrastructure--terraform-iac)
12. [AWS Services Configuration](#12-aws-services-configuration)
13. [CloudWatch Monitoring & Alarms](#13-cloudwatch-monitoring--alarms)
14. [Automation Shell Scripts](#14-automation-shell-scripts)
15. [Security — IAM, VPC, Security Groups](#15-security--iam-vpc-security-groups)
16. [Cost Estimation](#16-cost-estimation)
17. [Deployment Workflow](#17-deployment-workflow)
18. [Architecture Diagram (Text)](#18-architecture-diagram-text)

---

## 1. Project Overview

**MetaSpace Digital Twin Operations Cloud** is a centralized cloud platform for managing Digital Twin assets and Metaverse Infrastructure operations.

### What We Are Building

A full-stack **Digital Twin Operations Dashboard** with:

- **Asset Registry** — CRUD for digital twin assets (devices, environments, virtual objects)
- **Real-time KPI Dashboard** — CPU/memory/network metrics, asset health scores, uptime
- **Role-Based Access Control** — Admin, Manager, Operator roles with JWT auth
- **Reporting & Analytics** — Chart.js visualizations for operational trends
- **Alert System** — Threshold-based alerts for asset anomalies
- **Deployed on AWS** — EC2 + RDS + S3 + VPC + CloudWatch + IAM
- **Containerized** — Docker Compose (frontend + backend + database)
- **IaC** — Terraform for all AWS resource provisioning

---

## 2. Technology Stack & Versions

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| Vite | `^6.x` (latest) | Build tool |
| React | `^19.x` | UI framework |
| React Router DOM | `^7.x` | Client-side routing |
| Chart.js | `^4.x` | Data visualization |
| react-chartjs-2 | `^5.x` | React wrapper for Chart.js |
| Axios | `^1.x` | HTTP client |
| Lucide React | `^0.4x` | Icons |

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Node.js | `v22 LTS` | Runtime |
| Express.js | `^5.x` | Web framework |
| Sequelize | `^6.x` (stable) | ORM |
| mysql2 | `^3.x` | MySQL driver |
| jsonwebtoken | `^9.x` | JWT auth |
| bcryptjs | `^2.x` | Password hashing |
| dotenv | `^16.x` | Env management |
| cors | `^2.x` | CORS middleware |
| helmet | `^7.x` | HTTP security headers |
| express-rate-limit | `^7.x` | Rate limiting |
| morgan | `^1.x` | HTTP request logger |
| joi | `^17.x` | Input validation |

### Database
| Tool | Version | Purpose |
|------|---------|---------|
| MySQL | `8.0` | Database engine |
| AWS RDS MySQL | `8.0.x` | Production database |
| Local MySQL | `8.0` (via Docker) | Development database |

### DevOps & Infrastructure
| Tool | Version | Purpose |
|------|---------|---------|
| Docker | `^27.x` | Containerization |
| Docker Compose | `v2.x` | Multi-container orchestration |
| Terraform | `^1.9.x` | Infrastructure as Code |
| AWS CLI | `v2` | AWS management |
| Nginx | `1.26 (Alpine)` | Frontend reverse proxy |

---

## 3. Architecture Design

### Overview
```
Internet
    │
    ▼
[AWS Internet Gateway]
    │
    ▼
[Public Subnet — 10.0.1.0/24]
    │
    ├── EC2 Instance (t3.micro)
    │     ├── Nginx (port 80/443) ──► React Frontend (Docker)
    │     ├── Node.js API (port 5000) ──► Express Backend (Docker)
    │     └── CloudWatch Agent
    │
    ▼
[Private Subnet — 10.0.2.0/24]
    │
    └── RDS MySQL (db.t3.micro) — NOT publicly accessible
    
[AWS S3 Bucket]
    └── Static assets, logs, DB backups

[AWS CloudWatch]
    └── Metrics, Alarms, Dashboards, Logs

[AWS IAM]
    └── EC2 Role, Users (Admin/Dev/ReadOnly)
```

### Network Design
```
VPC: 10.0.0.0/16
  ├── Public Subnet A:  10.0.1.0/24  (us-east-1a)  — EC2
  ├── Public Subnet B:  10.0.2.0/24  (us-east-1b)  — (HA reserve)
  ├── Private Subnet A: 10.0.3.0/24  (us-east-1a)  — RDS primary
  └── Private Subnet B: 10.0.4.0/24  (us-east-1b)  — RDS subnet group (required by RDS)
```

### Request Flow
```
Browser → Nginx (80) → React SPA (static files)
Browser → Nginx (/api) → Node.js Express (5000) → Sequelize ORM → RDS MySQL
```

---

## 4. Project Structure

```
metaspace-cloud/
├── frontend/                          # Vite + React
│   ├── public/
│   ├── src/
│   │   ├── assets/                    # Static files
│   │   ├── components/                # Reusable UI components
│   │   │   ├── ui/                    # Base components (Button, Card, Badge, etc.)
│   │   │   ├── charts/                # Chart.js wrappers
│   │   │   ├── layout/                # Sidebar, Topbar, Layout
│   │   │   └── alerts/                # Alert panels
│   │   ├── pages/                     # Route-level page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Assets.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Alerts.jsx
│   │   │   └── Settings.jsx
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useAssets.js
│   │   │   └── useMetrics.js
│   │   ├── services/                  # API call layer
│   │   │   ├── api.js                 # Axios instance + interceptors
│   │   │   ├── authService.js
│   │   │   ├── assetService.js
│   │   │   └── metricsService.js
│   │   ├── context/                   # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── utils/                     # Helper functions
│   │   │   ├── formatters.js
│   │   │   └── constants.js
│   │   ├── styles/                    # Global CSS
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.development
│   └── vite.config.js
│
├── backend/                           # Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js            # Sequelize instance
│   │   │   └── app.js                 # Express app setup
│   │   ├── models/                    # Sequelize models
│   │   │   ├── index.js
│   │   │   ├── User.js
│   │   │   ├── Asset.js
│   │   │   ├── Metric.js
│   │   │   └── Alert.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── assetController.js
│   │   │   ├── metricsController.js
│   │   │   └── alertController.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── auth.js
│   │   │   ├── assets.js
│   │   │   ├── metrics.js
│   │   │   └── alerts.js
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT verification
│   │   │   ├── rbac.js                # Role-based access
│   │   │   ├── validate.js            # Joi validation
│   │   │   └── errorHandler.js        # Global error handler
│   │   └── utils/
│   │       ├── logger.js
│   │       └── seedData.js
│   ├── server.js                      # Entry point
│   ├── Dockerfile
│   ├── .env.development
│   └── package.json
│
├── terraform/                         # IaC
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── provider.tf
│   └── modules/
│       ├── vpc/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       ├── ec2/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       ├── rds/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       └── s3/
│           ├── main.tf
│           └── variables.tf
│
├── scripts/                           # Automation shell scripts
│   ├── deploy.sh                      # Full deployment script
│   ├── backup.sh                      # MySQL backup to S3
│   ├── health-check.sh                # App health monitoring
│   ├── user-management.sh             # Linux user management
│   └── server-setup.sh                # EC2 initial setup
│
├── database/
│   └── init.sql                       # DB schema + seed
│
├── docker-compose.yml                 # Dev environment
├── docker-compose.prod.yml            # Production overrides
└── README.md
```

---

## 5. Local Development Setup (macOS)

### Prerequisites

```bash
# Install Homebrew (if not already)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js v22 LTS
brew install node@22
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
node --version  # Should print v22.x.x

# Install Docker Desktop for macOS
# Download from: https://www.docker.com/products/docker-desktop/
# After install, verify:
docker --version         # Docker version 27.x+
docker compose version   # Docker Compose version v2.x

# Install AWS CLI v2
brew install awscli
aws --version  # aws-cli/2.x.x

# Install Terraform
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
terraform --version  # Terraform v1.9.x+
```

### Step 1 — Clone & Initialize Project

```bash
mkdir metaspace-cloud && cd metaspace-cloud

# Initialize frontend
npm create vite@latest frontend -- --template react
cd frontend && npm install

# Install frontend dependencies
npm install react-router-dom axios chart.js react-chartjs-2 lucide-react

cd ..

# Initialize backend
mkdir backend && cd backend
npm init -y

# Install backend dependencies
npm install express sequelize mysql2 jsonwebtoken bcryptjs dotenv cors helmet \
  express-rate-limit morgan joi

# Install dev dependencies
npm install -D nodemon

cd ..
```

### Step 2 — Environment Files

**`backend/.env.development`**
```env
# Server
NODE_ENV=development
PORT=5000

# Database (local Docker MySQL)
DB_HOST=mysql
DB_PORT=3306
DB_NAME=metaspace_db
DB_USER=metaspace_user
DB_PASS=dev_password_123

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h

# AWS (for S3 uploads from backend)
AWS_REGION=us-east-1
AWS_BUCKET_NAME=metaspace-assets-bucket
```

**`frontend/.env.development`**
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=MetaSpace Cloud
```

### Step 3 — Start Local Dev Environment

```bash
# From project root
docker compose up -d

# Check all services running
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

---

## 6. Database Design

### Schema — `database/init.sql`

```sql
-- Create and select database
CREATE DATABASE IF NOT EXISTS metaspace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE metaspace_db;

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
  ('Admin User',   'admin@metaspace.io',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGOu/gIjOLJLXwkIAKzv2Lhp8h6', 'admin'),
  ('Ops Manager',  'manager@metaspace.io',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGOu/gIjOLJLXwkIAKzv2Lhp8h6', 'manager'),
  ('Field Ops',    'operator@metaspace.io', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGOu/gIjOLJLXwkIAKzv2Lhp8h6', 'operator');

-- Sample assets
INSERT INTO assets (name, asset_type, status, location, region, ip_address, health_score, description, created_by) VALUES
  ('Twin-Alpha-01',   'device',         'online',      'Mumbai Data Center',    'ap-south-1',  '10.0.1.101', 97,  'Primary digital twin node for Zone A', 1),
  ('Metaverse-Hub-01','environment',    'online',      'Singapore Hub',         'ap-southeast-1','10.0.1.102',88, 'Main metaverse environment cluster', 1),
  ('Sensor-Grid-07',  'sensor',         'degraded',    'London Operations',     'eu-west-2',   '10.0.1.103', 61,  'IoT sensor mesh for UK region', 1),
  ('Gateway-West-03', 'gateway',        'online',      'Oregon Edge Node',      'us-west-2',   '10.0.1.104', 100, 'Western US edge gateway', 1),
  ('VObj-Rig-12',     'virtual_object', 'maintenance', 'Frankfurt Compute',     'eu-central-1','10.0.1.105', 45,  'Virtual rendering rig under maintenance', 1);

-- Sample metrics for asset 1
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
```

---

## 7. Backend — Node.js + Express API

### Entry Point — `backend/server.js`

```javascript
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const app = require('./src/config/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('[DB] Connected to MySQL successfully.');

    // In development only — syncs schema (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('[DB] Schema synchronized.');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[SERVER] MetaSpace API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (err) {
    console.error('[SERVER] Failed to start:', err.message);
    process.exit(1);
  }
}

startServer();
```

### App Configuration — `backend/src/config/app.js`

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('../routes');
const errorHandler = require('../middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting — 100 requests per 15 minutes per IP
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan('combined'));

// Health check (no auth needed)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'metaspace-api' });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
```

### Database Config — `backend/src/config/database.js`

```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max:     10,
      min:     0,
      acquire: 30000,
      idle:    10000,
    },
    dialectOptions: {
      // Required for AWS RDS SSL in production
      ...(process.env.NODE_ENV === 'production' && {
        ssl: { rejectUnauthorized: true },
      }),
    },
  }
);

module.exports = sequelize;
```

### Models — `backend/src/models/User.js`

```javascript
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id:         { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:       { type: DataTypes.STRING(100), allowNull: false },
  email:      { type: DataTypes.STRING(150), allowNull: false, unique: true,
                validate: { isEmail: true } },
  password:   { type: DataTypes.STRING(255), allowNull: false },
  role:       { type: DataTypes.ENUM('admin', 'manager', 'operator'), defaultValue: 'operator' },
  is_active:  { type: DataTypes.BOOLEAN, defaultValue: true },
  last_login: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

User.prototype.validatePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = User;
```

### Models — `backend/src/models/Asset.js`

```javascript
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
```

### Auth Middleware — `backend/src/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid or deactivated account.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = { authenticate };
```

### RBAC Middleware — `backend/src/middleware/rbac.js`

```javascript
const ROLE_HIERARCHY = { admin: 3, manager: 2, operator: 1 };

const requireRole = (...roles) => (req, res, next) => {
  const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
  const requiredLevel = Math.min(...roles.map(r => ROLE_HIERARCHY[r] || 99));
  if (userLevel < requiredLevel) {
    return res.status(403).json({ error: 'Insufficient permissions.' });
  }
  next();
};

module.exports = { requireRole };
```

### Auth Controller — `backend/src/controllers/authController.js`

```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email, is_active: true } });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    await user.update({ last_login: new Date() });

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, me };
```

### Asset Controller — `backend/src/controllers/assetController.js`

```javascript
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
    const [total, online, offline, degraded] = await Promise.all([
      Asset.count(),
      Asset.count({ where: { status: 'online' } }),
      Asset.count({ where: { status: 'offline' } }),
      Asset.count({ where: { status: 'degraded' } }),
    ]);
    const avgHealth = await Asset.findOne({
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('health_score')), 'avg']],
      raw: true,
    });
    res.json({ data: { total, online, offline, degraded,
      avg_health: parseFloat(avgHealth.avg || 0).toFixed(1) } });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove, getStats };
```

### Routes — `backend/src/routes/index.js`

```javascript
const router = require('express').Router();
const authRoutes   = require('./auth');
const assetRoutes  = require('./assets');
const metricRoutes = require('./metrics');
const alertRoutes  = require('./alerts');

router.use('/auth',    authRoutes);
router.use('/assets',  assetRoutes);
router.use('/metrics', metricRoutes);
router.use('/alerts',  alertRoutes);

module.exports = router;
```

### Routes — `backend/src/routes/assets.js`

```javascript
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
```

### Error Handler — `backend/src/middleware/errorHandler.js`

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message, err.stack);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Validation failed.',
      details: err.errors?.map(e => e.message),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
};

module.exports = errorHandler;
```

### `backend/package.json` scripts

```json
{
  "scripts": {
    "start":   "NODE_ENV=production node server.js",
    "dev":     "NODE_ENV=development nodemon server.js",
    "seed":    "node src/utils/seedData.js"
  }
}
```

---

## 8. Frontend — Vite + React Dashboard

### Design System Tokens — `frontend/src/styles/globals.css`

```css
/* ==========================================
   MetaSpace Design System — Dark Theme
   Clean, professional, data-dense
   ========================================== */
:root {
  /* Background layers */
  --bg-base:       #0d0f14;   /* Page base */
  --bg-surface:    #141720;   /* Cards */
  --bg-elevated:   #1c2030;   /* Dropdowns, modals */
  --bg-border:     #252b3b;   /* Dividers, borders */

  /* Primary accent — cyan-blue */
  --accent-primary:   #3b82f6;
  --accent-primary-dim: #1d4ed8;
  --accent-hover:     #60a5fa;

  /* Status colors */
  --status-online:    #22c55e;
  --status-offline:   #6b7280;
  --status-degraded:  #f59e0b;
  --status-maint:     #8b5cf6;
  --status-critical:  #ef4444;

  /* Text */
  --text-primary:     #f1f5f9;
  --text-secondary:   #94a3b8;
  --text-muted:       #475569;

  /* Chart palette */
  --chart-1: #3b82f6;
  --chart-2: #22c55e;
  --chart-3: #f59e0b;
  --chart-4: #8b5cf6;
  --chart-5: #ef4444;

  /* Typography */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Sizing */
  --sidebar-width:  240px;
  --topbar-height:  60px;
  --radius-sm:      6px;
  --radius-md:      10px;
  --radius-lg:      14px;

  /* Shadows */
  --shadow-card:    0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
  --shadow-elevated:0 4px 6px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4);

  /* Transitions */
  --transition-fast:  120ms ease;
  --transition-base:  200ms ease;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 14px; -webkit-font-smoothing: antialiased; }

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-sans);
  line-height: 1.5;
  overflow: hidden;
}

/* Scrollbars */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-surface); }
::-webkit-scrollbar-thumb { background: var(--bg-border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* Number/metric font */
.mono { font-family: var(--font-mono); }
```

### `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
});
```

### Auth Context — `frontend/src/context/AuthContext.jsx`

```jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ms_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    const { token, user: userData } = await authService.login(email, password);
    localStorage.setItem('ms_token', token);
    localStorage.setItem('ms_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ms_token');
    localStorage.removeItem('ms_user');
    setUser(null);
  }, []);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
```

### API Service — `frontend/src/services/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ms_token');
      localStorage.removeItem('ms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

### Main App — `frontend/src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Assets from '@/pages/Assets';
import Analytics from '@/pages/Analytics';
import Alerts from '@/pages/Alerts';
import Settings from '@/pages/Settings';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index         element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assets"    element={<Assets />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="alerts"    element={<Alerts />} />
            <Route path="settings"  element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### Layout — `frontend/src/components/layout/Layout.jsx`

```jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg-base)',
      overflow: 'hidden',
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--bg-base)',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### Sidebar — `frontend/src/components/layout/Sidebar.jsx`

```jsx
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, BarChart2,
  Bell, Settings, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/assets',    label: 'Assets',     icon: Cpu },
  { to: '/analytics', label: 'Analytics',  icon: BarChart2 },
  { to: '/alerts',    label: 'Alerts',     icon: Bell },
  { to: '/settings',  label: 'Settings',   icon: Settings },
];

export default function Sidebar() {
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--bg-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        height: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid var(--bg-border)',
        gap: 10,
      }}>
        <Zap size={20} color="var(--accent-primary)" />
        <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.03em' }}>
          MetaSpace<span style={{ color: 'var(--accent-primary)' }}>Cloud</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 2,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-elevated)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: 'all var(--transition-fast)',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--bg-border)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
      }}>
        MetaSpace v1.0 · Case 145
      </div>
    </aside>
  );
}
```

### KPI Card Component — `frontend/src/components/ui/KpiCard.jsx`

```jsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({ label, value, unit = '', trend, trendValue, icon: Icon, accentColor }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--status-online)' : trend === 'down' ? 'var(--status-critical)' : 'var(--text-muted)';

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color var(--transition-base)',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bg-border)'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${accentColor || 'var(--accent-primary)'}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={16} color={accentColor || 'var(--accent-primary)'} />
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: '1.85rem', fontWeight: 700, lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{unit}</span>}
      </div>

      {/* Trend */}
      {trendValue !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <TrendIcon size={12} color={trendColor} />
          <span style={{ fontSize: '0.75rem', color: trendColor }}>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
```

### Dashboard Page — `frontend/src/pages/Dashboard.jsx`

```jsx
import { useEffect, useState } from 'react';
import { Cpu, Wifi, AlertTriangle, Activity } from 'lucide-react';
import KpiCard from '@/components/ui/KpiCard';
import AssetStatusChart from '@/components/charts/AssetStatusChart';
import MetricsLineChart from '@/components/charts/MetricsLineChart';
import AlertsList from '@/components/alerts/AlertsList';
import api from '@/services/api';

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          api.get('/assets/stats'),
          api.get('/alerts?status=active&limit=5'),
        ]);
        setStats(statsRes.data.data);
        setAlerts(alertsRes.data.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 2 }}>
          Operations Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Digital Twin Infrastructure · Real-time status
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard
          label="Total Assets"
          value={stats?.total ?? '—'}
          icon={Cpu}
          accentColor="var(--accent-primary)"
          trend="up"
          trendValue="+3 this week"
        />
        <KpiCard
          label="Online"
          value={stats?.online ?? '—'}
          icon={Wifi}
          accentColor="var(--status-online)"
          trend="up"
          trendValue="98.2% uptime"
        />
        <KpiCard
          label="Active Alerts"
          value={alerts.length}
          icon={AlertTriangle}
          accentColor="var(--status-critical)"
          trend={alerts.length > 3 ? 'up' : 'down'}
          trendValue={alerts.length > 0 ? `${alerts.filter(a=>a.severity==='critical').length} critical` : 'All clear'}
        />
        <KpiCard
          label="Avg Health"
          value={stats?.avg_health ?? '—'}
          unit="%"
          icon={Activity}
          accentColor="var(--status-degraded)"
          trend={stats?.avg_health > 80 ? 'up' : 'down'}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <AssetStatusChart stats={stats} />
        <MetricsLineChart />
      </div>

      {/* Alerts panel */}
      <AlertsList alerts={alerts} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ height: 40, background: 'var(--bg-surface)', borderRadius: 8, width: 200 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 110, background: 'var(--bg-surface)', borderRadius: 10,
            animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    </div>
  );
}
```

### Status Chart — `frontend/src/components/charts/AssetStatusChart.jsx`

```jsx
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AssetStatusChart({ stats }) {
  const data = {
    labels: ['Online', 'Offline', 'Degraded'],
    datasets: [{
      data: [stats?.online ?? 0, stats?.offline ?? 0, stats?.degraded ?? 0],
      backgroundColor: [
        getComputedStyle(document.documentElement).getPropertyValue('--status-online').trim() || '#22c55e',
        '#374151',
        getComputedStyle(document.documentElement).getPropertyValue('--status-degraded').trim() || '#f59e0b',
      ],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const options = {
    responsive: true,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { size: 12 }, padding: 16, boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: '#1c2030',
        borderColor: '#252b3b',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
      },
    },
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
    }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Asset Status Distribution
      </h3>
      <Doughnut data={data} options={options} />
    </div>
  );
}
```

### `frontend/nginx.conf` (serves built React app + proxies API)

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 256;

    # React SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass         http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Health check endpoint passthrough
    location /health {
        proxy_pass http://backend:5000/health;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 9. Docker & Docker Compose

### `frontend/Dockerfile`

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.26-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### `backend/Dockerfile`

```dockerfile
FROM node:22-alpine
WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
```

### `docker-compose.yml` (Development)

```yaml
version: '3.9'

services:
  # ─── MySQL Database ───────────────────────
  mysql:
    image: mysql:8.0
    container_name: metaspace-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root_dev_password
      MYSQL_DATABASE:      metaspace_db
      MYSQL_USER:          metaspace_user
      MYSQL_PASSWORD:      dev_password_123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-proot_dev_password"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - metaspace-net

  # ─── Node.js Backend ──────────────────────
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: metaspace-backend
    restart: unless-stopped
    env_file:
      - ./backend/.env.development
    environment:
      NODE_ENV: development
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      mysql:
        condition: service_healthy
    command: ["npx", "nodemon", "server.js"]
    networks:
      - metaspace-net

  # ─── React Frontend ───────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: metaspace-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - metaspace-net

volumes:
  mysql_data:
    driver: local

networks:
  metaspace-net:
    driver: bridge
```

### `docker-compose.prod.yml` (Production overrides — deployed on EC2)

```yaml
version: '3.9'

services:
  # No local MySQL in production — uses AWS RDS
  backend:
    image: metaspace-backend:latest
    restart: always
    environment:
      NODE_ENV: production
      DB_HOST: ${RDS_ENDPOINT}
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASS: ${DB_PASS}
      JWT_SECRET: ${JWT_SECRET}
    # No volume mounts in production

  frontend:
    image: metaspace-frontend:latest
    restart: always
    ports:
      - "80:80"
      - "443:443"

networks:
  metaspace-net:
    driver: bridge
```

---

## 10. Linux Administration on EC2

### Initial Server Setup — `scripts/server-setup.sh`

```bash
#!/bin/bash
# MetaSpace EC2 Initial Setup Script
# Run as: sudo bash server-setup.sh
# OS: Amazon Linux 2023 / Ubuntu 22.04

set -euo pipefail

echo "============================================"
echo " MetaSpace Cloud — EC2 Setup Script"
echo "============================================"

# ── 1. System Update ─────────────────────────
echo "[1/8] Updating system packages..."
apt-get update -y && apt-get upgrade -y

# ── 2. Install core packages ─────────────────
echo "[2/8] Installing dependencies..."
apt-get install -y \
  curl wget git unzip htop \
  awscli jq tree \
  nginx certbot python3-certbot-nginx

# ── 3. Install Docker ─────────────────────────
echo "[3/8] Installing Docker..."
curl -fsSL https://get.docker.com | bash
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# ── 4. Install Docker Compose ─────────────────
echo "[4/8] Installing Docker Compose..."
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# ── 5. User Management ────────────────────────
echo "[5/8] Creating application users..."

# App user (no login, for running services)
useradd -r -s /sbin/nologin -m -d /opt/metaspace metaspace-app || true

# Dev user (team member access)
useradd -m -s /bin/bash devops-user || true
usermod -aG sudo devops-user
usermod -aG docker devops-user

# Monitoring-only user (read-only)
useradd -m -s /bin/bash monitor-user || true

echo "[5/8] Setting file permissions..."
# App directory
mkdir -p /opt/metaspace
chown -R metaspace-app:metaspace-app /opt/metaspace
chmod 750 /opt/metaspace

# Log directory
mkdir -p /var/log/metaspace
chown -R metaspace-app:metaspace-app /var/log/metaspace
chmod 755 /var/log/metaspace

# ── 6. Install CloudWatch Agent ───────────────
echo "[6/8] Installing CloudWatch Agent..."
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb

# ── 7. Service Management ─────────────────────
echo "[7/8] Enabling services..."
systemctl enable nginx
systemctl start nginx

# ── 8. Security hardening ─────────────────────
echo "[8/8] Applying security settings..."

# SSH: disable root login, disable password auth
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/'      /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Firewall (ufw)
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "✅ EC2 setup complete!"
echo "   Reboot recommended: sudo reboot"
```

### User Management Reference

```bash
# ── List all users ──────────────────────────────────────
cat /etc/passwd | grep -v nologin | grep -v false

# ── Add a new team member ───────────────────────────────
sudo useradd -m -s /bin/bash alice
sudo passwd alice
sudo usermod -aG sudo alice       # Give sudo access
sudo usermod -aG docker alice     # Docker group

# ── Lock/unlock a user ──────────────────────────────────
sudo usermod -L alice   # Lock
sudo usermod -U alice   # Unlock

# ── Set password policy (expire in 90 days) ─────────────
sudo chage -M 90 alice

# ── File permissions ────────────────────────────────────
# App directory: owner=app, group=dev, others=none
chmod 750  /opt/metaspace
chown metaspace-app:developers /opt/metaspace

# Logs: readable by monitor user
chmod 755  /var/log/metaspace

# ── Process management ──────────────────────────────────
# Check running services
systemctl status docker nginx

# Check app containers
docker compose ps

# Check system resources
htop
df -h    # Disk
free -h  # Memory
```

### Cron Jobs Setup (on EC2)

```bash
# Edit crontab for root
sudo crontab -e

# Add these cron entries:
# ┌─── minute (0-59)
# │ ┌─── hour (0-23)
# │ │ ┌─── day of month (1-31)
# │ │ │ ┌─── month (1-12)
# │ │ │ │ ┌─── day of week (0-6, 0=Sun)
# │ │ │ │ │
# │ │ │ │ │
  0  2 * * * /opt/metaspace/scripts/backup.sh >> /var/log/metaspace/backup.log 2>&1
  */5 * * * * /opt/metaspace/scripts/health-check.sh >> /var/log/metaspace/health.log 2>&1
  0  0 * * 0 /opt/metaspace/scripts/log-rotate.sh >> /var/log/metaspace/rotate.log 2>&1

# Verify cron is running
systemctl status cron
crontab -l
```

---

## 11. AWS Infrastructure — Terraform IaC

### `terraform/provider.tf`

```hcl
terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "MetaSpace"
      Environment = var.environment
      ManagedBy   = "Terraform"
      CaseStudy   = "145"
    }
  }
}
```

### `terraform/variables.tf`

```hcl
variable "aws_region"    { default = "us-east-1" }
variable "environment"   { default = "dev" }
variable "project_name"  { default = "metaspace" }

variable "vpc_cidr"             { default = "10.0.0.0/16" }
variable "public_subnet_cidrs"  { default = ["10.0.1.0/24", "10.0.2.0/24"] }
variable "private_subnet_cidrs" { default = ["10.0.3.0/24", "10.0.4.0/24"] }

variable "ec2_instance_type" { default = "t3.micro" }
variable "ec2_ami"           { default = "ami-0c02fb55956c7d316" } # Amazon Linux 2023 us-east-1

variable "db_instance_class" { default = "db.t3.micro" }
variable "db_name"           { default = "metaspace_db" }
variable "db_username"       { default = "metaspace_admin" }
variable "db_password"       {
  sensitive = true
  description = "RDS MySQL master password"
}

variable "key_pair_name" {
  description = "Name of existing EC2 Key Pair for SSH"
}
```

### `terraform/modules/vpc/main.tf`

```hcl
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "${var.project_name}-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-igw" }
}

# Public subnets
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "${var.project_name}-public-${count.index + 1}" }
}

# Private subnets
resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = { Name = "${var.project_name}-private-${count.index + 1}" }
}

# Route table for public subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "${var.project_name}-rt-public" }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

data "aws_availability_zones" "available" {
  state = "available"
}
```

### `terraform/modules/ec2/main.tf`

```hcl
# Security Group — EC2
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-sg-ec2"
  description = "MetaSpace EC2 security group"
  vpc_id      = var.vpc_id

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # SSH — restrict to your IP in production!
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Change to your IP: ["x.x.x.x/32"]
  }
  # All outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${var.project_name}-sg-ec2" }
}

# IAM Role for EC2 — allows S3 + CloudWatch access
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_s3" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "ec2_cloudwatch" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# EC2 Instance
resource "aws_instance" "app" {
  ami                    = var.ec2_ami
  instance_type          = var.ec2_instance_type
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  key_name               = var.key_pair_name

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 20
    delete_on_termination = true
    encrypted             = true
  }

  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
    curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
      -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    mkdir -p /opt/metaspace
    echo "EC2 bootstrap complete" > /tmp/bootstrap.log
  EOF

  tags = { Name = "${var.project_name}-app-server" }
}
```

### `terraform/modules/rds/main.tf`

```hcl
# Security Group — RDS (only allows traffic from EC2 SG)
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-sg-rds"
  description = "MetaSpace RDS MySQL security group"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [var.ec2_security_group_id]
    description     = "MySQL from EC2 only"
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "${var.project_name}-sg-rds" }
}

# DB Subnet Group (requires 2 AZs)
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.private_subnet_ids
  tags       = { Name = "${var.project_name}-db-subnet-group" }
}

# RDS MySQL Instance
resource "aws_db_instance" "mysql" {
  identifier             = "${var.project_name}-mysql"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = var.db_instance_class
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password

  # Storage
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp3"
  storage_encrypted      = true

  # Networking
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # Backups
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  # Monitoring
  performance_insights_enabled = true
  monitoring_interval          = 60
  monitoring_role_arn          = aws_iam_role.rds_monitoring.arn

  # Protection
  deletion_protection = false  # Set true in production
  skip_final_snapshot = true   # Set false in production

  tags = { Name = "${var.project_name}-rds" }
}

resource "aws_iam_role" "rds_monitoring" {
  name = "${var.project_name}-rds-monitoring-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}
```

### `terraform/modules/s3/main.tf`

```hcl
resource "aws_s3_bucket" "assets" {
  bucket        = "${var.project_name}-assets-${var.environment}-${random_id.suffix.hex}"
  force_destroy = true
  tags          = { Name = "${var.project_name}-assets-bucket" }
}

resource "random_id" "suffix" { byte_length = 4 }

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle: move logs to cheaper storage after 30 days
resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  rule {
    id     = "logs-lifecycle"
    status = "Enabled"
    filter { prefix = "logs/" }
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    expiration { days = 90 }
  }
}
```

### `terraform/main.tf`

```hcl
module "vpc" {
  source               = "./modules/vpc"
  project_name         = var.project_name
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

module "ec2" {
  source              = "./modules/ec2"
  project_name        = var.project_name
  vpc_id              = module.vpc.vpc_id
  public_subnet_id    = module.vpc.public_subnet_ids[0]
  ec2_instance_type   = var.ec2_instance_type
  ec2_ami             = var.ec2_ami
  key_pair_name       = var.key_pair_name
}

module "rds" {
  source                = "./modules/rds"
  project_name          = var.project_name
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  ec2_security_group_id = module.ec2.ec2_security_group_id
  db_instance_class     = var.db_instance_class
  db_name               = var.db_name
  db_username           = var.db_username
  db_password           = var.db_password
}

module "s3" {
  source       = "./modules/s3"
  project_name = var.project_name
  environment  = var.environment
}
```

### `terraform/outputs.tf`

```hcl
output "ec2_public_ip"      { value = module.ec2.public_ip }
output "ec2_public_dns"     { value = module.ec2.public_dns }
output "rds_endpoint"       { value = module.rds.endpoint }
output "s3_bucket_name"     { value = module.s3.bucket_name }
output "vpc_id"             { value = module.vpc.vpc_id }
```

### Terraform Commands

```bash
cd terraform/

# Initialize (downloads providers)
terraform init

# Preview what will be created
terraform plan -var="db_password=YourSecurePass123!" -var="key_pair_name=my-key"

# Apply — creates all AWS resources
terraform apply -var="db_password=YourSecurePass123!" -var="key_pair_name=my-key"

# Destroy all resources (to avoid charges)
terraform destroy -var="db_password=YourSecurePass123!" -var="key_pair_name=my-key"
```

---

## 12. AWS Services Configuration

### S3 — Upload from Node.js

```javascript
// backend/src/utils/s3Upload.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

async function uploadToS3(key, body, contentType = 'application/octet-stream') {
  const command = new PutObjectCommand({
    Bucket:      process.env.AWS_BUCKET_NAME,
    Key:         key,
    Body:        body,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  });
  return s3.send(command);
}

module.exports = { uploadToS3 };
```

### CloudWatch Agent Config — `/opt/aws/amazon-cloudwatch-agent/etc/config.json`

```json
{
  "agent": {
    "metrics_collection_interval": 60,
    "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"
  },
  "metrics": {
    "namespace": "MetaSpace/EC2",
    "metrics_collected": {
      "cpu": {
        "measurement": ["cpu_usage_idle", "cpu_usage_user", "cpu_usage_system"],
        "metrics_collection_interval": 60,
        "totalcpu": true
      },
      "mem": {
        "measurement": ["mem_used_percent", "mem_available_percent"],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": ["disk_used_percent", "disk_inodes_free"],
        "metrics_collection_interval": 60,
        "resources": ["/"]
      },
      "net": {
        "measurement": ["bytes_sent", "bytes_recv"],
        "metrics_collection_interval": 60
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/metaspace/app.log",
            "log_group_name": "/metaspace/application",
            "log_stream_name": "{instance_id}/app"
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/metaspace/nginx",
            "log_stream_name": "{instance_id}/access"
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/metaspace/nginx",
            "log_stream_name": "{instance_id}/error"
          }
        ]
      }
    }
  }
}
```

```bash
# Start CloudWatch agent with config
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json \
  -s
```

---

## 13. CloudWatch Monitoring & Alarms

### Create Alarms via AWS CLI

```bash
EC2_ID="i-0xxxxxxxxxxxxxxxxx"  # Replace with your EC2 instance ID
SNS_ARN="arn:aws:sns:us-east-1:123456789012:metaspace-alerts"

# Alarm 1: High CPU (> 80% for 5 min)
aws cloudwatch put-metric-alarm \
  --alarm-name "MetaSpace-HighCPU" \
  --alarm-description "EC2 CPU > 80% for 5 minutes" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --dimensions Name=InstanceId,Value=$EC2_ID \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $SNS_ARN \
  --treat-missing-data notBreaching

# Alarm 2: Low Disk Space (< 20% free)
aws cloudwatch put-metric-alarm \
  --alarm-name "MetaSpace-LowDisk" \
  --alarm-description "Disk usage > 80%" \
  --metric-name disk_used_percent \
  --namespace MetaSpace/EC2 \
  --statistic Average \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $SNS_ARN

# Alarm 3: RDS High CPU
aws cloudwatch put-metric-alarm \
  --alarm-name "MetaSpace-RDS-HighCPU" \
  --alarm-description "RDS CPU > 75%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --dimensions Name=DBInstanceIdentifier,Value=metaspace-mysql \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 75 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $SNS_ARN

# Alarm 4: RDS Low Storage
aws cloudwatch put-metric-alarm \
  --alarm-name "MetaSpace-RDS-LowStorage" \
  --alarm-description "RDS free storage < 2GB" \
  --metric-name FreeStorageSpace \
  --namespace AWS/RDS \
  --statistic Average \
  --dimensions Name=DBInstanceIdentifier,Value=metaspace-mysql \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 2000000000 \
  --comparison-operator LessThanThreshold \
  --alarm-actions $SNS_ARN

# SNS Topic for alerts (email notification)
aws sns create-topic --name metaspace-alerts
aws sns subscribe \
  --topic-arn $SNS_ARN \
  --protocol email \
  --notification-endpoint your@email.com
```

### CloudWatch Dashboard (JSON definition)

```bash
aws cloudwatch put-dashboard \
  --dashboard-name "MetaSpace-Operations" \
  --dashboard-body '{
    "widgets": [
      {
        "type": "metric",
        "properties": {
          "title": "EC2 CPU Utilization",
          "metrics": [["AWS/EC2","CPUUtilization","InstanceId","'$EC2_ID'"]],
          "period": 300,
          "stat": "Average",
          "view": "timeSeries",
          "region": "us-east-1"
        }
      },
      {
        "type": "metric",
        "properties": {
          "title": "RDS CPU & Connections",
          "metrics": [
            ["AWS/RDS","CPUUtilization","DBInstanceIdentifier","metaspace-mysql"],
            ["AWS/RDS","DatabaseConnections","DBInstanceIdentifier","metaspace-mysql"]
          ],
          "period": 300,
          "stat": "Average"
        }
      }
    ]
  }'
```

---

## 14. Automation Shell Scripts

### Backup Script — `scripts/backup.sh`

```bash
#!/bin/bash
# MetaSpace Database Backup to S3
# Runs daily at 2 AM via cron

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/metaspace-backups"
BACKUP_FILE="metaspace_db_${TIMESTAMP}.sql.gz"
S3_BUCKET="${AWS_BUCKET_NAME:-metaspace-assets-bucket}"
S3_KEY="backups/db/${BACKUP_FILE}"
LOG_FILE="/var/log/metaspace/backup.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

log "Starting database backup..."

mkdir -p "$BACKUP_DIR"

# Dump database and compress
if docker exec metaspace-mysql mysqldump \
  -u root -p"${MYSQL_ROOT_PASSWORD:-root_dev_password}" \
  --single-transaction \
  --routines \
  --triggers \
  metaspace_db 2>/dev/null | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"; then
  log "Database dump successful: ${BACKUP_FILE}"
else
  log "ERROR: Database dump failed!"
  exit 1
fi

# Upload to S3
if aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" "s3://${S3_BUCKET}/${S3_KEY}"; then
  log "Uploaded to S3: s3://${S3_BUCKET}/${S3_KEY}"
else
  log "ERROR: S3 upload failed!"
  exit 1
fi

# Clean up local file
rm -f "${BACKUP_DIR}/${BACKUP_FILE}"
log "Local backup cleaned up."

# Delete S3 backups older than 30 days
aws s3 ls "s3://${S3_BUCKET}/backups/db/" | \
  awk '{print $4}' | \
  while read -r key; do
    DATE=$(echo "$key" | grep -oP '\d{8}')
    CUTOFF=$(date -d "30 days ago" +%Y%m%d)
    if [[ "$DATE" < "$CUTOFF" ]]; then
      aws s3 rm "s3://${S3_BUCKET}/backups/db/$key"
      log "Deleted old backup: $key"
    fi
  done

log "Backup process complete."
```

### Health Check — `scripts/health-check.sh`

```bash
#!/bin/bash
# MetaSpace Health Check Script
# Runs every 5 minutes via cron

set -euo pipefail

LOG_FILE="/var/log/metaspace/health.log"
BACKEND_URL="http://localhost:5000/health"
ALERT_THRESHOLD_CPU=85

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

# ── Check API health ───────────────────────────
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" || echo "000")
if [ "$HTTP_STATUS" != "200" ]; then
  log "WARNING: Backend API returned HTTP $HTTP_STATUS"
  # Attempt restart
  docker compose -f /opt/metaspace/docker-compose.prod.yml restart backend
  log "Backend container restarted."
else
  log "OK: Backend API healthy (HTTP 200)"
fi

# ── Check Docker containers ────────────────────
for container in metaspace-backend metaspace-frontend; do
  STATUS=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "not found")
  if [ "$STATUS" != "running" ]; then
    log "WARNING: Container $container is $STATUS — restarting..."
    docker start "$container" || log "ERROR: Could not start $container"
  else
    log "OK: $container is running"
  fi
done

# ── Check CPU usage ────────────────────────────
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print int($2 + $4)}')
if [ "$CPU_USAGE" -gt "$ALERT_THRESHOLD_CPU" ]; then
  log "WARNING: CPU usage is ${CPU_USAGE}% (threshold: ${ALERT_THRESHOLD_CPU}%)"
fi

# ── Check disk space ───────────────────────────
DISK_USAGE=$(df / | awk 'NR==2 {print int($5)}')
if [ "$DISK_USAGE" -gt 80 ]; then
  log "WARNING: Disk usage at ${DISK_USAGE}%"
fi

# ── Check memory ───────────────────────────────
MEM_FREE=$(free | awk '/^Mem:/ {printf "%.0f", $4/$2 * 100}')
if [ "$MEM_FREE" -lt 15 ]; then
  log "WARNING: Only ${MEM_FREE}% memory free"
fi

log "Health check complete."
```

### Deploy Script — `scripts/deploy.sh`

```bash
#!/bin/bash
# MetaSpace Production Deployment Script
# Run on EC2: bash deploy.sh

set -euo pipefail

APP_DIR="/opt/metaspace"
REPO_URL="https://github.com/your-username/metaspace-cloud.git"
BRANCH="main"
COMPOSE_FILE="$APP_DIR/docker-compose.prod.yml"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

log "Starting MetaSpace deployment..."

# Pull latest code
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull origin "$BRANCH"
else
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# Build and restart containers
log "Building Docker images..."
docker compose -f "$COMPOSE_FILE" build --no-cache

log "Stopping existing containers..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans

log "Starting new containers..."
docker compose -f "$COMPOSE_FILE" up -d

# Wait for health checks
sleep 10
log "Checking container health..."
docker compose -f "$COMPOSE_FILE" ps

log "✅ Deployment complete!"
```

---

## 15. Security — IAM, VPC, Security Groups

### IAM Users & Permissions (via AWS CLI)

```bash
# ── Create IAM Groups ────────────────────────────
aws iam create-group --group-name MetaSpace-Admins
aws iam create-group --group-name MetaSpace-Developers
aws iam create-group --group-name MetaSpace-ReadOnly

# Attach policies to groups
aws iam attach-group-policy --group-name MetaSpace-Admins \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

aws iam attach-group-policy --group-name MetaSpace-Developers \
  --policy-arn arn:aws:iam::aws:policy/PowerUserAccess

aws iam attach-group-policy --group-name MetaSpace-ReadOnly \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess

# ── Create IAM Users ────────────────────────────
aws iam create-user --user-name metaspace-admin
aws iam add-user-to-group --user-name metaspace-admin --group-name MetaSpace-Admins

aws iam create-user --user-name metaspace-dev
aws iam add-user-to-group --user-name metaspace-dev --group-name MetaSpace-Developers

# Create access keys for programmatic access
aws iam create-access-key --user-name metaspace-dev

# ── MFA Policy for Admin group ──────────────────
# (Best practice: require MFA for console access)
```

### Security Group Rules Summary

| Group | Rule | Port | Source |
|-------|------|------|--------|
| EC2 SG | Inbound HTTP | 80 | 0.0.0.0/0 |
| EC2 SG | Inbound HTTPS | 443 | 0.0.0.0/0 |
| EC2 SG | Inbound SSH | 22 | Your IP only |
| EC2 SG | Outbound All | All | 0.0.0.0/0 |
| RDS SG | Inbound MySQL | 3306 | EC2 SG only |
| RDS SG | Outbound All | All | 0.0.0.0/0 |

### Key Security Principles Applied

1. **Principle of Least Privilege** — IAM roles grant only what is needed
2. **Private RDS** — Database is never publicly accessible
3. **Encrypted storage** — EBS volumes + RDS encrypted with AES-256
4. **S3 Block Public Access** — All buckets private by default
5. **JWT with expiry** — Tokens expire in 24h, no refresh token storage on server
6. **bcrypt password hashing** — Salt rounds = 12
7. **Rate limiting** — 100 requests / 15 min per IP on all API routes
8. **Helmet.js** — Sets secure HTTP headers (XSS, CSRF, HSTS, etc.)
9. **SSH key only** — Password auth disabled on EC2

---

## 16. Cost Estimation

### Monthly Cost Breakdown (ap-south-1 / Mumbai region)

| Service | Resource | Price |
|---------|----------|-------|
| EC2 | t3.micro (24x7) | ~$8.70/mo |
| RDS MySQL | db.t3.micro Single-AZ, 20GB gp3 | ~$15–17/mo |
| S3 | 5GB storage + requests | ~$0.12/mo |
| CloudWatch | 10 metrics, 10 alarms, logs | ~$2–3/mo |
| Data Transfer | Outbound ~5GB/mo | ~$0.60/mo |
| EBS | 20GB gp3 (attached to EC2) | ~$1.60/mo |
| **Total Estimated** | | **~$28–31/mo** |

### Free Tier Note

If your AWS account is under 12 months old (created before July 15, 2025):
- EC2 t3.micro: **750 hrs/month free** → EC2 cost = $0
- RDS db.t3.micro: **750 hrs/month free** → RDS cost = $0
- S3: **5GB free** → S3 cost = $0
- **Effective total: ~$2–5/mo** (only CloudWatch + data transfer)

> Tip: Stop EC2 and RDS instances when not in use (nights/weekends) to save ~65% of compute costs.

---

## 17. Deployment Workflow

### Step-by-Step: From Zero to Live

```bash
# ── STEP 1: Local Setup ──────────────────────────────────
git clone https://github.com/your-username/metaspace-cloud.git
cd metaspace-cloud
docker compose up -d
# Visit http://localhost:80 → MetaSpace dashboard (local)

# ── STEP 2: Provision AWS Infrastructure ─────────────────
cd terraform/
terraform init
terraform apply -var="db_password=SecurePass123!" -var="key_pair_name=my-key"
# Note outputs: EC2 public IP, RDS endpoint, S3 bucket name

# ── STEP 3: Configure EC2 ────────────────────────────────
EC2_IP=$(terraform output -raw ec2_public_ip)
scp -i ~/.ssh/my-key.pem scripts/server-setup.sh ubuntu@$EC2_IP:/tmp/
ssh -i ~/.ssh/my-key.pem ubuntu@$EC2_IP "sudo bash /tmp/server-setup.sh"

# ── STEP 4: Deploy App to EC2 ────────────────────────────
ssh -i ~/.ssh/my-key.pem ubuntu@$EC2_IP
cd /opt/metaspace
git clone <your-repo> .

# Set production env vars
export RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
export DB_PASS="SecurePass123!"
export JWT_SECRET="your-64-char-production-secret"

docker compose -f docker-compose.prod.yml up -d --build

# ── STEP 5: Initialize RDS Database ──────────────────────
# Connect to RDS from EC2 (RDS is in private subnet, only reachable from EC2)
mysql -h $RDS_ENDPOINT -u metaspace_admin -p metaspace_db < database/init.sql

# ── STEP 6: Start CloudWatch Agent ───────────────────────
sudo systemctl start amazon-cloudwatch-agent

# ── STEP 7: Create CloudWatch Alarms ─────────────────────
bash scripts/setup-alarms.sh

# ── STEP 8: Setup Cron Jobs ──────────────────────────────
sudo crontab -e
# Add backup and health check entries (see Section 10)

# ── STEP 9: Verify ───────────────────────────────────────
curl http://$EC2_IP/health
# Expected: {"status":"ok","timestamp":"...","service":"metaspace-api"}
```

---

## 18. Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AWS Cloud — us-east-1                            │
│                                                                     │
│  ┌─────────────────────────── VPC: 10.0.0.0/16 ─────────────────┐  │
│  │                                                               │  │
│  │  ┌───────────────────────────────────────────────────────┐   │  │
│  │  │           PUBLIC SUBNET — 10.0.1.0/24                 │   │  │
│  │  │                                                       │   │  │
│  │  │   ┌─────────────────────────────────────────────┐    │   │  │
│  │  │   │         EC2 Instance (t3.micro)              │    │   │  │
│  │  │   │                                             │    │   │  │
│  │  │   │  [Docker Compose]                           │    │   │  │
│  │  │   │  ├─ Nginx container  :80/:443               │    │   │  │
│  │  │   │  │   └─ Serves React SPA                   │    │   │  │
│  │  │   │  │   └─ Proxies /api → backend:5000         │    │   │  │
│  │  │   │  └─ Node.js container :5000                 │    │   │  │
│  │  │   │      └─ Express API + Sequelize ORM         │    │   │  │
│  │  │   │                                             │    │   │  │
│  │  │   │  [CloudWatch Agent]                         │    │   │  │
│  │  │   │  [IAM Instance Role: S3 + CW access]        │    │   │  │
│  │  │   └─────────────────────────────────────────────┘    │   │  │
│  │  └───────────────────────────────────────────────────────┘   │  │
│  │                              │                                │  │
│  │                    [Security Group: 3306]                     │  │
│  │                              │                                │  │
│  │  ┌────────────────────────── ▼ ──────────────────────────┐   │  │
│  │  │           PRIVATE SUBNETS — 10.0.3.0/24 + .4.0/24    │   │  │
│  │  │                                                       │   │  │
│  │  │   ┌─────────────────────────────────────────────┐    │   │  │
│  │  │   │     RDS MySQL 8.0 (db.t3.micro)             │    │   │  │
│  │  │   │     NOT publicly accessible                  │    │   │  │
│  │  │   │     Encrypted storage · 7-day backups        │    │   │  │
│  │  │   └─────────────────────────────────────────────┘    │   │  │
│  │  └───────────────────────────────────────────────────────┘   │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────┐   ┌────────────────┐   ┌────────────────────────┐  │
│  │  S3 Bucket  │   │   CloudWatch   │   │   IAM                  │  │
│  │  ─ Assets   │   │  ─ Metrics     │   │  ─ EC2 Role (S3+CW)    │  │
│  │  ─ Backups  │   │  ─ Alarms      │   │  ─ Admin Group         │  │
│  │  ─ Logs     │   │  ─ Dashboards  │   │  ─ Dev Group           │  │
│  └─────────────┘   └────────────────┘   └────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
         ▲
         │ Internet Gateway
         │
    [Internet]
         │
    [User Browser]
```

---

## Quick Reference Commands

```bash
# ── Docker ───────────────────────────────────────────────
docker compose up -d              # Start all services
docker compose down               # Stop all services
docker compose logs -f backend    # Stream backend logs
docker compose ps                 # Check container status
docker compose exec backend sh    # Shell into backend container
docker compose exec mysql mysql -u root -p  # MySQL shell

# ── Terraform ────────────────────────────────────────────
terraform init                    # Initialize providers
terraform plan                    # Preview changes
terraform apply                   # Apply changes
terraform output                  # Show output values
terraform destroy                 # Tear down everything

# ── AWS CLI ──────────────────────────────────────────────
aws ec2 describe-instances        # List EC2 instances
aws s3 ls s3://metaspace-bucket/  # List S3 contents
aws cloudwatch describe-alarms    # View alarms
aws rds describe-db-instances     # View RDS status

# ── Linux Admin ───────────────────────────────────────────
systemctl status docker           # Docker service status
journalctl -u docker -f           # Docker service logs
crontab -l                        # List cron jobs
tail -f /var/log/metaspace/app.log # App logs live
df -h && free -h                  # Disk + memory
```

---

*MetaSpace Digital Twin Operations Cloud — Case Study 145*
*B.Tech CSE 2024–2028 | Semester IV | AWS Cloud Engineering*
