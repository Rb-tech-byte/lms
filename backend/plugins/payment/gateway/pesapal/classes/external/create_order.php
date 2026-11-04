<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * External Web Service to create a Pesapal order for headless checkout.
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

class create_order extends external_api {
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'component'   => new external_value(PARAM_COMPONENT, 'Payment component e.g. enrol_fee'),
            'paymentarea' => new external_value(PARAM_AREA, 'Payment area e.g. fee'),
            'itemid'      => new external_value(PARAM_INT, 'Item ID / Enrol instance ID'),
            'phone'        => new external_value(PARAM_RAW, 'Customer mobile money phone number', VALUE_DEFAULT, ''),
            'description'  => new external_value(PARAM_TEXT, 'Payment description', VALUE_DEFAULT, ''),
            'callback_url' => new external_value(PARAM_RAW_TRIMMED, 'Custom return callback URL', VALUE_DEFAULT, ''),
        ]);
    }

    public static function execute(string $component, string $paymentarea, int $itemid, string $phone = '', string $description = '', string $callback_url = ''): array {
        global $USER, $DB;

        self::validate_parameters(self::execute_parameters(), [
            'component'    => $component,
            'paymentarea'  => $paymentarea,
            'itemid'       => $itemid,
            'phone'        => $phone,
            'description'  => $description,
            'callback_url' => $callback_url,
        ]);

        $config = (object) helper::get_gateway_configuration($component, $paymentarea, $itemid, 'pesapal');
        $isSandbox = ($config->environment ?? 'sandbox') === 'sandbox';

        $payable = helper::get_payable($component, $paymentarea, $itemid);
        $currency = $payable->get_currency() ?: 'TZS';
        $surcharge = helper::get_gateway_surcharge('pesapal');
        $amount = helper::get_rounded_cost($payable->get_amount(), $currency, $surcharge);

        // Student details
        $phoneVal = !empty($phone) ? $phone : ($DB->get_field('user', 'phone1', ['id' => $USER->id]) ?: '0712345678');
        $billingAddress = [
            'email'     => $USER->email ?: 'student@out.ac.tz',
            'phone'     => preg_replace('/\s+/', '', (string) $phoneVal),
            'country'   => 'TZ',
            'firstname' => $USER->firstname ?: 'Student',
            'lastname'  => $USER->lastname ?: 'User',
        ];

        $merchantRef = 'OUT-' . $USER->id . '-' . $itemid . '-' . time();
        if (!empty($callback_url)) {
            $callbackUrl = $callback_url;
        } else {
            $callbackUrl = (new \moodle_url('/payment/gateway/pesapal/process.php', [
                'component'   => $component,
                'paymentarea' => $paymentarea,
                'itemid'      => $itemid,
            ]))->out(false);
        }

        $client = new pesapal_client($config->consumer_key, $config->consumer_secret, $isSandbox);

        // Automatic IPN registration: automatically query or register IPN URL with Pesapal API 3.0
        $ipnUrl = (new \moodle_url('/payment/gateway/pesapal/webhook.php'))->out(false);
        if (!empty($config->ipn_id)) {
            $notificationId = $config->ipn_id;
        } else {
            $notificationId = $client->auto_register_ipn($ipnUrl);
        }

        $orderDesc = !empty($description) ? $description : ('OUT LMS Enrollment - Item #' . $itemid);
        $pesapalOrder = $client->submit_order(
            $merchantRef,
            (float) $amount,
            $currency,
            $orderDesc,
            $callbackUrl,
            $notificationId,
            $billingAddress
        );

        // Persist transaction record
        $record = new \stdClass();
        $record->paymentid          = null;
        $record->order_tracking_id  = $pesapalOrder['order_tracking_id'];
        $record->merchant_reference = $merchantRef;
        $record->amount             = $amount;
        $record->currency           = $currency;
        $record->status             = 'PENDING';
        $record->timecreated        = time();
        $record->timemodified       = time();

        $DB->insert_record('paygw_pesapal', $record);

        return [
            'order_tracking_id'  => $pesapalOrder['order_tracking_id'],
            'merchant_reference' => $merchantRef,
            'redirect_url'       => $pesapalOrder['redirect_url'],
            'amount'             => (string) $amount,
            'currency'           => $currency,
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'order_tracking_id'  => new external_value(PARAM_TEXT, 'Pesapal Order Tracking ID'),
            'merchant_reference' => new external_value(PARAM_TEXT, 'Merchant Reference'),
            'redirect_url'       => new external_value(PARAM_URL, 'Pesapal Secure Checkout URL'),
            'amount'             => new external_value(PARAM_TEXT, 'Amount payable'),
            'currency'           => new external_value(PARAM_TEXT, 'Currency code'),
        ]);
    }
}
