<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Language strings for Pesapal Payment Gateway.
 *
 * @package    paygw_pesapal
 * @copyright  2026 Open University of Tanzania
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['pluginname'] = 'Pesapal Payment Gateway';
$string['gatewayname'] = 'Pesapal (M-Pesa, Airtel Money, Tigo Pesa, Card)';
$string['consumer_key'] = 'Consumer Key';
$string['consumer_key_desc'] = 'Your Pesapal API 3.0 Consumer Key provided by Pesapal.';
$string['consumer_secret'] = 'Consumer Secret';
$string['consumer_secret_desc'] = 'Your Pesapal API 3.0 Consumer Secret provided by Pesapal.';
$string['ipn_id'] = 'IPN Notification ID';
$string['ipn_id_desc'] = 'Registered IPN notification ID returned by Pesapal.';
$string['environment'] = 'Environment';
$string['environment_desc'] = 'Choose Sandbox for testing with Cybqa or Live for production payments in Tanzania.';
$string['sandbox'] = 'Sandbox (Testing / Cybqa)';
$string['live'] = 'Live (Production)';
$string['autocreateipn'] = 'Auto-Register IPN Webhook';
$string['autocreateipn_desc'] = 'Automatically register this Moodle site with Pesapal URLSetup API upon saving configuration.';
$string['webhookurl'] = 'Instant Payment Notification (IPN) URL';
$string['webhookurl_desc'] = 'The callback URL where Pesapal sends asynchronous payment notifications.';
$string['paymentfailed'] = 'Pesapal payment could not be completed or was cancelled.';
$string['paymentsuccessful'] = 'Payment completed successfully! You have been enrolled in the course.';
$string['ordercreatefailed'] = 'Unable to initiate Pesapal payment order. Please check credentials.';
$string['privacy:metadata'] = 'The Pesapal Payment Gateway stores transaction references and payment status for enrolled courses.';
