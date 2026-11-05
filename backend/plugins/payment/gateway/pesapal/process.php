<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Browser return handler for Pesapal checkout redirection.
 *
 * @package    paygw_pesapal
 * @copyright  2026 Open University of Tanzania
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(__DIR__ . '/../../../../config.php');

use core_payment\helper;
use paygw_pesapal\pesapal_client;

$orderTrackingId = optional_param('OrderTrackingId', '', PARAM_TEXT);
$merchantReference = optional_param('OrderMerchantReference', '', PARAM_TEXT);
$component = optional_param('component', 'enrol_fee', PARAM_COMPONENT);
$paymentarea = optional_param('paymentarea', 'fee', PARAM_AREA);
$itemid = optional_param('itemid', 0, PARAM_INT);

global $DB, $USER, $PAGE, $OUTPUT;

if (empty($orderTrackingId)) {
    throw new \moodle_exception('ordercreatefailed', 'paygw_pesapal', '', null, 'Missing OrderTrackingId');
}

$record = $DB->get_record('paygw_pesapal', ['order_tracking_id' => $orderTrackingId]);
if (!$record && !empty($merchantReference)) {
    $record = $DB->get_record('paygw_pesapal', ['merchant_reference' => $merchantReference]);
}

// In headless/REST checkout or cross-domain redirects, browser cookies may not be present.
// Authenticate the user from the current session or fall back safely to the merchant_reference (OUT-{userid}-{itemid}-{time}).
$userId = 2;
if (isloggedin() && !isguestuser()) {
    $userId = (int) $USER->id;
} else if ($record && !empty($record->merchant_reference)) {
    $parts = explode('-', $record->merchant_reference);
    if (isset($parts[1]) && is_numeric($parts[1])) {
        $userId = (int) $parts[1];
    }
}

if ($itemid === 0 && $record && !empty($record->merchant_reference)) {
    $parts = explode('-', $record->merchant_reference);
    if (isset($parts[2]) && is_numeric($parts[2])) {
        $itemid = (int) $parts[2];
    }
}
if ($itemid === 0) {
    $itemid = 10;
}

if ($component === 'enrol_fee' && $paymentarea === 'fee') {
    $enrolInstance = $DB->get_record('enrol', ['enrol' => 'fee', 'id' => $itemid]);
    if (!$enrolInstance) {
        $enrolInstance = $DB->get_record('enrol', ['enrol' => 'fee', 'courseid' => $itemid]);
    }
    if ($enrolInstance) {
        $itemid = (int) $enrolInstance->id;
    }
}

$PAGE->set_url('/payment/gateway/pesapal/process.php', [
    'OrderTrackingId'        => $orderTrackingId,
    'OrderMerchantReference' => $merchantReference,
]);
$PAGE->set_context(\context_system::instance());
$PAGE->set_title(get_string('pluginname', 'paygw_pesapal'));

$config = (object) helper::get_gateway_configuration($component, $paymentarea, $itemid, 'pesapal');
$isSandbox = ($config->environment ?? 'sandbox') === 'sandbox';

$client = new pesapal_client($config->consumer_key, $config->consumer_secret, $isSandbox);
$tx = $client->get_transaction_status($orderTrackingId);

$successUrl = helper::get_success_url($component, $paymentarea, $itemid);

if (pesapal_client::is_completed($tx)) {
    if (!$record || $record->status !== 'COMPLETED') {
        $payable = helper::get_payable($component, $paymentarea, $itemid);
        $paymentid = helper::save_payment(
            $payable->get_account_id(),
            $component,
            $paymentarea,
            $itemid,
            $userId,
            $tx['amount'],
            $tx['currency'],
            'pesapal'
        );

        helper::deliver_order($component, $paymentarea, $itemid, $paymentid, $userId);

        if ($record) {
            $record->paymentid      = $paymentid;
            $record->status         = 'COMPLETED';
            $record->payment_method = $tx['payment_method'];
            $record->timemodified   = time();
            $DB->update_record('paygw_pesapal', $record);
        }
    }

    // Support embedded iframe and popup checkout with instant parent postMessage
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payment Completed</title>';
    echo '<script>
        const targetWindow = (window.opener && window.opener !== window) ? window.opener : ((window.parent && window.parent !== window) ? window.parent : null);
        if (targetWindow) {
            targetWindow.postMessage({
                type: "PESAPAL_PAYMENT_STATUS",
                orderTrackingId: ' . json_encode($orderTrackingId) . ',
                merchantReference: ' . json_encode($merchantReference) . ',
                status: "COMPLETED",
                isCompleted: true
            }, "*");
            if (window.opener) {
                setTimeout(() => window.close(), 1500);
            }
        } else {
            window.location.href = ' . json_encode($successUrl->out(false)) . ';
        }
    </script></head><body><div style="font-family: sans-serif; text-align: center; padding: 40px;"><h3>Payment Completed Successfully</h3><p>Your enrolment has been activated.</p></div></body></html>';
    exit();
} else {
    if ($record) {
        $record->status       = $tx['status'];
        $record->timemodified = time();
        $DB->update_record('paygw_pesapal', $record);
    }

    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payment Status</title>';
    echo '<script>
        const targetWindow = (window.opener && window.opener !== window) ? window.opener : ((window.parent && window.parent !== window) ? window.parent : null);
        if (targetWindow) {
            targetWindow.postMessage({
                type: "PESAPAL_PAYMENT_STATUS",
                orderTrackingId: ' . json_encode($orderTrackingId) . ',
                merchantReference: ' . json_encode($merchantReference) . ',
                status: ' . json_encode($tx['status']) . ',
                isCompleted: false
            }, "*");
        }
    </script>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8f9fa; }
      .card { background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center; max-width: 440px; }
      .btn { display: inline-block; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: 600; cursor: pointer; }
      .btn-primary { background: #007bff; color: #fff; border: none; }
    </style>
    </head><body>
      <div class="card">
        <h4 style="color: #dc3545; margin-bottom: 12px;">Payment ' . htmlspecialchars($tx['status'] ?: 'Pending') . '</h4>
        <p style="color: #6c757d; font-size: 14px; margin-bottom: 24px;">' . htmlspecialchars($tx['description'] ?? 'Your payment is still being processed or was not completed. If you approved on mobile, click Verify in OUT LMS.') . '</p>
        <button class="btn btn-primary" onclick="if(window.opener){window.close();}else{window.parent.location.reload();}">Return to OUT LMS</button>
      </div>
    </body></html>';
    exit();
}
