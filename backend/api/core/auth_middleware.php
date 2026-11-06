<?php
/**
 * OUT LMS Modular API — Token Authentication & RBAC Middleware
 * Resolves Bearer/query token into $currentUser and enforces role boundaries.
 */
require_once __DIR__ . '/bootstrap.php';

if (!isset($currentUser)) {
// -----------------------------------------------------------------------------
// Authentication & RBAC Verification (Strict Token Resolution)
// -----------------------------------------------------------------------------
$token = '';
$headers = function_exists('getallheaders') ? getallheaders() : [];
$authHeader = $_SERVER['HTTP_AUTHORIZATION']
    ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
    ?? $_SERVER['AUTHORIZATION']
    ?? $headers['Authorization']
    ?? $headers['authorization']
    ?? '';

if (!empty($authHeader) && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $token = trim($matches[1]);
}
if (!$token) {
    $token = $_GET['token'] ?? $_POST['token'] ?? $input['token'] ?? '';
}

$isInstructorAction = strpos($action, 'instructor') !== false ||
    in_array($action, [
        'get_instructor_dashboard_data',
        'create_instructor_announcement',
        'grade_submission',
        'manage_instructor_courses',
        'manage_instructor_announcements',
        'manage_instructor_assignments',
        'manage_instructor_students',
        'manage_instructor_quizzes',
        'manage_instructor_quiz_results',
        'manage_instructor_certificates',
        'manage_instructor_earnings',
        'manage_instructor_payouts',
        'manage_instructor_statements',
        'manage_instructor_messages',
        'manage_instructor_tickets',
        'get_installed_plugins_summary',
        'get_system_capabilities',
        'get_course_formats',
        'update_course_format',
        'get_kickstart_templates',
        'import_kickstart_template',
        'get_attendance',
        'record_attendance',
        'get_vpl_labs',
        'submit_vpl_code',
        'get_coderunner_questions',
        'evaluate_coderunner',
        'get_completion_progress',
        'toggle_activity_completion',
        'get_customcert_templates',
        'issue_customcert',
        'get_reengagement_nudges',
        'trigger_reengagement',
        'get_course_enterprise_suites',
        'execute_enterprise_feature',
        'get_ai_tutor_suite',
        'invoke_ai_tutor_action',
        'get_interactive_media_suite',
        'record_media_interaction',
        'get_curriculum_governance_suite',
        'execute_curriculum_workflow',
        'get_authoring_protection_suite',
        'execute_authoring_tool',
        'get_credentials_quests_suite',
        'trigger_credential_quest',
        'get_campus_operations_suite',
        'execute_campus_operation',
        'get_learner_analytics_suite',
        'update_learner_workspace',
        'get_security_governance_suite',
        'execute_security_check',
        'get_beautiful_certificates',
        'save_beautiful_certificate_theme',
        'render_beautiful_certificate',
        'get_api_endpoints_registry',
        'manage_api_endpoint',
        'moodle_ws_bridge'
    ], true);

// Actions that are intentionally public (no token) even though they are routed
// through the authenticated section: certificate rendering for public verification links.
$publicReadActions = [
    'render_beautiful_certificate', 'get_beautiful_certificates',
    'get_installed_plugins_summary', 'get_system_capabilities',
    'get_course_formats', 'get_kickstart_templates',
];

// Actions in the multi-role section that require an instructor (or site admin).
$instructorOnlyActions = [
    'grade_submission', 'update_course_format', 'import_kickstart_template', 'record_attendance', 'issue_customcert',
    'trigger_reengagement', 'execute_enterprise_feature', 'execute_curriculum_workflow',
    'execute_authoring_tool', 'execute_campus_operation', 'execute_security_check',
];
// Actions in the multi-role section that require a site administrator.
$adminOnlyActions = ['get_api_endpoints_registry', 'manage_api_endpoint', 'moodle_ws_bridge'];

$currentUser = $token ? outlms_resolve_token_user($token) : null;

if (!$currentUser) {
    if (in_array($action, $publicReadActions, true)) {
        // Anonymous, read-only access. Never elevated.
        $currentUser = (object)['id' => 0, 'username' => 'guest', 'firstname' => 'Public', 'lastname' => 'Visitor', 'email' => ''];
    } else {
        outlms_deny(401, $token ? 'Invalid or expired token.' : 'Authentication required.');
    }
}

// -----------------------------------------------------------------------------
// Authenticated Multi-Role Actions (Available to Student, Instructor & Admin)
// -----------------------------------------------------------------------------
if ((int)$currentUser->id > 0) {
    if (in_array($action, $adminOnlyActions, true) && !is_siteadmin($currentUser->id)) {
        outlms_deny(403, 'Administrator role required.');
    }
    $needsInstructor = in_array($action, $instructorOnlyActions, true)
        || (strpos($action, 'instructor') !== false);
    if ($needsInstructor && !outlms_user_is_instructor((int)$currentUser->id)) {
        outlms_deny(403, 'Instructor role required.');
    }
}

}