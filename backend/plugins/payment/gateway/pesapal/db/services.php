<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Web services declaration for Pesapal Payment Gateway.
 *
 * @package    paygw_pesapal
 * @copyright  2026 Open University of Tanzania
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$functions = [
    'paygw_pesapal_create_order' => [
        'classname'   => 'paygw_pesapal\external\create_order',
        'methodname'  => 'execute',
        'description' => 'Creates a Pesapal API v3 checkout order for headless frontend / mobile checkout',
        'type'        => 'write',
        'ajax'        => true,
        'services'    => [MOODLE_OFFICIAL_MOBILE_SERVICE],
    ],
    'paygw_pesapal_check_status' => [
        'classname'   => 'paygw_pesapal\external\check_status',
        'methodname'  => 'execute',
        'description' => 'Checks payment transaction status on Pesapal and delivers Moodle course enrollment on completion',
        'type'        => 'write',
        'ajax'        => true,
        'services'    => [MOODLE_OFFICIAL_MOBILE_SERVICE],
    ],
];
