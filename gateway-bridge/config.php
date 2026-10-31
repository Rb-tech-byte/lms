<?php
/**
 * OUT LMS Gateway Bridge Configuration
 * PHP 8.3 Environment & Moodle Engine Settings
 */

// Load .env if present
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$name, $value] = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

return [
    'app_name' => 'OUT LMS Gateway Bridge (PHP)',
    'version' => '1.0.0',
    'environment' => $_ENV['APP_ENV'] ?? 'development',

    // Moodle 5.3 Backend Configuration
    'moodle' => [
        'base_url' => $_ENV['MOODLE_URL'] ?? 'http://localhost:8080/moodle',
        'ws_token' => $_ENV['MOODLE_WS_TOKEN'] ?? '',
        'service_name' => 'out_lms_service',
    ],

    // Pesapal API v3 Credentials
    'pesapal' => [
        'consumer_key' => $_ENV['PESAPAL_CONSUMER_KEY'] ?? '',
        'consumer_secret' => $_ENV['PESAPAL_CONSUMER_SECRET'] ?? '',
        'environment' => $_ENV['PESAPAL_ENVIRONMENT'] ?? 'sandbox',
        'ipn_id' => $_ENV['PESAPAL_IPN_ID'] ?? '',
        'api_url' => ($_ENV['PESAPAL_ENVIRONMENT'] ?? 'sandbox') === 'production'
            ? 'https://pay.pesapal.com/v3/api'
            : 'https://cybqa.pesapal.com/pesapalv3/api',
    ],

    // Selcom Paypoint Credentials
    'selcom' => [
        'api_key' => $_ENV['SELCOM_API_KEY'] ?? '',
        'api_secret' => $_ENV['SELCOM_API_SECRET'] ?? '',
        'vendor_id' => $_ENV['SELCOM_VENDOR_ID'] ?? '',
        'environment' => $_ENV['SELCOM_ENVIRONMENT'] ?? 'sandbox',
        'api_url' => ($_ENV['SELCOM_ENVIRONMENT'] ?? 'sandbox') === 'production'
            ? 'https://api.selcom.net/v1'
            : 'https://sandbox.selcom.net/v1',
    ],
];
