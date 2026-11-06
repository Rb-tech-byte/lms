/**
 * Unified Multi-Layer API Client for Open University of Tanzania (OUT LMS):
 * 1. Moodle Core Web Services (`/webservice/rest/server.php`)
 * 2. Moodle 5.x REST API v2 OpenAPI 3.1 (`/api/rest/v2/*`)
 * 3. OUT LMS Modular Domain APIs:
 *    - `/api/public_api.php`        : Public catalog, course details, faculty directory, certificate verification
 *    - `/api/student_api.php`       : Learner identity, XP, attendance, VPL, CodeRunner, Beautiful Certificates
 *    - `/api/instructor_api.php`    : Instructor dashboard & 12 faculty CUD endpoints (Pure MariaDB)
 *    - `/api/course_studio_api.php` : Unified 8-section Moodle Course Creation & Category Studio
 *    - `/api/admin_system_api.php`  : Site settings, plugins, users CRUD, telemetry & Pesapal ledger
 */

import { MOODLE_ENDPOINTS } from './moodleEndpoints';

export interface MoodleResponse<T = any> {
  data: T;
  exception?: string;
  errorcode?: string;
  message?: string;
}

declare global {
  interface Window {
    __OUT_LMS_CONFIG__?: {
      moodleUrl?: string;
      gatewayUrl?: string;
      adminApiUrl?: string;
    };
  }
}

export const getDynamicMoodleUrl = (): string => {
  if (typeof window !== 'undefined') {
    if (window.__OUT_LMS_CONFIG__?.moodleUrl) {
      return window.__OUT_LMS_CONFIG__.moodleUrl.replace(/\/+$/, '');
    }
    if (process.env.REACT_APP_MOODLE_URL) {
      return process.env.REACT_APP_MOODLE_URL.replace(/\/+$/, '');
    }
    const { protocol, host, port, pathname } = window.location;
    // When running on dev/SPA port 3000, route through the local gateway reverse proxy (/moodle-backend)
    if (port === '3000') {
      return `${protocol}//${host}/moodle-backend`;
    }
    // Support subdirectory hosting (/outlmstheme) while defaulting to root domain hosting (e.g. https://lms.wolinet.com)
    const lowerPath = pathname.toLowerCase();
    const appBase =
      lowerPath === '/outlmstheme' || lowerPath.startsWith('/outlmstheme/')
        ? '/outlmstheme'
        : '';
    return `${protocol}//${host}${appBase}/moodle-backend`;
  }
  return process.env.REACT_APP_MOODLE_URL
    ? process.env.REACT_APP_MOODLE_URL.replace(/\/+$/, '')
    : '/moodle-backend';
};

export const MOODLE_BASE_URL = getDynamicMoodleUrl();
// Public read-only catalog service token fallback for unauthenticated visitors browsing courses/categories
// Least-privilege token bound to the `outlms_public_catalog` service (read-only catalog functions only).
// Rejected by auth_middleware.php as a user session. Override per environment with REACT_APP_PUBLIC_CATALOG_TOKEN.
const PUBLIC_SERVICE_TOKEN = process.env.REACT_APP_PUBLIC_CATALOG_TOKEN || '6ac96cc49daa091ad9122d2dbfc9efe2';
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

/**
 * Safely parses a Fetch Response as JSON without ever throwing
 * `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`.
 */
export async function parseSafeJson<T = any>(response: Response, context = 'API'): Promise<T> {
  const raw = await response.text();
  const trimmed = (raw || '').trim();

  if (!trimmed) {
    throw new Error(`Empty response from ${context} (HTTP ${response.status})`);
  }

  // Fast path: valid JSON object or array
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      // Fall through to recovery below
    }
  }

  // If HTML was returned (e.g., SPA index.html `<!doctype html>` or Apache 404 page)
  if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html')) {
    throw new Error(`Endpoint returned HTML instead of JSON (${context}, HTTP ${response.status})`);
  }

  // Recover if PHP emitted a notice/warning before the JSON payload
  const firstBrace = trimmed.indexOf('{');
  const firstBracket = trimmed.indexOf('[');
  let startIdx = -1;
  if (firstBrace !== -1 && firstBracket !== -1) {
    startIdx = Math.min(firstBrace, firstBracket);
  } else {
    startIdx = Math.max(firstBrace, firstBracket);
  }

  if (startIdx !== -1) {
    const candidate = trimmed.slice(startIdx);
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // Ignore and throw descriptive error below
    }
  }

  throw new Error(`Invalid JSON response from ${context} (HTTP ${response.status})`);
}

/**
 * Encodes complex nested objects/arrays into Moodle's required query parameter format:
 * e.g. { criteria: [{ key: 'id', value: 1 }] } -> criteria[0][key]=id&criteria[0][value]=1
 */
function serializeMoodleParams(obj: Record<string, any>, prefix = ''): string[] {
  const parts: string[] = [];

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value === undefined || value === null) continue;

    const fullKey = prefix ? `${prefix}[${key}]` : key;

    if (typeof value === 'object' && !Array.isArray(value)) {
      parts.push(...serializeMoodleParams(value, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object') {
          parts.push(...serializeMoodleParams(item, `${fullKey}[${index}]`));
        } else {
          parts.push(`${encodeURIComponent(`${fullKey}[${index}]`)}=${encodeURIComponent(item)}`);
        }
      });
    } else {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`);
    }
  }

  return parts;
}

/**
 * Cached availability flag for Catalyst webservice_restful protocol.
 * null = untested, true = supported, false = fallback to standard rest/server.php
 */
let isRestfulProtocolAvailable: boolean | null = null;

/**
 * 1. Calls a Moodle Core Web Service function via adaptive REST protocol:
 *    - Tries modern Catalyst RESTful endpoint (`/webservice/restful/server.php/{function}`) with Bearer auth & native JSON.
 *    - Automatically falls back to standard RPC REST (`/webservice/rest/server.php`) if restful protocol is not enabled.
 */
export async function callMoodleWs<T = any>(
  wsfunction: string,
  params: Record<string, any> = {},
  customToken?: string
): Promise<T> {
  const token = customToken || localStorage.getItem('out_lms_ws_token') || PUBLIC_SERVICE_TOKEN;
  const baseUrl = getDynamicMoodleUrl();

  // Step A: Attempt modern RESTful protocol first if available
  if (isRestfulProtocolAvailable !== false) {
    try {
      const restfulUrl = `${baseUrl}/webservice/restful/server.php/${wsfunction}`;
      const hasParams = params && Object.keys(params).length > 0;

      const res = await fetch(restfulUrl, {
        method: hasParams ? 'POST' : 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: hasParams ? JSON.stringify(params) : undefined,
      });

      if (res.ok) {
        const json = await parseSafeJson<any>(res, wsfunction);
        if (json && !json.exception && !json.errorcode) {
          isRestfulProtocolAvailable = true;
          return json as T;
        }
      } else if (res.status === 404 || res.status === 403 || res.status === 501) {
        // webservice_restful protocol not enabled or route not available
        isRestfulProtocolAvailable = false;
      }
    } catch {
      // Network or protocol issue; cleanly fallback to standard REST
      isRestfulProtocolAvailable = false;
    }
  }

  // Step B: Standard Moodle Core Web Service fallback (`/webservice/rest/server.php`)
  const endpoint = `${baseUrl}/webservice/rest/server.php`;
  const baseParams = [
    `wstoken=${encodeURIComponent(token)}`,
    `wsfunction=${encodeURIComponent(wsfunction)}`,
    'moodlewsrestformat=json',
  ];

  const serializedParams = serializeMoodleParams(params);
  const allParams = [...baseParams, ...serializedParams].join('&');

  try {
    let response = await fetch(`${endpoint}?${allParams}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.status === 404 && !baseUrl.endsWith('/public')) {
      response = await fetch(`${baseUrl}/public/webservice/rest/server.php?${allParams}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const data = await parseSafeJson<any>(response, wsfunction);

    if (data && (data.exception || data.errorcode)) {
      console.warn(`Moodle API Exception (${wsfunction}):`, data);
      throw new Error(data.message || data.errorcode || 'Moodle API Error');
    }

    return data as T;
  } catch (error) {
    console.warn(`Moodle WS call failed (${wsfunction}):`, error);
    throw error;
  }
}

/**
 * 2. Calls Moodle 5.3 Modern REST API v2 (OpenAPI 3.1 `/api/rest/v2/*`)
 */
export async function callMoodleRestV2<T = any>(
  path: string = '/openapi.json',
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('out_lms_ws_token') || PUBLIC_SERVICE_TOKEN;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getDynamicMoodleUrl();
  const url = `${baseUrl}/public/api/rest/v2${cleanPath}`;
  const isSimpleSpecGet = cleanPath === '/openapi.json' && (!options?.method || options.method === 'GET');

  try {
    const response = await fetch(url, {
      ...options,
      headers: isSimpleSpecGet
        ? { Accept: 'application/json' }
        : {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options?.headers || {}),
        },
    });

    if (!response.ok) {
      throw new Error(`REST API v2 HTTP ${response.status}`);
    }
    return await parseSafeJson<T>(response, `REST v2 ${cleanPath}`);
  } catch (err) {
    if (cleanPath === '/openapi.json') {
      return {
        openapi: '3.1.0',
        info: {
          title: 'Moodle 5.3 LMS REST API v2 — The Open University of Tanzania (OUT)',
          version: '5.3.0',
        },
        paths: {
          '/courses': {},
          '/categories': {},
          '/enrolments': {},
          '/certificates/verify': {},
        },
      } as unknown as T;
    }
    throw err;
  }
}

export type ApiModuleType =
  | 'public'
  | 'student'
  | 'instructor'
  | 'course_studio'
  | 'admin_system'
  | 'router';

const PUBLIC_ACTIONS = new Set([
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
]);

const STUDENT_ACTIONS = new Set([
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
]);

const INSTRUCTOR_ACTIONS = new Set([
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
]);

const COURSE_STUDIO_ACTIONS = new Set([
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
]);

/**
 * Maps an API action name to its dedicated modular PHP controller
 */
export function resolveApiModuleForAction(action: string): ApiModuleType {
  const cleanAction = (action || '').split('&')[0].split('?')[0].trim();
  if (PUBLIC_ACTIONS.has(cleanAction)) return 'public';
  if (STUDENT_ACTIONS.has(cleanAction)) return 'student';
  if (INSTRUCTOR_ACTIONS.has(cleanAction) || cleanAction.startsWith('manage_instructor_')) {
    return 'instructor';
  }
  if (COURSE_STUDIO_ACTIONS.has(cleanAction)) return 'course_studio';
  return 'admin_system';
}

/**
 * Returns the full URL for a specific modular API controller
 * (`/moodle-backend/api/{module}_api.php` or `/moodle-backend/admin_api.php` for router)
 */
export function getModularApiUrl(moduleOrAction: ApiModuleType | string = 'admin_system'): string {
  const baseUrl = getDynamicMoodleUrl();
  if (moduleOrAction === 'router') {
    return `${baseUrl}/admin_api.php`;
  }
  const validModules: ApiModuleType[] = [
    'public',
    'student',
    'instructor',
    'course_studio',
    'admin_system',
  ];
  const resolvedModule: ApiModuleType = validModules.includes(moduleOrAction as ApiModuleType)
    ? (moduleOrAction as ApiModuleType)
    : resolveApiModuleForAction(moduleOrAction);
  return `${baseUrl}/api/${resolvedModule}_api.php`;
}

/**
 * 3. Calls OUT LMS Modular Role/Domain API (`/api/{module}_api.php`)
 */
export async function callInternalApi<T = any>(
  action: string,
  payload?: Record<string, any>,
  method: 'GET' | 'POST' = payload ? 'POST' : 'GET',
  moduleOverride?: ApiModuleType
): Promise<T> {
  const token = localStorage.getItem('out_lms_ws_token') || '';
  const parts = action.split('&');
  const primaryAction = parts[0];
  const targetModule = moduleOverride || resolveApiModuleForAction(primaryAction);
  const baseUrl = getModularApiUrl(targetModule);

  const queryParams = new URLSearchParams({ action: primaryAction });
  for (let i = 1; i < parts.length; i++) {
    const [k, v] = parts[i].split('=');
    if (k) queryParams.set(decodeURIComponent(k), v ? decodeURIComponent(v) : '');
  }
  if (token && method === 'GET') {
    queryParams.set('token', token);
  }
  if (method === 'GET' && payload) {
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) queryParams.set(k, String(v));
    });
  }

  const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(method === 'POST' ? { body: JSON.stringify({ ...(payload || {}), ...(token ? { token } : {}) }) } : {}),
  });

  const data = await parseSafeJson<any>(response, `${targetModule}_api:${primaryAction}`);
  if (!response.ok || data?.error) {
    throw new Error(data?.error || `API action '${primaryAction}' failed`);
  }
  return data as T;
}

export function callPublicApi<T = any>(
  action: string,
  payload?: Record<string, any>,
  method: 'GET' | 'POST' = payload ? 'POST' : 'GET'
): Promise<T> {
  return callInternalApi<T>(action, payload, method, 'public');
}

export function callStudentApi<T = any>(
  action: string,
  payload?: Record<string, any>,
  method: 'GET' | 'POST' = payload ? 'POST' : 'GET'
): Promise<T> {
  return callInternalApi<T>(action, payload, method, 'student');
}

export function callInstructorApi<T = any>(
  action: string,
  payload?: Record<string, any>,
  method: 'GET' | 'POST' = payload ? 'POST' : 'GET'
): Promise<T> {
  return callInternalApi<T>(action, payload, method, 'instructor');
}

export function callCourseStudioApi<T = any>(
  action: string,
  payload?: Record<string, any>,
  method: 'GET' | 'POST' = payload ? 'POST' : 'GET'
): Promise<T> {
  return callInternalApi<T>(action, payload, method, 'course_studio');
}

export function callAdminSystemApi<T = any>(
  action: string,
  payload?: Record<string, any>,
  method: 'GET' | 'POST' = payload ? 'POST' : 'GET'
): Promise<T> {
  return callInternalApi<T>(action, payload, method, 'admin_system');
}

/**
 * Authentication helper: exchanges user credentials for a Moodle Web Service token
 */
export async function fetchMoodleToken(
  username: string,
  password: string,
  service = process.env.REACT_APP_MOODLE_SERVICE || 'moodle_mobile_app'
): Promise<string> {
  const baseUrl = getDynamicMoodleUrl();
  const tokenUrl = `${baseUrl}${MOODLE_ENDPOINTS.TOKEN}`;
  const bodyParams = new URLSearchParams({
    username,
    password,
    service,
  });

  let response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: bodyParams.toString(),
  });

  if (response.status === 404 && !baseUrl.endsWith('/public')) {
    response = await fetch(`${baseUrl}/public${MOODLE_ENDPOINTS.TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: bodyParams.toString(),
    });
  }

  if (!response.ok) {
    throw new Error('Failed to reach Moodle token endpoint');
  }

  const data = await parseSafeJson<any>(response, 'login/token.php');
  if (data.error) {
    throw new Error(data.error);
  }

  if (data.token) {
    localStorage.setItem('out_lms_ws_token', data.token);
    return data.token;
  }

  throw new Error('No token returned from Moodle');
}

export const isMockMode = (): boolean => USE_MOCK;
