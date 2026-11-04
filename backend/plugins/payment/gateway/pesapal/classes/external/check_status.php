<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * External Web Service to verify Pesapal transaction status and deliver course access.
 *
 * @package    paygw_pesapal
 * @copyright  2026 Open University of Tanzania
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

declare(strict_types=1);

namespace paygw_pesapal\external;

defined('MOODLE_INTERNAL') || die();

use core_payment\helper;
use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;
use core_external\external_single_structure;
use paygw_pesapal\pesapal_client;

class check_status extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'order_tracking_id' => new external_value(PARAM_TEXT, 'Pesapal Order Tracking ID'),
            'component'         => new external_value(PARAM_COMPONENT, 'Payment component e.g. enrol_fee', VALUE_DEFAULT, 'enrol_fee'),
            'paymentarea'       => new external_value(PARAM_AREA, 'Payment area e.g. fee', VALUE_DEFAULT, 'fee'),
            'itemid'            => new external_value(PARAM_INT, 'Item ID / Enrol instance ID', VALUE_DEFAULT, 0),
        ]);
    }

    public static function execute(string $order_tracking_id, string $component = 'enrol_fee', string $paymentarea = 'fee', int $itemid = 0): array {
        global $USER, $DB;

        self::validate_parameters(self::execute_parameters(), [
            'order_tracking_id' => $order_tracking_id,
            'component'         => $component,
            'paymentarea'       => $paymentarea,
            'itemid'            => $itemid,
        ]);

        $existing = $DB->get_record('paygw_pesapal', ['order_tracking_id' => $order_tracking_id]);

        if ($itemid === 0 && $existing && !empty($existing->merchant_reference)) {
            $parts = explode('-', $existing->merchant_reference);
            if (isset($parts[2])) {
                $itemid = (int) $parts[2];
            }
        }
        if ($itemid === 0) {
            $itemid = 10;
        }

        $config = (object) helper::get_gateway_configuration($component, $paymentarea, $itemid, 'pesapal');
        $isSandbox = ($config->environment ?? 'sandbox') === 'sandbox';

        $client = new pesapal_client($config->consumer_key, $config->consumer_secret, $isSandbox);
        $tx = $client->get_transaction_status($order_tracking_id);

        $isDelivered = false;
        $status = $tx['status'];
        $isCompleted = pesapal_client::is_completed($tx);

        if ($isCompleted) {
            $status = 'COMPLETED';

            // Deliver order if not already delivered
            if (!$existing || $existing->status !== 'COMPLETED') {
                $payable = helper::get_payable($component, $paymentarea, $itemid);
                $paymentid = helper::save_payment(
                    $payable->get_account_id(),
                    $component,
                    $paymentarea,
                    $itemid,
                    $USER->id,
                    $tx['amount'],
                    $tx['currency'],
                    'pesapal'
                );

                helper::deliver_order($component, $paymentarea, $itemid, $paymentid, $USER->id);
                $isDelivered = true;

                if ($existing) {
                    $existing->paymentid      = $paymentid;
                    $existing->status         = 'COMPLETED';
                    $existing->payment_method = $tx['payment_method'];
                    $existing->timemodified   = time();
                    $DB->update_record('paygw_pesapal', $existing);
                }
            } else {
                $isDelivered = true;
            }
        } else if ($existing) {
            $existing->status       = $status;
            $existing->timemodified = time();
            $DB->update_record('paygw_pesapal', $existing);
        }

        $message = $isCompleted
            ? 'Payment verified successfully and enrolment delivered.'
            : 'Payment is currently ' . $status . '. Please complete the prompt on your mobile phone.';

        return [
            'order_tracking_id' => $order_tracking_id,
            'status'            => $status,
            'payment_method'    => (string) ($tx['payment_method'] ?? 'PESAPAL'),
            'amount'            => (string) ($tx['amount'] ?? ($existing ? $existing->amount : '150000')),
            'currency'          => (string) ($tx['currency'] ?? 'TZS'),
            'is_delivered'      => $isDelivered,
            'is_completed'      => $isCompleted,
            'message'           => $message,
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'order_tracking_id' => new external_value(PARAM_TEXT, 'Pesapal Order Tracking ID'),
            'status'            => new external_value(PARAM_TEXT, 'Pesapal Transaction Status'),
            'payment_method'    => new external_value(PARAM_TEXT, 'Payment Channel e.g. MPESA'),
            'amount'            => new external_value(PARAM_TEXT, 'Payment amount'),
            'currency'          => new external_value(PARAM_TEXT, 'Payment currency'),
            'is_delivered'      => new external_value(PARAM_BOOL, 'Whether course enrollment has been delivered'),
            'is_completed'      => new external_value(PARAM_BOOL, 'Whether payment is completed'),
            'message'           => new external_value(PARAM_TEXT, 'Human readable status message'),
        ]);
    }
}
