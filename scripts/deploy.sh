#!/bin/bash
# MetaSpace Production Deployment Script
# Run on EC2: bash deploy.sh

set -euo pipefail

APP_DIR="/opt/metaspace"
COMPOSE_FILE="$APP_DIR/docker-compose.prod.yml"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

log "Starting MetaSpace deployment..."

# Navigate to app directory
cd "$APP_DIR"

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
