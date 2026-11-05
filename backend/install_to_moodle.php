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
if (file_exists(__DIR__ . DIRECTORY_SEPARATOR . 'instructor_storage.php')) {
    copy(__DIR__ . DIRECTORY_SEPARATOR . 'instructor_storage.php', $targetMoodle . DIRECTORY_SEPARATOR . 'instructor_storage.php');
}
if (file_exists(__DIR__ . DIRECTORY_SEPARATOR . 'instructor_storage.json')) {
    copy(__DIR__ . DIRECTORY_SEPARATOR . 'instructor_storage.json', $targetMoodle . DIRECTORY_SEPARATOR . 'instructor_storage.json');
}
if (file_exists(__DIR__ . DIRECTORY_SEPARATOR . 'openapi.json')) {
    copy(__DIR__ . DIRECTORY_SEPARATOR . 'openapi.json', $targetMoodle . DIRECTORY_SEPARATOR . 'openapi.json');
}
echo "[OK] Installed admin_api.php, sso.php, instructor_storage, and openapi.json\n";

// Also copy to public/ if Moodle 5.x router structure exists
if (is_dir($targetMoodle . DIRECTORY_SEPARATOR . 'public')) {
    copy(__DIR__ . DIRECTORY_SEPARATOR . 'admin_api.php', $targetMoodle . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'admin_api.php');
    copy(__DIR__ . DIRECTORY_SEPARATOR . 'sso.php', $targetMoodle . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'sso.php');
    if (file_exists(__DIR__ . DIRECTORY_SEPARATOR . 'instructor_storage.php')) {
        copy(__DIR__ . DIRECTORY_SEPARATOR . 'instructor_storage.php', $targetMoodle . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'instructor_storage.php');
    }
    if (file_exists(__DIR__ . DIRECTORY_SEPARATOR . 'instructor_storage.json')) {
        copy(__DIR__ . DIRECTORY_SEPARATOR . 'instructor_storage.json', $targetMoodle . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'instructor_storage.json');
    }
    if (file_exists(__DIR__ . DIRECTORY_SEPARATOR . 'openapi.json')) {
        copy(__DIR__ . DIRECTORY_SEPARATOR . 'openapi.json', $targetMoodle . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'openapi.json');
    }
    echo "[OK] Installed admin_api.php, sso.php, instructor_storage, and openapi.json to public/ webroot\n";
}

// 2. Overlay plugins into Moodle directory structure
$pluginsSrc = __DIR__ . DIRECTORY_SEPARATOR . 'plugins';

$mappings = [
    'payment/gateway/pesapal' => 'payment/gateway/pesapal',
    'payment/gateway/selcom'  => 'payment/gateway/selcom',
    'local/outlms_bridge'     => 'local/outlms_bridge',
    'blocks/completion_progress' => 'blocks/completion_progress',
    'blocks/xp'               => 'blocks/xp',
    'mod/customcert'          => 'mod/customcert',
    'mod/reengagement'        => 'mod/reengagement',
    'mod/attendance'          => 'mod/attendance',
    'mod/vpl'                 => 'mod/vpl',
    'course/format/tiles'     => 'course/format/tiles',
    'course/format/onetopic'  => 'course/format/onetopic',
    'course/format/topcoll'   => 'course/format/topcoll',
    'question/type/coderunner'=> 'question/type/coderunner',
];

foreach ($mappings as $srcSub => $dstSub) {
    $from = $pluginsSrc . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $srcSub);
    $to = $targetMoodle . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $dstSub);
    if (is_dir($from)) {
        copyFolder($from, $to);
        echo "[OK] Installed plugin: {$dstSub}\n";
    }
    // Also copy to public/ if Moodle 5.x router structure exists
    if (is_dir($targetMoodle . DIRECTORY_SEPARATOR . 'public')) {
        $toPublic = $targetMoodle . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $dstSub);
        if (is_dir($from)) {
            copyFolder($from, $toPublic);
            echo "[OK] Installed plugin to public: {$dstSub}\n";
        }
    }
}

// 3. PHP 8.2 Compatibility Patch: normalize PHP 8.3 typed constants if running under PHP < 8.3
if (PHP_VERSION_ID < 80300) {
    $scanDirs = [
        $targetMoodle . DIRECTORY_SEPARATOR . 'public',
        $targetMoodle . DIRECTORY_SEPARATOR . 'lib'
    ];
    foreach ($scanDirs as $sDir) {
        if (!is_dir($sDir)) continue;
        $dirIter = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($sDir));
        foreach ($dirIter as $f) {
            if ($f->isFile() && $f->getExtension() === 'php') {
                $p = $f->getRealPath();
                $c = file_get_contents($p);
                $nc = preg_replace('/\b(public|protected|private)\s+const\s+(string|int|bool|float|array)\s+/', '$1 const ', $c);
                if ($nc !== $c) {
                    file_put_contents($p, $nc);
                }
            }
        }
    }
    echo "[OK] Applied PHP 8.2 typed constants compatibility patch\n";
}

echo "[SUCCESS] All OUT LMS backend enhancements successfully deployed to Moodle!\n";

