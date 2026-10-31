<?php
/**
 * Moodle Web Services API Client (PHP 8.3 cURL)
 * Handles server-to-server calls between the Gateway Bridge and Moodle 5.x.
 */

namespace OutLms\Gateway\Services;

class MoodleClient {
    private string $baseUrl;
    private string $token;

    public function __construct(string $baseUrl, string $token) {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->token = $token;
    }

    /**
     * Executes a Moodle Web Service function call
     */
    public function call(string $wsfunction, array $params = []): array {
        $serverUrl = $this->baseUrl . '/webservice/rest/server.php';

        $payload = array_merge([
            'wstoken' => $this->token,
            'wsfunction' => $wsfunction,
            'moodlewsrestformat' => 'json',
        ], $params);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $serverUrl,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($payload),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \RuntimeException("cURL error contacting Moodle: " . $error);
        }

        $decoded = json_decode($response, true);
        if ($httpCode >= 400 || (is_array($decoded) && isset($decoded['exception']))) {
            $msg = $decoded['message'] ?? "Moodle API returned HTTP $httpCode";
            throw new \RuntimeException($msg);
        }

        return $decoded ?? [];
    }

    /**
     * Auto-enrols a student into a Moodle course
     */
    public function enrolUser(int $userId, int $courseId, int $roleId = 5): bool {
        $params = [
            'enrolments' => [
                [
                    'roleid' => $roleId,
                    'userid' => $userId,
                    'courseid' => $courseId,
                ]
            ]
        ];

        $this->call('enrol_manual_enrol_users', $params);
        return true;
    }
}
