<?php
namespace paygw_selcom;

use core_payment\form\account_gateway;

defined('MOODLE_INTERNAL') || die();

/**
 * Selcom Payment Gateway class for Moodle 5.x.
 */
class gateway extends \core_payment\gateway {
    public static function get_supported_currencies(): array {
        return ['TZS', 'USD', 'KES', 'UGX'];
    }

    public static function add_configuration_to_gateway_form(account_gateway $form): void {
        $mform = $form->get_mform();
        $mform->addElement('text', 'vendorid', get_string('vendorid', 'paygw_selcom'));
        $mform->setType('vendorid', PARAM_TEXT);

        $mform->addElement('text', 'apikey', get_string('apikey', 'paygw_selcom'));
        $mform->setType('apikey', PARAM_TEXT);

        $mform->addElement('passwordunmask', 'apisecret', get_string('apisecret', 'paygw_selcom'));
        $mform->setType('apisecret', PARAM_TEXT);
    }
}

