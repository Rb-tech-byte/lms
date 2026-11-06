<?php
/**
 * Open University of Tanzania LMS
 * Seamless Single Sign-On (SSO) & Direct Admin Action Bridge
 * 
 * Securely logs authenticated administrative users into Moodle from the React frontend,
 * sets session cookies, and seamlessly redirects to target Moodle administrative interfaces
 * without requiring the administrator to enter credentials or navigate login screens.
 */

// Full Moodle sessions and cookies are enabled (NO_MOODLE_COOKIES is not set)
require_once __DIR__ . '/config.php';
require_once $CFG->libdir . '/adminlib.php';

$token = $_GET['token'] ?? '';
$redirect = $_GET['redirect'] ?? '/admin/search.php';

if (empty($token)) {
    http_response_code(400);
    die("<h3>OUT LMS SSO Error</h3><p>Authentication token is required.</p>");
}

$tokenRecord = $DB->get_record('external_tokens', ['token' => $token]);
if (!$tokenRecord) {
    http_response_code(401);
    die("<h3>OUT LMS SSO Error</h3><p>Invalid or expired administrative token.</p>");
}

$user = $DB->get_record('user', ['id' => $tokenRecord->userid, 'deleted' => 0]);
if (!$user) {
    http_response_code(401);
    die("<h3>OUT LMS SSO Error</h3><p>User account not found.</p>");
}

if (!is_siteadmin($user->id)) {
    http_response_code(403);
    die("<h3>OUT LMS SSO Error</h3><p>Access Denied: Site administrator privileges required.</p>");
}

// Log in the user and write Moodle session cookies
complete_user_login($user);
\core\session\manager::apply_concurrent_login_limit($user->id, session_id());
set_moodle_cookie($user->username);

// Sanitize and resolve redirect target
$anchor = '';
if (strpos($redirect, '#') !== false) {
    list($redirect, $anchor) = explode('#', $redirect, 2);
}

// Strip domain/base path if absolute URL was passed
$cfgPath = parse_url($CFG->wwwroot, PHP_URL_PATH) ?: '';
if (!empty($cfgPath) && str_starts_with($redirect, $cfgPath)) {
    $redirect = substr($redirect, strlen($cfgPath));
}
$prefix = '/outlmstheme/moodle-backend';
if (strpos($redirect, 'http://') === 0 || strpos($redirect, 'https://') === 0) {
    $parsed = parse_url($redirect);
    $redirect = $parsed['path'] ?? '/';
    if (!empty($parsed['query'])) {
        $redirect .= '?' . $parsed['query'];
    }
}

if (str_starts_with($redirect, $prefix)) {
    $redirect = substr($redirect, strlen($prefix));
}

if (!str_starts_with($redirect, '/')) {
    $redirect = '/' . $redirect;
}

$targetUrl = new moodle_url($redirect);
if (!empty($anchor)) {
    $targetUrl->set_anchor($anchor);
}

// Redirect to target administrative interface
redirect($targetUrl);
