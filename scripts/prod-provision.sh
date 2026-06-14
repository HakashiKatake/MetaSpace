#!/bin/bash
# scripts/prod-provision.sh
# Production AWS Provisioner for MetaSpace Digital Twin Cloud
# Run locally: bash scripts/prod-provision.sh

set -euo pipefail

# Text styling
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[PROVISION]$(date '+ %H:%M:%S')${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]$(date '+ %H:%M:%S')${NC} $1"; }
error() { echo -e "${RED}[ERROR]$(date '+ %H:%M:%S')${NC} $1"; }

# ── 1. Check Prerequisites ────────────────────
log "Checking local prerequisites..."
for cmd in terraform aws ssh tar openssl; do
  if ! command -v "$cmd" &> /dev/null; then
    error "Prerequisite command '$cmd' is missing. Please install it."
    exit 1
  fi
done

log "Checking AWS credentials..."
if ! aws sts get-caller-identity --query "Account" --output text &> /dev/null; then
  error "AWS credentials are not configured or invalid. Run 'aws configure' first."
  exit 1
fi
log "AWS CLI configured successfully."

# ── 2. Configure Credentials & Keys ───────────
log "Setting up SSH key pair..."
KEY_DIR="$HOME/.ssh"
mkdir -p "$KEY_DIR"
KEY_PATH="$KEY_DIR/metaspace-key"

if [ ! -f "$KEY_PATH" ]; then
  log "Generating new SSH key pair at $KEY_PATH..."
  ssh-keygen -t rsa -b 2048 -f "$KEY_PATH" -N ""
  chmod 600 "$KEY_PATH"
else
  log "Existing SSH key pair found at $KEY_PATH."
fi

# Import key pair to AWS if not already registered
log "Registering SSH key with AWS EC2..."
if ! aws ec2 describe-key-pairs --key-names metaspace-key --region us-east-1 &> /dev/null; then
  aws ec2 import-key-pair \
    --key-name metaspace-key \
    --public-key-material fileb://"$KEY_PATH.pub" \
    --region us-east-1
  log "SSH key imported successfully to AWS."
else
  log "SSH key 'metaspace-key' is already registered with AWS."
fi

# Generate credentials
log "Generating secure secrets..."
DB_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)
JWT_SECRET=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
ALERT_EMAIL="ops-alerts@metaspace.io" # Default email for notifications

# ── 3. Terraform Provisioning ─────────────────
log "Initializing Terraform..."
cd terraform
terraform init

log "Applying Terraform infrastructure (this will take 3-5 minutes)..."
terraform apply \
  -var="db_password=$DB_PASS" \
  -var="key_pair_name=metaspace-key" \
  -auto-approve

# Retrieve outputs
log "Retrieving provisioned resource parameters..."
EC2_IP=$(terraform output -raw ec2_public_ip)
EC2_DNS=$(terraform output -raw ec2_public_dns)
EC2_INSTANCE_ID=$(terraform output -raw ec2_instance_id)
RDS_ENDPOINT_RAW=$(terraform output -raw rds_endpoint)
RDS_ENDPOINT=$(echo "$RDS_ENDPOINT_RAW" | cut -d':' -f1)
S3_BUCKET_NAME=$(terraform output -raw s3_bucket_name)

cd ..

# ── 4. Generate Production Configs ────────────
log "Formulating production configuration environments..."
cat <<EOF > .env
RDS_ENDPOINT=$RDS_ENDPOINT
DB_NAME=metaspace_db
DB_USER=metaspace_admin
DB_PASS=$DB_PASS
JWT_SECRET=$JWT_SECRET
AWS_REGION=us-east-1
AWS_BUCKET_NAME=$S3_BUCKET_NAME
EOF

# ── 5. Package and Transfer ───────────────────
log "Bundling project codebase..."
tar -czf metaspace.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.terraform' \
  --exclude='terraform.tfstate*' \
  --exclude='*.tar.gz' \
  --exclude='frontend/dist' \
  .

log "Waiting for EC2 SSH availability at $EC2_IP..."
until ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ubuntu@"$EC2_IP" "echo SSH_OK" &> /dev/null; do
  log "SSH port not responding yet. Retrying in 5 seconds..."
  sleep 5
done
log "EC2 SSH port is online."

log "Uploading project bundle, scripts, and production configurations to EC2..."
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no metaspace.tar.gz scripts/server-setup.sh .env ubuntu@"$EC2_IP":/tmp/

# Clean local tarball and temp env
rm -f metaspace.tar.gz .env

# ── 6. EC2 Setup and Extraction ───────────────
log "Running host configuration script server-setup.sh (this takes ~1-2 minutes)..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ubuntu@"$EC2_IP" "sudo bash /tmp/server-setup.sh"

log "Extracting project bundle to /opt/metaspace..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ubuntu@"$EC2_IP" "
  sudo mkdir -p /opt/metaspace
  sudo tar -xzf /tmp/metaspace.tar.gz -C /opt/metaspace
  sudo mv /tmp/.env /opt/metaspace/.env
  sudo chown -R ubuntu:ubuntu /opt/metaspace
"

# ── 7. RDS Database Initialization ────────────
log "Waiting for RDS MySQL to start accepting connections..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ubuntu@"$EC2_IP" "
  until mysql -h '$RDS_ENDPOINT' -u metaspace_admin -p'$DB_PASS' -e 'show databases;' &>/dev/null; do
    echo '  [DB CONNECT] Waiting for database endpoint to accept handshakes...'
    sleep 8
  done
"
log "RDS MySQL is accepting connections. Importing init.sql schema..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ubuntu@"$EC2_IP" "
  mysql -h '$RDS_ENDPOINT' -u metaspace_admin -p'$DB_PASS' metaspace_db < /opt/metaspace/database/init.sql
"
log "RDS Database initialized successfully."

# ── 8. Docker Compose Deploy ──────────────────
log "Building and spinning up Docker containers on EC2..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ubuntu@"$EC2_IP" "
  cd /opt/metaspace
  export RDS_ENDPOINT=$RDS_ENDPOINT
  export DB_NAME=metaspace_db
  export DB_USER=metaspace_admin
  export DB_PASS=$DB_PASS
  export JWT_SECRET=$JWT_SECRET
  export AWS_REGION=us-east-1
  export AWS_BUCKET_NAME=$S3_BUCKET_NAME
  docker-compose -f docker-compose.prod.yml up -d --build
"
log "Containers online."

# ── 9. CloudWatch Monitoring & Alarms ─────────
log "Configuring CloudWatch Agent on EC2..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ubuntu@"$EC2_IP" "
  sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc
  sudo cp /opt/metaspace/scripts/cloudwatch-config.json /opt/aws/amazon-cloudwatch-agent/etc/config.json
  sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json \
    -s
"

log "Creating CloudWatch alarms and SNS notification topics..."
bash scripts/setup-alarms.sh "$EC2_INSTANCE_ID" "metaspace-mysql" "$ALERT_EMAIL"

# ── 10. Cron Jobs Registration ────────────────
log "Registering backup.sh and health-check.sh cron jobs..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ubuntu@"$EC2_IP" "
  (crontab -l 2>/dev/null; echo '0 2 * * * cd /opt/metaspace && export DB_HOST=$RDS_ENDPOINT && export DB_USER=metaspace_admin && export DB_PASS=$DB_PASS && export AWS_BUCKET_NAME=$S3_BUCKET_NAME && bash scripts/backup.sh >> /var/log/metaspace/backup.log 2>&1') | crontab -
  (crontab -l 2>/dev/null; echo '*/5 * * * * cd /opt/metaspace && bash scripts/health-check.sh >> /var/log/metaspace/health.log 2>&1') | crontab -
"

# ── 11. Final Health Verification ─────────────
log "Verifying application health check..."
HEALTH_CHECK_STATUS=$(ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ubuntu@"$EC2_IP" "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/health" || echo "500")
if [ "$HEALTH_CHECK_STATUS" = "200" ]; then
  log "Health verification: OK (HTTP 200)"
else
  warn "Health verification returned HTTP $HEALTH_CHECK_STATUS. Check container logs."
fi

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN} ✅ PROVISIONING COMPLETE! MetaSpace Cloud is now LIVE!${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e " 🚀 Dashboard Web Address:  http://$EC2_DNS"
echo -e " ⚡ Deployed Public IP:     http://$EC2_IP"
echo -e " 🛠️  SSH Login Command:      ssh -i $KEY_PATH ubuntu@$EC2_IP"
echo -e " 💾 Cloud Storage Bucket:   s3://$S3_BUCKET_NAME"
echo -e " 📊 Monitoring namespace:   MetaSpace/EC2"
echo -e " 📨 Alerts Configured for:  $ALERT_EMAIL"
echo -e "🔑 Admin Credentials:      admin@metaspace.io / Admin@123"
echo -e "${GREEN}======================================================================${NC}\n"
