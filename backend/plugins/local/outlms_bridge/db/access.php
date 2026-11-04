<?php
/**
 * Capabilities for local_outlms_bridge.
 *
 * @package    local_outlms_bridge
 * @copyright  2026 Open University of Tanzania
 */

defined('MOODLE_INTERNAL') || die();

$capabilities = [
    'local/outlms_bridge:manage' => [
        'riskbitmask' => RISK_CONFIG | RISK_PERSONAL,
        'captype' => 'write',
        'contextlevel' => CONTEXT_SYSTEM,
        'archetypes' => [
            'manager' => CAP_ALLOW,
        ],
    ],
];

