/**
 * Moodle 5.x Web Service Function Registry & Endpoint Definitions
 * Centralized mapping for all core and custom OUT LMS endpoints.
 */

export const MOODLE_ENDPOINTS = {
  // Authentication & Tokens
  TOKEN: '/login/token.php',
  SITE_INFO: 'core_webservice_get_site_info',

  // Course & Category Management
  GET_CATEGORIES: 'core_course_get_categories',
  GET_COURSES: 'core_course_get_courses',
  GET_COURSES_BY_FIELD: 'core_course_get_courses_by_field',
  GET_COURSE_CONTENTS: 'core_course_get_contents',
  UPDATE_ACTIVITY_COMPLETION: 'core_completion_update_activity_completion_status_manually',
  GET_PAGES_BY_COURSES: 'mod_page_get_pages_by_courses',
  CREATE_COURSES: 'core_course_create_courses',
  UPDATE_COURSES: 'core_course_update_courses',
  CREATE_CATEGORIES: 'core_course_create_categories',

  // Enrolment & Users
  GET_ENROLLED_COURSES_TIMELINE: 'core_course_get_enrolled_courses_by_timeline_classification',
  GET_ENROLLED_USERS: 'core_enrol_get_enrolled_users',
  ENROL_USERS: 'enrol_manual_enrol_users',
  UNENROL_USERS: 'enrol_manual_unenrol_users',
  GET_USERS: 'core_user_get_users',
  GET_USERS_BY_FIELD: 'core_user_get_users_by_field',
  CREATE_USERS: 'core_user_create_users',
  UPDATE_USERS: 'core_user_update_users',

  // Assessments, Quizzes & Grades
  GET_QUIZZES: 'mod_quiz_get_quizzes_by_courses',
  START_QUIZ_ATTEMPT: 'mod_quiz_start_attempt',
  PROCESS_QUIZ_ATTEMPT: 'mod_quiz_process_attempt',
  GET_USER_ATTEMPTS: 'mod_quiz_get_user_attempts',
  GET_ASSIGNMENTS: 'mod_assign_get_assignments',
  GET_SUBMISSIONS: 'mod_assign_get_submissions',
  SAVE_GRADE: 'mod_assign_save_grade',
  GET_USER_GRADES: 'gradereport_user_get_grade_items',

  // Custom OUT LMS Bridge Endpoints (local_outlms_bridge)
  GET_PLUGIN_STATUS: 'local_outlms_bridge_get_plugins',
  SET_SITE_CONFIG: 'local_outlms_bridge_set_config',
  GET_ANALYTICS: 'local_outlms_bridge_get_analytics',
  PROCESS_PAYMENT_CALLBACK: 'local_outlms_bridge_payment_callback',

  // Native Pesapal Payment Gateway (paygw_pesapal)
  PESAPAL_CREATE_ORDER: 'paygw_pesapal_create_order',
  PESAPAL_CHECK_STATUS: 'paygw_pesapal_check_status',
} as const;

export type MoodleFunction = typeof MOODLE_ENDPOINTS[keyof typeof MOODLE_ENDPOINTS];
