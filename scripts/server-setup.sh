#!/bin/bash
# MetaSpace EC2 Initial Setup Script
# Run as: sudo bash server-setup.sh
# OS: Ubuntu 22.04 LTS

set -euo pipefail

echo "============================================"
echo " MetaSpace Cloud — EC2 Setup Script"
echo "============================================"

# ── 1. System Update ─────────────────────────
echo "[1/8] Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y && apt-get upgrade -y

# ── 2. Install core packages ─────────────────
echo "[2/8] Installing dependencies..."
apt-get install -y \
  curl wget git unzip htop \
  awscli jq tree \
  nginx certbot python3-certbot-nginx \
  default-mysql-client

# ── 3. Install Docker ─────────────────────────
echo "[3/8] Installing Docker..."
curl -fsSL https://get.docker.com | bash
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu || true

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
usermod -aG sudo devops-user || true
usermod -aG docker devops-user || true

# Monitoring-only user (read-only)
useradd -m -s /bin/bash monitor-user || true

echo "[5/8] Setting file permissions..."
# App directory
mkdir -p /opt/metaspace
chown -R ubuntu:ubuntu /opt/metaspace || true
chmod 755 /opt/metaspace

# Log directory
mkdir -p /var/log/metaspace
chown -R ubuntu:ubuntu /var/log/metaspace || true
chmod 755 /var/log/metaspace

# ── 6. Install CloudWatch Agent ───────────────
echo "[6/8] Installing CloudWatch Agent..."
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb

# ── 7. Service Management (Nginx conflict fix) ──────
echo "[7/8] Stopping host-level Nginx to avoid Docker port conflicts..."
systemctl stop nginx || true
systemctl disable nginx || true

# ── 8. Security hardening ─────────────────────
echo "[8/8] Applying security settings..."

# SSH: disable root login, disable password auth
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/'      /etc/ssh/sshd_config || true
sed -i 's/PermitRootLogin yes/PermitRootLogin no/'      /etc/ssh/sshd_config || true
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config || true
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config || true
systemctl restart sshd || true

# Firewall (ufw)
ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw --force enable || true

echo ""
echo "✅ EC2 setup complete!"
