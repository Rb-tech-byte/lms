<?php
/**
 * Open University of Tanzania LMS
 * Modular Administrative, Faculty, Learner & Course Studio API Gateway Router
 *
 * Architecture:
 * - /api/core/bootstrap.php         : Shared Moodle $CFG/$DB bootstrap, CORS & RBAC helpers
 * - /api/core/db_instructor_repo.php: 100% Pure MariaDB repository for Instructor & Public Catalog
 * - /api/core/auth_middleware.php   : Token resolution & role-based access control guards
 * - /api/public_api.php             : Public catalog, course details, faculty directory, verification
 * - /api/student_api.php            : Learner identity, XP, attendance, VPL, CodeRunner, Beautiful Certificates
 * - /api/instructor_api.php         : Instructor dashboard & 12 faculty CUD endpoints (Pure MariaDB)
 * - /api/course_studio_api.php      : Unified 8-section Moodle Course Creation & Category Studio
 * - /api/admin_system_api.php       : Site settings, plugins, users CRUD, telemetry & Pesapal ledger
 */

require_once __DIR__ . '/api/core/bootstrap.php';

$publicActions = [
    'login',
    'login_user',
    'openapi',
    'register_user',
    'request_password_reset',
    'public_catalog',
    'public_course_details',
    'public_instructors',
    'submit_contact_inquiry',
    'submit_instructor_application',
    'get_cms_config',
    'get_short_courses_catalog',
    'verify_certificate',
    'get_certificate',
];

$studentActions = [
    'resolve_identity',
    'change_password',
    'update_my_profile',
    'submit_quiz_grade',
    'get_learner_xp',
    'get_leaderboard',
    'get_live_sessions',
    'get_completion_timeline',
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
    'get_beautiful_certificates',
    'save_beautiful_certificate_theme',
    'render_beautiful_certificate',
];

$instructorActions = [
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
    'instructor_profile',
    'manage_instructor_profile',
    'manage_corporate_cohort',
];

$courseStudioActions = [
    'get_kickstart_templates',
    'import_kickstart_template',
    'get_course_formats',
    'update_course_format',
    'get_courses',
    'create_course',
    'delete_course',
    'add_activity',
    'delete_activity',
    'update_activity',
    'toggle_enrol',
    'get_categories',
    'add_category',
    'delete_category',
    'update_category',
    'get_course_defaults',
    'update_course_defaults',
    'get_groups',
    'create_group',
    'delete_group',
    'get_course_details',
    'update_course_settings',
    'get_course_participants',
    'get_course_grades',
    'manage_course_section',
    'get_course_studio_workspace',
    'bulk_upload_courses',
    'manage_category_permissions',
    'manage_cohorts',
    'manage_filters',
    'restore_backup_course',
    'manage_learning_plans',
    'manage_competency_frameworks',
    'manage_content_bank',
    'manage_standard_tags',
];

if (in_array($action, $publicActions, true)) {
    require __DIR__ . '/api/public_api.php';
    exit(0);
}

if (in_array($action, $studentActions, true)) {
    require __DIR__ . '/api/student_api.php';
    exit(0);
}

if (in_array($action, $instructorActions, true)) {
    require __DIR__ . '/api/instructor_api.php';
    exit(0);
}

if (in_array($action, $courseStudioActions, true)) {
    require __DIR__ . '/api/course_studio_api.php';
    exit(0);
}

// Default to Admin & System Governance Controller
require __DIR__ . '/api/admin_system_api.php';
exit(0);