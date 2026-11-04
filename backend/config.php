<?php  // Moodle configuration file
// Enterprise Dynamic & Environment-Aware Configuration
// (No hardcoded paths or environment-specific URLs)

unset($CFG);
global $CFG;
$CFG = new stdClass();

// Optional: Load .env file if available in project root or moodle-backend
$envFile = __DIR__ . '/.env';
if (!file_exists($envFile)) {
    $envFile = dirname(__DIR__) . '/.env';
}
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val, " \t\n\r\0\x0B\"'");
            if (!getenv($key) && !isset($_SERVER[$key])) {
                putenv("{$key}={$val}");
                $_ENV[$key] = $val;
                $_SERVER[$key] = $val;
            }
        }
    }
}

// -----------------------------------------------------------------------------
// Database Configuration
// -----------------------------------------------------------------------------
$CFG->dbtype    = getenv('MOODLE_DB_TYPE') ?: 'mariadb';
$CFG->dblibrary = 'native';
$CFG->dbhost    = getenv('MOODLE_DB_HOST') ?: '127.0.0.1';
$CFG->dbname    = getenv('MOODLE_DB_NAME') ?: 'moodle_out';
$CFG->dbuser    = getenv('MOODLE_DB_USER') ?: 'root';
$CFG->dbpass    = getenv('MOODLE_DB_PASS') !== false ? (string)getenv('MOODLE_DB_PASS') : '';
$CFG->prefix    = getenv('MOODLE_DB_PREFIX') ?: 'mdl_';

$CFG->dboptions = [
    'dbpersist'   => 0,
    'dbport'      => getenv('MOODLE_DB_PORT') ? (int)getenv('MOODLE_DB_PORT') : 3307,
    'dbsocket'    => getenv('MOODLE_DB_SOCKET') ?: '',
    'dbcollation' => getenv('MOODLE_DB_COLLATION') ?: 'utf8mb4_unicode_ci',
];

// -----------------------------------------------------------------------------
// Dynamic URL (wwwroot) Resolution
// -----------------------------------------------------------------------------
$envWwwroot = getenv('MOODLE_WWWROOT') ?: getenv('APP_URL');
if (!empty($envWwwroot)) {
    $CFG->wwwroot = rtrim($envWwwroot, '/');
} else {
    // Dynamically calculate relative web path from DOCUMENT_ROOT or directory structure
    $webPath = '';
    $normalizedDir = str_replace('\\', '/', realpath(__DIR__) ?: __DIR__);

    if (!empty($_SERVER['DOCUMENT_ROOT'])) {
        $normalizedDocRoot = str_replace('\\', '/', realpath($_SERVER['DOCUMENT_ROOT']) ?: $_SERVER['DOCUMENT_ROOT']);
        if (str_starts_with($normalizedDir, $normalizedDocRoot)) {
            $webPath = substr($normalizedDir, strlen($normalizedDocRoot));
        }
    }

    if (empty($webPath)) {
        // In CLI or custom webserver setups, detect relative path from standard webroot indicators
        if (preg_match('#/(?:www|public_html|htdocs|html)(/.*)$#i', $normalizedDir, $matches)) {
            $webPath = $matches[1];
        }
    }

    $webPath = '/' . trim(str_replace('\\', '/', $webPath), '/');
    if ($webPath === '/') {
        $webPath = '';
    }

    if (isset($_SERVER['HTTP_HOST'])) {
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
            || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
        $protocol = $isHttps ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'];
        $CFG->wwwroot = rtrim("{$protocol}{$host}{$webPath}", '/');
    } else {
        // CLI fallback
        $CFG->wwwroot = rtrim("http://localhost{$webPath}", '/');
    }
}

// -----------------------------------------------------------------------------
// Dynamic Data Directory (dataroot) Resolution
// -----------------------------------------------------------------------------
$envDataroot = getenv('MOODLE_DATAROOT');
if (!empty($envDataroot) && (is_dir($envDataroot) || @mkdir($envDataroot, 0777, true))) {
    $CFG->dataroot = realpath($envDataroot) ?: $envDataroot;
} else {
    // Automatically search parent directories for moodledata outside web root
    $candidates = [
        dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . 'moodledata',
        dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'moodledata',
        dirname(__DIR__, 1) . DIRECTORY_SEPARATOR . 'moodledata',
    ];
    $resolvedDataroot = null;
    foreach ($candidates as $candidate) {
        if (is_dir($candidate)) {
            $resolvedDataroot = realpath($candidate) ?: $candidate;
            break;
        }
    }
    if (!$resolvedDataroot) {
        $defaultDir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'moodledata';
        if (!is_dir($defaultDir)) {
            @mkdir($defaultDir, 0777, true);
        }
        $resolvedDataroot = realpath($defaultDir) ?: $defaultDir;
    }
    $CFG->dataroot = $resolvedDataroot;
}

$CFG->admin     = 'admin';
$CFG->directorypermissions = 02777;
$CFG->routerconfigured = true;

// Clean error reporting
$CFG->debug = E_ALL;
$CFG->debugdisplay = 0;

require_once(__DIR__ . '/lib/setup.php');

// There is no php closing tag in this file,
// it is intentional because it prevents trailing whitespace problems!
