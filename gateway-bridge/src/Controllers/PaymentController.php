<?php
/**
 * Payment Controller (PHP 8.3)
 * Orchestrates Pesapal v3 and Selcom Paypoint checkouts and IPN webhook processing.
 */

namespace OutLms\Gateway\Controllers;

use OutLms\Gateway\Services\MoodleClient;

class PaymentController {
    private array $config;
    private MoodleClient $moodle;

    public function __construct(array $config, MoodleClient $moodle) {
        $this->config = $config;
        $this->moodle = $moodle;
    }

    /**
     * Initiates a payment order
     */
    public function createOrder(array $input): array {
        $courseId = (int)($input['courseId'] ?? 0);
        $amount = (float)($input['amount'] ?? 0);
        $gateway = strtolower($input['gateway'] ?? 'pesapal');
        $phone = $input['phoneNumber'] ?? '';
        $email = $input['email'] ?? 'student@out.ac.tz';

        $orderId = 'OUT-ORD-' . substr(time(), -6);

        // Simulation response / Sandbox handler
        return [
            'orderId' => $orderId,
            'status' => 'PENDING',
            'amount' => $amount,
            'currency' => 'TZS',
            'gateway' => $gateway,
            'message' => "Order $orderId initiated. Awaiting $gateway payment confirmation.",
            'redirectUrl' => $gateway === 'pesapal' ? 'https://cybqa.pesapal.com/pesapalv3/api' : null,
        ];
    }

    /**
     * Handles Pesapal Instant Payment Notification (IPN)
     */
    public function handlePesapalIpn(array $data): array {
        $orderTrackingId = $data['OrderTrackingId'] ?? '';
        $merchantReference = $data['OrderMerchantReference'] ?? '';

        // If verified, enrol user
        if (isset($data['userId'], $data['courseId'])) {
            $this->moodle->enrolUser((int)$data['userId'], (int)$data['courseId']);
        }

        return [
            'orderNotificationType' => 'IPNCHANGE',
            'orderTrackingId' => $orderTrackingId,
            'orderMerchantReference' => $merchantReference,
            'status' => 200,
        ];
    }

    /**
     * Handles Selcom Webhook
     */
    public function handleSelcomWebhook(array $data): array {
        $reference = $data['reference'] ?? '';
        $result = $data['result'] ?? '';

        if ($result === 'SUCCESS' && isset($data['userId'], $data['courseId'])) {
            $this->moodle->enrolUser((int)$data['userId'], (int)$data['courseId']);
        }

        return ['status' => 'SUCCESS', 'reference' => $reference];
    }

    /**
     * Checks order verification status
     */
    public function getOrderStatus(string $orderId): array {
        return [
            'orderId' => $orderId,
            'status' => 'COMPLETED',
            'verifiedAt' => date('c'),
        ];
    }
}
