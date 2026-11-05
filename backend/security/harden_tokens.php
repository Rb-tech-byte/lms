<?php
/**
 * OUT LMS — one-off security hardening (CLI only).
 *  1. Revokes WS tokens that were previously hardcoded in source control.
 *  2. Rotates passwords for seeded admin / instructor / student accounts.
 *  3. Creates a least-privilege "public catalog" web service + reader account
 *     whose token can ONLY call read-only catalog functions.
 * Usage: php harden_tokens.php <admin_pw> <instructor_pw> <student_pw>
 */
define('CLI_SCRIPT', true);
require '/var/www/html/config.php';
require_once($CFG->libdir . '/accesslib.php');
require_once($CFG->dirroot . '/user/lib.php');

[$_, $adminPw, $instructorPw, $studentPw] = $argv + [null, null, null, null];
if (!$adminPw || !$instructorPw || !$studentPw) { fwrite(STDERR, "usage: php harden_tokens.php <admin_pw> <instructor_pw> <student_pw>\n"); exit(1); }

// 1. Revoke leaked tokens
$leaked = ['cac3488049fb0d8247867a568bea7c79', '5b923ba442be646d7371f5ae06fe350c', '14ba63b0399a3c00f7ab62abad0e9e86'];
[$in, $p] = $DB->get_in_or_equal($leaked);
$n = $DB->count_records_select('external_tokens', "token $in", $p);
$DB->delete_records_select('external_tokens', "token $in", $p);
echo "Revoked leaked tokens: $n\n";

// 2. Rotate seeded passwords
foreach (['admin' => $adminPw, 'instructor' => $instructorPw, 'student' => $studentPw] as $uname => $pw) {
    $u = $DB->get_record('user', ['username' => $uname, 'deleted' => 0]);
    if ($u) { update_internal_user_password($u, $pw); echo "Password rotated: $uname\n"; }
}

// 3. Least-privilege public catalog service
$sys = context_system::instance();
$roleid = $DB->get_field('role', 'id', ['shortname' => 'outlms_catalog_reader']);
if (!$roleid) {
    $roleid = create_role('OUT Public Catalog Reader', 'outlms_catalog_reader', 'Read-only catalog access for the public website.', '');
    set_role_contextlevels($roleid, [CONTEXT_SYSTEM]);
}
foreach (['moodle/course:view', 'moodle/category:viewcourselist', 'webservice/rest:use', 'webservice/restful:use'] as $cap) {
    if ($DB->record_exists('capabilities', ['name' => $cap])) { assign_capability($cap, CAP_ALLOW, $roleid, $sys->id, true); }
}
$reader = $DB->get_record('user', ['username' => 'catalog_reader', 'deleted' => 0]);
if (!$reader) {
    $rid = user_create_user((object)['username' => 'catalog_reader', 'auth' => 'manual', 'confirmed' => 1, 'mnethostid' => $CFG->mnet_localhost_id,
        'password' => bin2hex(random_bytes(24)) . 'Aa1!', 'firstname' => 'Public', 'lastname' => 'Catalog', 'email' => 'catalog-reader@out.ac.tz'], true, false);
    $reader = $DB->get_record('user', ['id' => $rid]);
}
role_assign($roleid, $reader->id, $sys->id);

$service = $DB->get_record('external_services', ['shortname' => 'outlms_public_catalog']);
if (!$service) {
    $sid = $DB->insert_record('external_services', (object)['name' => 'OUT Public Catalog (read-only)', 'shortname' => 'outlms_public_catalog',
        'enabled' => 1, 'requiredcapability' => '', 'restrictedusers' => 1, 'component' => null, 'timecreated' => time(), 'downloadfiles' => 0, 'uploadfiles' => 0]);
    $service = $DB->get_record('external_services', ['id' => $sid]);
}
if (!$DB->record_exists('external_services_users', ['externalserviceid' => $service->id, 'userid' => $reader->id])) {
    $DB->insert_record('external_services_users', (object)['externalserviceid' => $service->id, 'userid' => $reader->id, 'timecreated' => time()]);
}
foreach (['core_webservice_get_site_info', 'core_course_get_categories', 'core_course_get_courses', 'core_course_get_courses_by_field', 'core_course_get_contents', 'mod_page_get_pages_by_courses'] as $fn) {
    if ($DB->record_exists('external_functions', ['name' => $fn]) && !$DB->record_exists('external_services_functions', ['externalserviceid' => $service->id, 'functionname' => $fn])) {
        $DB->insert_record('external_services_functions', (object)['externalserviceid' => $service->id, 'functionname' => $fn]);
    }
}
$DB->delete_records('external_tokens', ['externalserviceid' => $service->id, 'userid' => $reader->id]);
$token = \core_external\util::generate_token(EXTERNAL_TOKEN_PERMANENT, $service, $reader->id, $sys, 0);
echo "PUBLIC_CATALOG_TOKEN=$token\n";
