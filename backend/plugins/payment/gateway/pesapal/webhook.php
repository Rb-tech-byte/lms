<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Pesapal Instant Payment Notification (IPN) Webhook Listener.
 *
 * @package    paygw_pesapal
 * @copyright  2026 Open University of Tanzania
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('NO_MOODLE_COOKIES', true);

require_once(__DIR__ . '/../../../../config.php');

use core_payment\helper;
use paygw_pesapal\pesapal_client;

$rawInput = file_get_contents('php://input');
$jsonPayload = json_decode($rawInput, true) ?: [];

// Support both JSON POST and Query Parameters from Pesapal
$orderTrackingId = $jsonPayload['OrderTrackingId'] ?? $_GET['OrderTrackingId'] ?? $_POST['OrderTrackingId'] ?? '';
$merchantReference = $jsonPayload['OrderMerchantReference'] ?? $_GET['OrderMerchantReference'] ?? $_POST['OrderMerchantReference'] ?? '';
$notificationType = $jsonPayload['OrderNotificationType'] ?? $_GET['OrderNotificationType'] ?? $_POST['OrderNotificationType'] ?? 'IPNCHANGE';

if (empty($orderTrackingId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing OrderTrackingId']);
    exit();
}

global $DB;
$record = $DB->get_record('paygw_pesapal', ['order_tracking_id' => $orderTrackingId]);
if (!$record && !empty($merchantReference)) {
    $record = $DB->get_record('paygw_pesapal', ['merchant_reference' => $merchantReference]);
}

if (!$record) {
    // Unknown order, acknowledge so Pesapal stops retrying
    http_response_code(200);
    echo json_encode([
        'orderNotificationType'  => $notificationType,
        'orderTrackingId'        => $orderTrackingId,
        'orderMerchantReference' => $merchantReference,
        'status'                 => 200,
    ]);
    exit();
}

// Parse component context from merchant reference: OUT-{userid}-{itemid}-{time}
$parts = explode('-', $record->merchant_reference);
$userid = isset($parts[1]) ? (int) $parts[1] : 2;
$itemid = isset($parts[2]) ? (int) $parts[2] : 0;
$component = 'enrol_fee';
$paymentarea = 'fee';

if ($component === 'enrol_fee' && $paymentarea === 'fee') {
    $enrolInstance = $DB->get_record('enrol', ['enrol' => 'fee', 'id' => $itemid]);
    if (!$enrolInstance) {
        $enrolInstance = $DB->get_record('enrol', ['enrol' => 'fee', 'courseid' => $itemid]);
    }
    if ($enrolInstance) {
        $itemid = (int) $enrolInstance->id;
    }
}

try {
    $config = (object) helper::get_gateway_configuration($component, $paymentarea, $itemid, 'pesapal');
    $isSandbox = ($config->environment ?? 'sandbox') === 'sandbox';

    $client = new pesapal_client($config->consumer_key, $config->consumer_secret, $isSandbox);
    $tx = $client->get_transaction_status($orderTrackingId);

    if (pesapal_client::is_completed($tx) && $record->status !== 'COMPLETED') {
        $payable = helper::get_payable($component, $paymentarea, $itemid);
        $paymentid = helper::save_payment(
            $payable->get_account_id(),
            $component,
            $paymentarea,
            $itemid,
            $userid,
            $tx['amount'],
            $tx['currency'],
            'pesapal'
        );

        helper::deliver_order($component, $paymentarea, $itemid, $paymentid, $userid);

        $record->paymentid      = $paymentid;
        $record->status         = 'COMPLETED';
        $record->payment_method = $tx['payment_method'];
        $record->timemodified   = time();
        $DB->update_record('paygw_pesapal', $record);
    }
} catch (\Throwable $e) {
    error_log('Pesapal IPN processing error: ' . $e->getMessage());
}

// Standard Pesapal IPN Acknowledgment Response
header('Content-Type: application/json');
http_response_code(200);
echo json_encode([
    'orderNotificationType'  => $notificationType,
    'orderTrackingId'        => $orderTrackingId,
    'orderMerchantReference' => $merchantReference,
    'status'                 => 200,
]);
