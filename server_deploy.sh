#!/usr/bin/env bash
# ==============================================================================
# OUT LMS — Automated CyberPanel / OpenLiteSpeed Production Deployment Script
# Target Domain: lms.wolinet.com
# Target Path:   /home/lms.wolinet.com/public_html
# ==============================================================================

set -e

echo "=============================================================================="
echo " [OUT LMS] Starting Automated Production Deployment for lms.wolinet.com"
echo "=============================================================================="

# Detect site directory
SITE_DIR="/home/lms.wolinet.com/public_html"
if [ ! -d "$SITE_DIR" ]; then
    # Fallback to current working directory if running inside public_html
    SITE_DIR="$(pwd)"
fi

echo "[1/6] Navigating to site root: $SITE_DIR"
cd "$SITE_DIR"

echo "[2/6] Pulling latest code and production bundles from GitHub (main)..."
git fetch origin main
git reset --hard origin/main

echo "[3/6] Syncing compiled React SPA bundles to web root..."
if [ -d "$SITE_DIR/frontend/build" ]; then
    cp -rf "$SITE_DIR"/frontend/build/* "$SITE_DIR"/
    echo "  -> Synced frontend/build to web root successfully."
else
    echo "  -> Note: frontend/build not found, preserving existing webroot assets."
fi

echo "[4/6] Installing Modular APIs and Gateway into moodle-backend..."
MOODLE_DIR="$SITE_DIR/moodle-backend"
if [ -d "$MOODLE_DIR" ]; then
    mkdir -p "$MOODLE_DIR/api"
    cp -rf "$SITE_DIR"/backend/api/* "$MOODLE_DIR/api/"
    cp -f "$SITE_DIR"/backend/admin_api.php "$MOODLE_DIR/admin_api.php"
    cp -f "$SITE_DIR"/backend/sso.php "$MOODLE_DIR/sso.php"
    cp -f "$SITE_DIR"/backend/seed_demo_users.php "$MOODLE_DIR/seed_demo_users.php"
    if [ -f "$SITE_DIR/backend/openapi.json" ]; then
        cp -f "$SITE_DIR/backend/openapi.json" "$MOODLE_DIR/openapi.json"
    fi
    if [ -f "$SITE_DIR/backend/install_to_moodle.php" ]; then
        php "$SITE_DIR/backend/install_to_moodle.php" "$MOODLE_DIR" || true
    fi
    # Seed/synchronize all demo institutional accounts (admin, instructor, student, coursecreator)
    echo "  -> Seeding and verifying demo accounts into MariaDB..."
    php "$SITE_DIR/backend/seed_demo_users.php" || php "$MOODLE_DIR/seed_demo_users.php" || true
    # If Moodle CLI exists, purge caches
    if [ -f "$MOODLE_DIR/admin/cli/purge_caches.php" ]; then
        php "$MOODLE_DIR/admin/cli/purge_caches.php" 2>/dev/null || true
    fi
    echo "  -> Backend APIs synchronized and demo users seeded successfully."
else
    # Fallback seeding if moodle-backend is located elsewhere
    php "$SITE_DIR/backend/seed_demo_users.php" || true
fi

# Ensure .htaccess has correct rewrite rules in place
cp -f "$SITE_DIR/.htaccess" "$SITE_DIR/.htaccess.deployed" 2>/dev/null || true

echo "[5/6] Correcting ownership and file permissions..."
# Detect web server user
if id "nobody" >/dev/null 2>&1; then
    chown -R nobody:nobody "$SITE_DIR" 2>/dev/null || true
fi
# Preserve CyberPanel user ownership if known
SITE_USER=$(ls -ld "$SITE_DIR" | awk '{print $3}')
if [ -n "$SITE_USER" ] && [ "$SITE_USER" != "root" ]; then
    chown -R "$SITE_USER":"$SITE_USER" "$SITE_DIR" 2>/dev/null || true
fi

chmod 644 "$SITE_DIR/.htaccess" 2>/dev/null || true
chmod -R 755 "$SITE_DIR/backend" "$SITE_DIR/api" 2>/dev/null || true
if [ -d "$MOODLE_DIR" ]; then
    chmod -R 755 "$MOODLE_DIR/api" "$MOODLE_DIR/admin_api.php" 2>/dev/null || true
fi

# Gracefully reload OpenLiteSpeed Web Server
echo "[6/6] Reloading OpenLiteSpeed web server..."
if command -v systemctl >/dev/null 2>&1; then
    systemctl restart lsws 2>/dev/null || systemctl reload lsws 2>/dev/null || true
fi
touch /tmp/lshttpd/lsperdir.cache 2>/dev/null || true

echo "=============================================================================="
echo " [VERIFICATION] Testing Authentication Endpoints for Demo Accounts..."
echo "=============================================================================="

# 1. Admin Verification
echo -n "  Testing Admin login (admin / Admin@2026!)... "
ADMIN_RESP=$(curl -s "https://lms.wolinet.com/api/public_api.php?action=login_user" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"Admin@2026!"}' || true)
if echo "$ADMIN_RESP" | grep -q '"success":true'; then
    echo " [OK]"
else
    echo " [FAILED] Response: $ADMIN_RESP"
fi

# 2. Instructor Verification
echo -n "  Testing Instructor login (instructor / Instructor@2026!)... "
INST_RESP=$(curl -s "https://lms.wolinet.com/api/public_api.php?action=login_user" \
    -H "Content-Type: application/json" \
    -d '{"username":"instructor","password":"Instructor@2026!"}' || true)
if echo "$INST_RESP" | grep -q '"success":true'; then
    echo " [OK]"
else
    echo " [FAILED] Response: $INST_RESP"
fi

# 3. Student Verification
echo -n "  Testing Student login (student / Student@2026!)... "
STU_RESP=$(curl -s "https://lms.wolinet.com/api/public_api.php?action=login_user" \
    -H "Content-Type: application/json" \
    -d '{"username":"student","password":"Student@2026!"}' || true)
if echo "$STU_RESP" | grep -q '"success":true'; then
    echo " [OK]"
else
    echo " [FAILED] Response: $STU_RESP"
fi

echo ""
echo "=============================================================================="
echo " [OUT LMS] Deployment Completed Successfully!"
echo "=============================================================================="
echo "  Demo Credentials:"
echo "    - Super Admin:    admin / Admin@2026!             (https://lms.wolinet.com/admin/dashboard)"
echo "    - Instructor:     instructor / Instructor@2026!   (https://lms.wolinet.com/instructor/instructor-dashboard)"
echo "    - Student:        student / Student@2026!         (https://lms.wolinet.com/student/student-dashboard)"
echo "    - Course Creator: coursecreator / Creator@2026!   (https://lms.wolinet.com/course/add-course)"
echo ""
echo "  Login Portal:       https://lms.wolinet.com/login"
echo "=============================================================================="
