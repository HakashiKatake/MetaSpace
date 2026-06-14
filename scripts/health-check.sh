#!/bin/bash
# MetaSpace Health Check Script
# Runs every 5 minutes via cron

set -euo pipefail

LOG_FILE="/var/log/metaspace/health.log"
BACKEND_URL="http://localhost:5000/health"
ALERT_THRESHOLD_CPU=85

# Ensure directory and file exist
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

# ── Check API health ───────────────────────────
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" || echo "000")
if [ "$HTTP_STATUS" != "200" ]; then
  log "WARNING: Backend API returned HTTP $HTTP_STATUS"
  # Attempt restart
  docker compose -f /opt/metaspace/docker-compose.prod.yml restart backend || true
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
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print int($2 + $4)}' || echo 0)
if [ "$CPU_USAGE" -gt "$ALERT_THRESHOLD_CPU" ]; then
  log "WARNING: CPU usage is ${CPU_USAGE}% (threshold: ${ALERT_THRESHOLD_CPU}%)"
fi

# ── Check disk space ───────────────────────────
DISK_USAGE=$(df / | awk 'NR==2 {print int($5)}' || echo 0)
if [ "$DISK_USAGE" -gt 80 ]; then
  log "WARNING: Disk usage at ${DISK_USAGE}%"
fi

# ── Check memory ───────────────────────────────
MEM_FREE=$(free | awk '/^Mem:/ {printf "%.0f", $4/$2 * 100}' || echo 100)
if [ "$MEM_FREE" -lt 15 ]; then
  log "WARNING: Only ${MEM_FREE}% memory free"
fi

log "Health check complete."
