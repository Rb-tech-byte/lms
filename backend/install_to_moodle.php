<?php
/**
 * OUT LMS - Backend Plugin Installer & Overlay Tool
 * The Open University of Tanzania Learning Management System
 * 
 * Injects custom OUT LMS APIs, payment gateways, and blocks into any Moodle 4.x / 5.x installation.
 * 
 * Usage:
 *   php backend/install_to_moodle.php [path_to_moodle]
 *   php backend/install_to_moodle.php /var/www/html/moodle
 */

declare(strict_types=1);

$targetMoodle = $argv[1] ?? getenv('MOODLE_DIR') ?: dirname(__DIR__) . DIRECTORY_SEPARATOR . 'moodle-backend';

if (!is_dir($targetMoodle)) {
    echo "[INFO] Target Moodle directory not found at: {$targetMoodle}\n";
    echo "       Please provide your Moodle directory path as argument: php backend/install_to_moodle.php <moodle_dir>\n";
    exit(1);
}

echo "[INFO] Installing OUT LMS custom APIs and plugins into: {$targetMoodle}\n";

function copyFolder(string $src, string $dst): void {
    if (!is_dir($src)) return;
    if (!is_dir($dst)) @mkdir($dst, 0777, true);
    foreach (scandir($src) as $file) {
        if ($file === '.' || $file === '..') continue;
        $srcPath = $src . DIRECTORY_SEPARATOR . $file;
        $dstPath = $dst . DIRECTORY_SEPARATOR . $file;
        if (is_dir($srcPath)) {
            copyFolder($srcPath, $dstPath);
        } else {
            copy($srcPath, $dstPath);
        }
    }
}

// 1. Copy core entry APIs
copy(__DIR__ . DIRECTORY_SEPARATOR . 'admin_api.php', $targetMoodle . DIRECTORY_SEPARATOR . 'admin_api.php');
copy(__DIR__ . DIRECTORY_SEPARATOR . 'sso.php', $targetMoodle . DIRECTORY_SEPARATOR . 'sso.php');
echo "[OK] Installed admin_api.php and sso.php\n";

// Also copy to public/ if Moodle 5.x router structure exists
if (is_dir($targetMoodle . DIRECTORY_SEPARATOR . 'public')) {
    copy(__DIR__ . DIRECTORY_SEPARATOR . 'admin_api.php', $targetMoodle . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'admin_api.php');
    copy(__DIR__ . DIRECTORY_SEPARATOR . 'sso.php', $targetMoodle . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'sso.php');
    echo "[OK] Installed admin_api.php and sso.php to public/ webroot\n";
}

// 2. Overlay plugins into Moodle directory structure
$pluginsSrc = __DIR__ . DIRECTORY_SEPARATOR . 'plugins';
$moodleRoot = is_dir($targetMoodle . DIRECTORY_SEPARATOR . 'public') ? $targetMoodle . DIRECTORY_SEPARATOR . 'public' : $targetMoodle;

$mappings = [
    'payment/gateway/pesapal' => 'payment/gateway/pesapal',
    'payment/gateway/selcom'  => 'payment/gateway/selcom',
    'payment/gateway/stripe'  => 'payment/gateway/stripe',
    'local/outlms_bridge'     => 'local/outlms_bridge',
    'blocks/completion_progress' => 'blocks/completion_progress',
    'blocks/xp'               => 'blocks/xp',
    'mod/customcert'          => 'mod/customcert',
    'mod/reengagement'        => 'mod/reengagement',
];

foreach ($mappings as $srcSub => $dstSub) {
    $from = $pluginsSrc . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $srcSub);
    $to = $moodleRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $dstSub);
    if (is_dir($from)) {
        copyFolder($from, $to);
        echo "[OK] Installed plugin: {$dstSub}\n";
    }
}

echo "[SUCCESS] All OUT LMS backend enhancements successfully deployed to Moodle!\n";
