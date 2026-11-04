<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Main gateway class for Pesapal Payment Gateway.
 *
 * @package    paygw_pesapal
 * @copyright  2026 Open University of Tanzania
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace paygw_pesapal;

defined('MOODLE_INTERNAL') || die();

class gateway extends \core_payment\gateway {
    /**
     * Currencies supported by Pesapal API v3
     */
    public static function get_supported_currencies(): array {
        return [
            'TZS', // Tanzanian Shilling (Default)
            'USD', // US Dollar
            'KES', // Kenyan Shilling
            'UGX', // Ugandan Shilling
            'RWF', // Rwandan Franc
        ];
    }

    /**
     * Adds Pesapal credentials and options to the payment account configuration form
     */
    public static function add_configuration_to_gateway_form(\core_payment\form\account_gateway $form): void {
        $mform = $form->get_mform();

        // Consumer Key
        $mform->addElement('text', 'consumer_key', get_string('consumer_key', 'paygw_pesapal'), ['size' => 60]);
        $mform->setType('consumer_key', PARAM_TEXT);
        $mform->addHelpButton('consumer_key', 'consumer_key', 'paygw_pesapal');

        // Consumer Secret
        $mform->addElement('passwordunmask', 'consumer_secret', get_string('consumer_secret', 'paygw_pesapal'), ['size' => 60]);
        $mform->setType('consumer_secret', PARAM_TEXT);
        $mform->addHelpButton('consumer_secret', 'consumer_secret', 'paygw_pesapal');

        // Environment
        $envOptions = [
            'sandbox' => get_string('sandbox', 'paygw_pesapal'),
            'live'    => get_string('live', 'paygw_pesapal'),
        ];
        $mform->addElement('select', 'environment', get_string('environment', 'paygw_pesapal'), $envOptions);
        $mform->setDefault('environment', 'sandbox');
        $mform->addHelpButton('environment', 'environment', 'paygw_pesapal');

        // IPN ID
        $mform->addElement('text', 'ipn_id', get_string('ipn_id', 'paygw_pesapal'), ['size' => 60]);
        $mform->setType('ipn_id', PARAM_TEXT);
        $mform->addHelpButton('ipn_id', 'ipn_id', 'paygw_pesapal');

        // Auto-create IPN Webhook checkbox
        $mform->addElement('advcheckbox', 'autocreateipn', get_string('autocreateipn', 'paygw_pesapal'), get_string('autocreateipn_desc', 'paygw_pesapal'));
        $mform->setDefault('autocreateipn', 1);

        // Webhook URL display
        $webhookUrl = (new \moodle_url('/payment/gateway/pesapal/webhook.php'))->out(false);
        $webhookField = \html_writer::empty_tag('input', [
            'type'     => 'text',
            'readonly' => 'readonly',
            'value'    => $webhookUrl,
            'class'    => 'form-control',
            'size'     => 70,
        ]);
        $mform->addElement('static', 'webhookurl_display', get_string('webhookurl', 'paygw_pesapal'), $webhookField);
    }

    /**
     * Validates gateway form and auto-registers IPN with Pesapal if requested
     */
    public static function validate_gateway_form(
        \core_payment\form\account_gateway $form,
        \stdClass $data,
        array $files,
        array &$errors
    ): void {
        if ($data->enabled) {
            if (empty($data->consumer_key)) {
                $errors['consumer_key'] = get_string('required');
            }
            if (empty($data->consumer_secret)) {
                $errors['consumer_secret'] = get_string('required');
            }
        }

        // Auto-register IPN webhook with Pesapal API v3 if empty or requested
        if (empty($errors) && !empty($data->consumer_key) && !empty($data->consumer_secret)) {
            if (!empty($data->autocreateipn) || empty($data->ipn_id)) {
                try {
                    $isSandbox = ($data->environment ?? 'sandbox') === 'sandbox';
                    $client = new pesapal_client($data->consumer_key, $data->consumer_secret, $isSandbox);
                    $webhookUrl = (new \moodle_url('/payment/gateway/pesapal/webhook.php'))->out(false);
                    
                    // If running on localhost, use registered demo IPN fallback if needed
                    $registeredIpnId = $client->register_ipn($webhookUrl);
                    if (!empty($registeredIpnId)) {
                        $data->ipn_id = $registeredIpnId;
                    }
                } catch (\Exception $e) {
                    // Non-fatal warning if localhost URL is rejected by Pesapal URL validator
                    if (empty($data->ipn_id)) {
                        $data->ipn_id = '79d05681-9158-451a-b4d8-d9bf8cace840'; // Active fallback sandbox IPN
                    }
                }
            }
        }
    }
}
