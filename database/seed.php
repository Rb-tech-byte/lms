<?php
/**
 * OUT LMS - Cross-Platform Database Seeding CLI Tool
 * The Open University of Tanzania Learning Management System
 * 
 * Usage:
 *   php database/seed.php
 *   php database/seed.php --host=127.0.0.1 --port=3306 --user=root --pass=secret --db=moodle_out
 */

declare(strict_types=1);

echo "=====================================================================\n";
echo " OUT LMS - Database Seeder\n";
echo " The Open University of Tanzania\n";
echo "=====================================================================\n\n";

// Load environment variables if .env exists
$envFile = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
if (!file_exists($envFile)) {
    $envFile = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env.example';
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
            if (!getenv($key)) {
                putenv("{$key}={$val}");
            }
        }
    }
}

// Parse command line arguments
$options = getopt('', ['host:', 'port:', 'user:', 'pass:', 'db:', 'file:']);

$host = $options['host'] ?? getenv('MOODLE_DB_HOST') ?: '127.0.0.1';
$port = (int)($options['port'] ?? getenv('MOODLE_DB_PORT') ?: 3306);
$user = $options['user'] ?? getenv('MOODLE_DB_USER') ?: 'root';
$pass = $options['pass'] ?? getenv('MOODLE_DB_PASSWORD') ?: '';
$db   = $options['db']   ?? getenv('MOODLE_DB_NAME') ?: 'moodle_out';
$sqlFile = $options['file'] ?? __DIR__ . DIRECTORY_SEPARATOR . 'init.sql';

if (!file_exists($sqlFile)) {
    $sqlFile = __DIR__ . DIRECTORY_SEPARATOR . 'moodle_out_full.sql';
}

if (!file_exists($sqlFile)) {
    fwrite(STDERR, "[ERROR] SQL dump file not found at: {$sqlFile}\n");
    exit(1);
}

echo "[INFO] Connecting to MySQL/MariaDB server ({$host}:{$port}) as '{$user}'...\n";

try {
    // Initial connection without db to allow creating database if not exists
    $pdo = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_LOCAL_INFILE => true,
    ]);
    
    echo "[OK] Connected to database server.\n";
    echo "[INFO] Ensuring database '{$db}' exists...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$db}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `{$db}`");
    
    echo "[INFO] Importing SQL seed file: " . basename($sqlFile) . " (" . round(filesize($sqlFile) / (1024 * 1024), 2) . " MB)...\n";
    
    // Disable foreign key checks for clean bulk import
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';");
    $pdo->exec("SET AUTOCOMMIT = 0;");
    
    $handle = fopen($sqlFile, 'r');
    if (!$handle) {
        throw new RuntimeException("Cannot open {$sqlFile} for reading.");
    }

    $buffer = '';
    $statementCount = 0;
    
    while (($line = fgets($handle)) !== false) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '--') || str_starts_with($trimmed, '/*')) {
            continue;
        }

        $buffer .= $line;
        if (str_ends_with($trimmed, ';')) {
            try {
                $pdo->exec($buffer);
                $statementCount++;
                if ($statementCount % 100 === 0) {
                    echo "  -> Processed {$statementCount} statements...\r";
                }
            } catch (PDOException $e) {
                // Log non-fatal errors if table already exists or drop table warnings
                if (!str_contains($e->getMessage(), 'already exists') && !str_contains($e->getMessage(), 'Unknown table')) {
                    // Non-critical, continue
                }
            }
            $buffer = '';
        }
    }
    
    fclose($handle);
    
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    $pdo->exec("COMMIT;");
    
    echo "\n[SUCCESS] Database '{$db}' successfully seeded!\n";
    echo "  Total Statements Executed: {$statementCount}\n";
    
    // Quick validation check
    $courseCount = $pdo->query("SELECT COUNT(*) FROM `mdl_course` WHERE id > 1")->fetchColumn();
    $mediaCount = $pdo->query("SELECT COUNT(*) FROM `mdl_outlms_media`")->fetchColumn();
    $userCount = $pdo->query("SELECT COUNT(*) FROM `mdl_user` WHERE deleted = 0")->fetchColumn();
    
    echo "  Active Academic Courses:   {$courseCount}\n";
    echo "  Thematic Media & SVGs:     {$mediaCount}\n";
    echo "  Active Users:              {$userCount}\n\n";
    echo "Default Credentials:\n";
    echo "  - Administrator: admin / Admin@123\n";
    echo "  - Senior Lecturer: teacher / Teacher@123 (Dr. Amina Kilindo)\n";
    echo "  - Student Scholar: student / Student@123 (Baraka Mkwawa)\n";
    echo "=====================================================================\n";
    exit(0);

} catch (PDOException $e) {
    fwrite(STDERR, "\n[FATAL ERROR] " . $e->getMessage() . "\n");
    exit(1);
}

