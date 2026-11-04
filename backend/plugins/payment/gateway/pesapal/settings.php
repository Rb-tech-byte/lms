<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Settings for the Pesapal payment gateway.
 *
 * @package    paygw_pesapal
 * @copyright  2026 Open University of Tanzania
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($ADMIN->fulltree) {
    \core_payment\helper::add_common_gateway_settings($settings, 'paygw_pesapal');
}
