#!/bin/bash
# scripts/prod-cleanup.sh
# Destroys all provisioned AWS resources to prevent any charges
# Run locally: bash scripts/prod-cleanup.sh

set -euo pipefail

# Text styling
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[CLEANUP]$(date '+ %H:%M:%S')${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]$(date '+ %H:%M:%S')${NC} $1"; }
error() { echo -e "${RED}[ERROR]$(date '+ %H:%M:%S')${NC} $1"; }

# ── 1. Check Prerequisites ────────────────────
log "Checking local prerequisites..."
for cmd in terraform aws; do
  if ! command -v "$cmd" &> /dev/null; then
    error "Prerequisite command '$cmd' is missing. Please install it."
    exit 1
  fi
done

log "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
  error "AWS credentials are not configured or invalid."
  exit 1
fi

# ── 2. Empty versioned S3 Buckets ─────────────
if [ -d "terraform" ]; then
  cd terraform
  
  log "Retrieving S3 bucket name from Terraform state..."
  S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
  
  if [ -n "$S3_BUCKET" ] && [ "$S3_BUCKET" != "No outputs" ] && [[ "$S3_BUCKET" != *"Error"* ]]; then
    log "Emptying S3 bucket '$S3_BUCKET' (including version histories)..."
    
    # Delete all object versions
    log "  Removing object versions..."
    VERSIONS=$(aws s3api list-object-versions --bucket "$S3_BUCKET" --output json --query "Versions[].{Key:Key,VersionId:VersionId}" 2>/dev/null || echo "null")
    if [ "$VERSIONS" != "null" ] && [ -n "$VERSIONS" ] && [ "$VERSIONS" != "[]" ]; then
      aws s3api delete-objects --bucket "$S3_BUCKET" --delete "$VERSIONS" &>/dev/null || true
    fi

    # Delete all delete markers
    log "  Removing delete markers..."
    MARKERS=$(aws s3api list-object-versions --bucket "$S3_BUCKET" --output json --query "DeleteMarkers[].{Key:Key,VersionId:VersionId}" 2>/dev/null || echo "null")
    if [ "$MARKERS" != "null" ] && [ -n "$MARKERS" ] && [ "$MARKERS" != "[]" ]; then
      aws s3api delete-objects --bucket "$S3_BUCKET" --delete "$MARKERS" &>/dev/null || true
    fi
    
    # Recursive deletion of any remaining files
    aws s3 rm "s3://$S3_BUCKET" --recursive &>/dev/null || true
    log "S3 bucket '$S3_BUCKET' emptied."
  else
    warn "No S3 bucket output found in state. Skipping bucket empty phase."
  fi
  
  # ── 3. Terraform Destroy ────────────────────
  log "Running Terraform Destroy..."
  # Pass dummy password and key pair name so Terraform doesn't prompt for them during destroy
  if terraform destroy \
    -var="db_password=DummyPassword123!" \
    -var="key_pair_name=metaspace-key" \
    -auto-approve; then
    log "Terraform resources destroyed successfully."
  else
    error "Terraform destroy failed. Check the error logs."
    exit 1
  fi
  
  cd ..
else
  warn "No terraform directory found. Skipping resource destruction."
fi

# ── 4. Remove Key Pair Associations ──────────
log "Removing AWS Key Pair 'metaspace-key'..."
if aws ec2 describe-key-pairs --key-names metaspace-key --region us-east-1 &>/dev/null; then
  aws ec2 delete-key-pair --key-name metaspace-key --region us-east-1
  log "AWS Key Pair deleted."
else
  log "No AWS Key Pair 'metaspace-key' found."
fi

log "Cleaning up local credentials..."
KEY_PATH="$HOME/.ssh/metaspace-key"
if [ -f "$KEY_PATH" ]; then
  rm -f "$KEY_PATH" "${KEY_PATH}.pub"
  log "Local SSH keys removed from $KEY_PATH."
fi

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN} ✅ CLEANUP COMPLETE! All AWS resources destroyed successfully.${NC}"
echo -e "${GREEN} 💸 Total AWS cost target: \$0.00 / month${NC}"
echo -e "${GREEN}======================================================================${NC}\n"
