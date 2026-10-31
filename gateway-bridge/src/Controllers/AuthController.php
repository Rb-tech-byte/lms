<?php
/**
 * Authentication Controller (PHP 8.3)
 * Exchanges user credentials with Moodle /login/token.php.
 */

namespace OutLms\Gateway\Controllers;

class AuthController {
    private array $config;

    public function __construct(array $config) {
        $this->config = $config;
    }

    public function login(string $username, string $password): array {
        $tokenUrl = rtrim($this->config['moodle']['base_url'], '/') . '/login/token.php';
        
        $params = [
            'service' => $this->config['moodle']['service_name'],
            'username' => $username,
            'password' => $password,
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $tokenUrl . '?' . http_build_query($params),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \RuntimeException("cURL error contacting Moodle Auth: " . $error);
        }

        $decoded = json_decode($response, true);
        if (isset($decoded['error'])) {
            return ['success' => false, 'error' => $decoded['error']];
        }

        return ['success' => true, 'token' => $decoded['token'] ?? ''];
    }
}
