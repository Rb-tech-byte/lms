#!/usr/bin/env bash
# ==============================================================================
# OUT LMS - Enterprise Cross-Platform Deployment Script (Linux / macOS / Git Bash)
# The Open University of Tanzania Learning Management System
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "=============================================================================="
echo "  OUT LMS - Universal Deployment Engine"
echo "  The Open University of Tanzania"
echo "=============================================================================="

# Load environment configuration if available
if [ -f .env ]; then
  echo "[INFO] Loading configuration from .env..."
  export $(grep -v '^#' .env | xargs)
elif [ -f .env.example ]; then
  echo "[INFO] .env not found; copying from .env.example..."
  cp .env.example .env
  export $(grep -v '^#' .env | xargs)
fi

# Parse Options
MODE="local"
SKIP_SEED=0
SKIP_BUILD=0

for arg in "$@"; do
  case $arg in
    --docker)
      MODE="docker"
      shift
      ;;
    --seed-only)
      MODE="seed-only"
      shift
      ;;
    --build-only)
      MODE="build-only"
      shift
      ;;
    --skip-seed)
      SKIP_SEED=1
      shift
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    --help|-h)
      echo "Usage: ./deploy.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --docker      Deploy full stack via Docker Compose (MariaDB + Backend + Frontend)"
      echo "  --seed-only   Only run the database seeder (seeds all 19 courses, users & media)"
      echo "  --build-only  Only build the React 18 production bundle"
      echo "  --skip-seed   Skip database seeding step"
      echo "  --skip-build  Skip frontend build step"
      echo "  --help, -h    Display this help menu"
      exit 0
      ;;
  esac
done

# ------------------------------------------------------------------------------
# 1. Docker Deployment Mode
# ------------------------------------------------------------------------------
if [ "$MODE" = "docker" ]; then
  echo "[INFO] Deploying with Docker Compose..."
  if ! command -v docker >/dev/null 2>&1; then
    echo "[ERROR] Docker is not installed or not in PATH."
    exit 1
  fi
  docker compose down --remove-orphans || true
  docker compose up -d --build
  echo ""
  echo "=============================================================================="
  echo " [SUCCESS] OUT LMS Docker Containers Launched Successfully!"
  echo "  - Web Portal:   http://localhost:${FRONTEND_PORT:-3000}"
  echo "  - Backend API:  http://localhost:${BACKEND_PORT:-8080}"
  echo "  - Database:     localhost:${DB_PORT:-3306} (db: ${MOODLE_DB_NAME:-moodle_out})"
  echo "=============================================================================="
  exit 0
fi

# ------------------------------------------------------------------------------
# 2. Seed-Only Mode
# ------------------------------------------------------------------------------
if [ "$MODE" = "seed-only" ]; then
  echo "[INFO] Running database seeder..."
  if command -v php >/dev/null 2>&1; then
    php database/seed.php
  else
    echo "[ERROR] PHP is required to execute database/seed.php."
    exit 1
  fi
  exit 0
fi

# ------------------------------------------------------------------------------
# 3. Build-Only Mode
# ------------------------------------------------------------------------------
if [ "$MODE" = "build-only" ]; then
  echo "[INFO] Compiling React frontend..."
  cd frontend
  npm install --legacy-peer-deps
  npm run build
  echo "[SUCCESS] Build created in frontend/build/"
  exit 0
fi

# ------------------------------------------------------------------------------
# 4. Standard Local Deployment Mode
# ------------------------------------------------------------------------------
echo "[INFO] Running standard local deployment..."

# Step A: Check and seed database
if [ "$SKIP_SEED" -eq 0 ]; then
  if command -v php >/dev/null 2>&1; then
    echo "[INFO] Seeding database with official OUT LMS courses and assets..."
    php database/seed.php || echo "[WARN] Database seed returned a non-zero exit; continuing..."
  else
    echo "[WARN] PHP not detected on PATH; skipping database seeding. Run 'php database/seed.php' manually."
  fi
fi

# Step B: Build frontend if build doesn't exist or requested
if [ "$SKIP_BUILD" -eq 0 ]; then
  if [ ! -d "frontend/build" ] || [ ! -f "frontend/build/index.html" ]; then
    echo "[INFO] Frontend build not found. Compiling production bundle..."
    cd frontend
    npm install --legacy-peer-deps
    npm run build
    cd ..
  else
    echo "[INFO] Existing frontend production build detected at frontend/build/."
  fi
fi

# Step C: Start server
echo ""
echo "=============================================================================="
echo " [SUCCESS] System ready for launch!"
echo " Starting production server on http://localhost:3000 ..."
echo "=============================================================================="
node frontend/serve_build.js
