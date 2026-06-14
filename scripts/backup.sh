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

# Create log file if not exists
touch "$LOG_FILE"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

log "Starting database backup..."

mkdir -p "$BACKUP_DIR"

# Dump database and compress
# In production, mysql runs on RDS, but we can backup it from the EC2 instance using the RDS endpoint env variables
if mysqldump \
  -h "${DB_HOST}" \
  -u "${DB_USER}" \
  -p"${DB_PASS}" \
  --single-transaction \
  --routines \
  --triggers \
  metaspace_db | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"; then
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
log "Checking for old backups to rotate..."
aws s3 ls "s3://${S3_BUCKET}/backups/db/" | \
  awk '{print $4}' | \
  while read -r key; do
    [ -z "$key" ] && continue
    # Extract date from keys like backups/db/metaspace_db_20260613_133714.sql.gz
    DATE=$(echo "$key" | grep -oE '[0-9]{8}')
    [ -z "$DATE" ] && continue
    CUTOFF=$(date -d "30 days ago" +%Y%m%d 2>/dev/null || date -v-30d +%Y%m%d)
    if [[ "$DATE" < "$CUTOFF" ]]; then
      aws s3 rm "s3://${S3_BUCKET}/backups/db/$key"
      log "Deleted old backup: $key"
    fi
  done

log "Backup process complete."
