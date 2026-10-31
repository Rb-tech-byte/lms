<?php
/**
 * OUT LMS Gateway Bridge (PHP 8.3)
 * Front Controller & REST Router
 */

// Set JSON and CORS headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Autoload classes
spl_autoload_register(function ($class) {
    $prefix = 'OutLms\\Gateway\\';
    $baseDir = __DIR__ . '/src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

use OutLms\Gateway\Services\MoodleClient;
use OutLms\Gateway\Controllers\AuthController;
use OutLms\Gateway\Controllers\PaymentController;

$config = require __DIR__ . '/config.php';
$moodle = new MoodleClient($config['moodle']['base_url'], $config['moodle']['ws_token']);
$auth = new AuthController($config);
$payment = new PaymentController($config, $moodle);

// Parse URI path
$rawUri = $_SERVER['REQUEST_URI'] ?? '/health';
$requestUri = parse_url($rawUri, PHP_URL_PATH) ?? '/health';

// Normalize path: strip script directory if present
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$scriptDir = $scriptName ? dirname($scriptName) : '/';
if ($scriptDir !== '/' && str_starts_with($requestUri, $scriptDir)) {
    $requestUri = substr($requestUri, strlen($scriptDir));
}
$path = trim($requestUri, '/');
if (str_starts_with($path, 'api/')) {
    $path = substr($path, 4);
}

// Read JSON input payload
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

try {
    // Router
    switch (true) {
        // Health check
        case $path === '' || $path === 'health':
            echo json_encode([
                'status' => 'ONLINE',
                'service' => 'OUT LMS Gateway Bridge (PHP 8.3)',
                'php_version' => PHP_VERSION,
                'moodle_backend' => $config['moodle']['base_url'],
                'timestamp' => date('c'),
            ]);
            break;

        // User Login
        case $path === 'auth/login' && $method === 'POST':
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';
            echo json_encode($auth->login($username, $password));
            break;

        // Payment: Create Order
        case $path === 'payment/create-order' && $method === 'POST':
            echo json_encode($payment->createOrder($input));
            break;

        // Payment: Pesapal IPN
        case $path === 'payment/pesapal/ipn' && $method === 'POST':
            echo json_encode($payment->handlePesapalIpn($input));
            break;

        // Payment: Selcom Webhook
        case $path === 'payment/selcom/webhook' && $method === 'POST':
            echo json_encode($payment->handleSelcomWebhook($input));
            break;

        // Payment: Check Status
        case preg_match('#^payment/status/(.+)$#', $path, $matches):
            echo json_encode($payment->getOrderStatus($matches[1]));
            break;

        default:
            http_response_code(404);
            echo json_encode([
                'error' => 'Not Found',
                'path' => $path,
                'method' => $method,
            ]);
            break;
    }
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine(),
    ]);
}
