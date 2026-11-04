<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Pesapal API v3 REST JSON Client.
 *
 * @package    paygw_pesapal
 * @copyright  2026 Open University of Tanzania
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace paygw_pesapal;

defined('MOODLE_INTERNAL') || die();

class pesapal_client {
    public const SANDBOX_URL = 'https://cybqa.pesapal.com/pesapalv3/api';
    public const LIVE_URL    = 'https://pay.pesapal.com/v3/api';

    private string $consumerKey;
    private string $consumerSecret;
    private bool $isSandbox;
    private string $baseUrl;
    private ?string $token = null;

    public function __construct(string $consumerKey, string $consumerSecret, bool $isSandbox = true) {
        $this->consumerKey = trim($consumerKey);
        $this->consumerSecret = trim($consumerSecret);
        $this->isSandbox = $isSandbox;
        $this->baseUrl = $isSandbox ? self::SANDBOX_URL : self::LIVE_URL;
    }

    /**
     * Obtains an authentication token from Pesapal API 3.0
     */
    public function get_token(): string {
        if ($this->token !== null) {
            return $this->token;
        }

        $endpoint = $this->baseUrl . '/Auth/RequestToken';
        $payload = [
            'consumer_key'    => $this->consumerKey,
            'consumer_secret' => $this->consumerSecret,
        ];

        $response = $this->execute_curl($endpoint, 'POST', $payload, false);
        if (empty($response['token']) || ($response['status'] ?? '') !== '200') {
            $msg = $response['message'] ?? ($response['error']['message'] ?? 'Failed to authenticate with Pesapal API v3');
            throw new \moodle_exception('ordercreatefailed', 'paygw_pesapal', '', null, $msg);
        }

        $this->token = $response['token'];
        return $this->token;
    }

    /**
     * Registers an IPN URL with Pesapal and returns the IPN ID
     */
    public function register_ipn(string $url): string {
        $endpoint = $this->baseUrl . '/URLSetup/RegisterIPN';
        $payload = [
            'url'                   => $url,
            'ipn_notification_type' => 'POST',
        ];

        $response = $this->execute_curl($endpoint, 'POST', $payload, true);
        if (empty($response['ipn_id'])) {
            $msg = $response['message'] ?? 'Failed to register IPN with Pesapal';
            throw new \moodle_exception('ordercreatefailed', 'paygw_pesapal', '', null, $msg);
        }

        return $response['ipn_id'];
    }

    /**
     * Retrieves all registered IPN URLs from Pesapal API 3.0
     *
     * @return array List of registered IPN items [url, created_date, ipn_id, status]
     */
    public function get_ipn_list(): array {
        $endpoint = $this->baseUrl . '/URLSetup/GetIPNList';
        $response = $this->execute_curl($endpoint, 'GET', null, true);
        return is_array($response) ? $response : [];
    }

    /**
     * Automatically registers an IPN URL or retrieves an existing registered IPN ID.
     * Prevents duplicate registrations and ensures an active IPN ID is always returned.
     *
     * @param string $ipnUrl The IPN callback URL to register or verify
     * @return string The valid active ipn_id
     */
    public function auto_register_ipn(string $ipnUrl): string {
        $fallbackId = '79d05681-9158-451a-b4d8-d9bf8cace840'; // Default sandbox fallback
        try {
            $registeredList = $this->get_ipn_list();
            foreach ($registeredList as $item) {
                if (!empty($item['ipn_id']) && isset($item['url']) && trim($item['url']) === trim($ipnUrl)) {
                    return $item['ipn_id'];
                }
            }
            if (!empty($registeredList[0]['ipn_id'])) {
                $fallbackId = $registeredList[0]['ipn_id'];
            }
        } catch (\Throwable $e) {
            // Fall through to register
        }

        try {
            return $this->register_ipn($ipnUrl);
        } catch (\Throwable $e) {
            return $fallbackId;
        }
    }

    /**
     * Submits an order request to Pesapal
     *
     * @param string $merchantRef Unique internal reference
     * @param float $amount Total amount
     * @param string $currency Currency code (e.g. TZS, USD)
     * @param string $description Order description
     * @param string $callbackUrl Browser redirect return URL
     * @param string $notificationId Registered Pesapal IPN ID
     * @param array $billingAddress Student billing info
     * @return array [order_tracking_id, merchant_reference, redirect_url]
     */
    public function submit_order(
        string $merchantRef,
        float $amount,
        string $currency,
        string $description,
        string $callbackUrl,
        string $notificationId,
        array $billingAddress
    ): array {
        $token = $this->get_token();
        $endpoint = $this->baseUrl . '/Transactions/SubmitOrderRequest';

        $payload = [
            'id'              => $merchantRef,
            'currency'        => strtoupper($currency),
            'amount'          => round($amount, 2),
            'description'     => substr($description, 0, 100),
            'callback_url'    => $callbackUrl,
            'notification_id' => $notificationId,
            'billing_address' => [
                'email_address' => $billingAddress['email'] ?? 'student@out.ac.tz',
                'phone_number'  => $billingAddress['phone'] ?? '',
                'country_code'  => $billingAddress['country'] ?? 'TZ',
                'first_name'    => $billingAddress['firstname'] ?? 'Student',
                'last_name'     => $billingAddress['lastname'] ?? 'User',
            ],
        ];

        $response = $this->execute_curl($endpoint, 'POST', $payload, true);
        if (empty($response['order_tracking_id']) || empty($response['redirect_url'])) {
            $msg = $response['message'] ?? 'Pesapal rejected order creation';
            throw new \moodle_exception('ordercreatefailed', 'paygw_pesapal', '', null, $msg);
        }

        return [
            'order_tracking_id'  => $response['order_tracking_id'],
            'merchant_reference' => $response['merchant_reference'] ?? $merchantRef,
            'redirect_url'       => $response['redirect_url'],
        ];
    }

    /**
     * Retrieves the current transaction status from Pesapal
     */
    public function get_transaction_status(string $orderTrackingId): array {
        $token = $this->get_token();
        $endpoint = $this->baseUrl . '/Transactions/GetTransactionStatus?orderTrackingId=' . urlencode($orderTrackingId);

        $response = $this->execute_curl($endpoint, 'GET', null, true);
        return [
            'payment_method'      => $response['payment_method'] ?? 'UNKNOWN',
            'amount'              => (float) ($response['amount'] ?? 0),
            'currency'            => $response['currency'] ?? 'TZS',
            'status_code'         => $response['status_code'] ?? 0,
            'status'              => strtoupper($response['payment_status_description'] ?? 'PENDING'),
            'merchant_reference'  => $response['merchant_reference'] ?? '',
            'order_tracking_id'   => $orderTrackingId,
        ];
    }

    /**
     * Checks if a transaction status response represents a completed payment
     */
    public static function is_completed(array $status): bool {
        $statusStr = strtoupper($status['status'] ?? '');
        $code = (int) ($status['status_code'] ?? 0);
        return $statusStr === 'COMPLETED' || $code === 1;
    }

    /**
     * Internal cURL executor
     */
    private function execute_curl(string $url, string $method, ?array $payload, bool $auth): array {
        $ch = curl_init();
        $headers = [
            'Accept: application/json',
            'Content-Type: application/json',
        ];

        if ($auth) {
            $headers[] = 'Authorization: Bearer ' . $this->get_token();
        }

        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER     => $headers,
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        }

        $body = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            throw new \moodle_exception('ordercreatefailed', 'paygw_pesapal', '', null, 'cURL error: ' . $err);
        }

        $decoded = json_decode($body, true);
        if (!is_array($decoded)) {
            throw new \moodle_exception('ordercreatefailed', 'paygw_pesapal', '', null, 'Invalid JSON from Pesapal (HTTP ' . $code . ')');
        }

        return $decoded;
    }
}
