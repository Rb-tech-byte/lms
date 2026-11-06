<?php
/**
 * OUT LMS Modular API — Shared Core Bootstrap
 * Initializes Moodle $CFG/$DB, CORS headers, JSON payload parsing, RBAC helpers,
 * and Pure MariaDB Repository (db_instructor_repo.php).
 */
if (defined('OUTLMS_API_BOOTSTRAPPED')) {
    return;
}
define('OUTLMS_API_BOOTSTRAPPED', true);

define('AJAX_SCRIPT', true);
define('NO_MOODLE_COOKIES', true);
if (php_sapi_name() === 'cli' && !defined('CLI_SCRIPT')) {
    define('CLI_SCRIPT', true);
}
$moodleRoot = file_exists(dirname(__DIR__, 2) . '/config.php') ? dirname(__DIR__, 2) : dirname(__DIR__, 3) . '/moodle-backend';
require_once $moodleRoot . '/config.php';
require_once $CFG->libdir . '/adminlib.php';
require_once $CFG->dirroot . '/course/lib.php';
require_once $CFG->dirroot . '/group/lib.php';
require_once $CFG->libdir . '/gradelib.php';
require_once $CFG->dirroot . '/user/lib.php';
require_once __DIR__ . '/db_instructor_repo.php';

try {
    outlms_ensure_db_schema_and_seed($DB);
} catch (\Throwable $e) {
    // Non-fatal schema initialization
}

@header_remove('X-Powered-By');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -----------------------------------------------------------------------------
// Read JSON input payload if POST
// -----------------------------------------------------------------------------
$input = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    if (!empty($raw)) {
        $input = json_decode($raw, true) ?? [];
    }
    if (empty($input)) {
        $input = $_POST;
    }
}

$rawAction = $_GET['action'] ?? $input['action'] ?? (!empty($_SERVER['PATH_INFO']) ? trim($_SERVER['PATH_INFO'], '/') : 'get_settings');
$action = strtok(trim($rawAction), '?&');

// -----------------------------------------------------------------------------
// Helper: Resolve Moodle RBAC Role & Profile for a User Record
// -----------------------------------------------------------------------------

function outlms_get_frontend_base_url(): string {
    global $CFG;
    $envFrontend = getenv('OUTLMS_FRONTEND_URL') ?: getenv('APP_URL');
    if (!empty($envFrontend)) { return rtrim($envFrontend, '/'); }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!empty($origin) && preg_match('#^https?://[^/]+#i', $origin, $m)) { return rtrim($m[0], '/'); }
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    if (!empty($referer) && preg_match('#^https?://[^/]+#i', $referer, $m)) { return rtrim($m[0], '/'); }
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') || (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443);
    $protocol = $isHttps ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'] ?? 'lms.wolinet.com';
    return rtrim("{$protocol}{$host}", '/');
}

function resolve_outlms_user_profile(\stdClass $user): array {
    global $DB;
    $resolvedRole = 'student';
    $title = 'Undergraduate Scholar';
    $defaultDept = 'Faculty of Science, Technology & Environmental Studies';
    $dashboardUrl = '/student/student-dashboard';
    $defaultAvatar = 'assets/img/user/user-02.jpg';

    if (is_siteadmin($user->id)) {
        $resolvedRole = 'admin';
        $title = 'Chief System Administrator & Registrar';
        $defaultDept = 'Directorate of ICT Services';
        $dashboardUrl = '/admin/dashboard';
        $defaultAvatar = 'assets/img/user/user-03.jpg';
    } else {
        $hasInstructor = $DB->record_exists_sql(
            "SELECT ra.id FROM {role_assignments} ra
             JOIN {role} r ON r.id = ra.roleid
             WHERE ra.userid = ? AND r.shortname IN ('editingteacher', 'teacher', 'manager', 'coursecreator')",
            [$user->id]
        );
        if ($hasInstructor || in_array(strtolower($user->username), ['instructor', 'coursecreator'], true)) {
            $resolvedRole = 'instructor';
            $isCreator = strtolower($user->username) === 'coursecreator' || $DB->record_exists_sql(
                "SELECT ra.id FROM {role_assignments} ra JOIN {role} r ON r.id = ra.roleid WHERE ra.userid = ? AND r.shortname = 'coursecreator'",
                [$user->id]
            );
            $title = $isCreator && strtolower($user->username) === 'coursecreator'
                ? 'Curriculum & Course Creator — Directorate of Academic Quality'
                : 'Senior Lecturer & Course Director';
            $defaultDept = $isCreator && strtolower($user->username) === 'coursecreator'
                ? 'Directorate of Curriculum & Academic Quality'
                : 'Department of Computing & Information Technology';
            $dashboardUrl = '/instructor/instructor-dashboard';
            $defaultAvatar = 'assets/img/user/user-01.jpg';
        }
    }

    $regPrefix = $resolvedRole === 'admin' ? 'STAFF/ICT/' : ($resolvedRole === 'instructor' ? 'FAC/CS/' : 'OUT/' . date('Y', $user->timecreated ?: time()) . '/');
    $regNumber = !empty($user->idnumber)
        ? $user->idnumber
        : ($resolvedRole === 'student' && (int)$user->id === 3
            ? 'OUT/2024/04812'
            : $regPrefix . str_pad((string)$user->id, 4, '0', STR_PAD_LEFT));

    return [
        'id' => (string)$user->id,
        'userid' => (int)$user->id,
        'username' => $user->username,
        'firstname' => $user->firstname,
        'lastname' => $user->lastname,
        'name' => fullname($user),
        'email' => $user->email ?: ($user->username . '@out.ac.tz'),
        'role' => $resolvedRole,
        'avatar' => $defaultAvatar,
        'title' => $title,
        'department' => !empty($user->department) ? $user->department : $defaultDept,
        'regNumber' => $regNumber,
        'phone' => !empty($user->phone1) ? $user->phone1 : '+255 712 345 678',
        'dashboardUrl' => $dashboardUrl,
    ];
}

// -----------------------------------------------------------------------------
// Helpers: OUT LMS Dynamic Course & Category Media Resolution
// -----------------------------------------------------------------------------
function append_svg_cache_bust(string $path): string {
    if (empty($path)) return $path;
    if (str_ends_with(strtolower($path), '.svg')) {
        return $path . '?v=2';
    }
    return $path;
}

function get_outlms_course_media_map($DB): array {
    $map = [];
    try {
        $records = $DB->get_records('outlms_media', ['entity_type' => 'course', 'media_type' => 'thumbnail']);
        foreach ($records as $r) {
            $map[(int)$r->entity_id] = [
                'image' => append_svg_cache_bust((string)$r->file_path),
                'accent' => $r->accent_color ?: '#013BA6',
                'badge' => $r->badge_text ?: '',
                'alt' => $r->alt_text ?: '',
            ];
        }
    } catch (\Throwable $e) {}
    return $map;
}

function get_outlms_category_media_map($DB): array {
    $icons = [];
    $covers = [];
    try {
        $records = $DB->get_records('outlms_media', ['entity_type' => 'category']);
        foreach ($records as $r) {
            if ($r->media_type === 'icon') {
                $icons[(int)$r->entity_id] = [
                    'icon' => append_svg_cache_bust((string)$r->file_path),
                    'accent' => $r->accent_color ?: '#013BA6',
                    'badge' => $r->badge_text ?: '',
                ];
            } else if ($r->media_type === 'cover') {
                $covers[(int)$r->entity_id] = [
                    'cover' => append_svg_cache_bust((string)$r->file_path),
                    'accent' => $r->accent_color ?: '#013BA6',
                    'badge' => $r->badge_text ?: '',
                ];
            }
        }
    } catch (\Throwable $e) {}
    return ['icons' => $icons, 'covers' => $covers];
}

function get_outlms_course_thumbnail(int $courseId, string $shortname = '', array $mediaMap = []): string {
    if (isset($mediaMap[$courseId]['image']) && !empty($mediaMap[$courseId]['image'])) {
        return $mediaMap[$courseId]['image'];
    }
    $slug = preg_replace('/[^a-z0-9]+/', '-', strtolower($shortname));
    $slug = trim($slug, '-');
    if (!empty($slug)) {
        return "/assets/img/course/thumbnails/course-{$courseId}-{$slug}.svg?v=2";
    }
    return "/assets/img/course/thumbnails/course-2-cs101.svg?v=2";
}

// -----------------------------------------------------------------------------
// Security helpers
// -----------------------------------------------------------------------------
function outlms_deny(int $code, string $message): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message, 'code' => $code]);
    exit(1);
}

function outlms_request_token(array $input): string {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if ($authHeader && preg_match('/Bearer\s+(\S+)/i', $authHeader, $m)) {
        return trim($m[1]);
    }
    return trim((string)($_GET['token'] ?? $_POST['token'] ?? $input['token'] ?? ''));
}

/** Resolves a token strictly against mdl_external_tokens (no hardcoded or fallback tokens). */
function outlms_resolve_token_user(string $token) {
    global $DB;
    if ($token === '' || !preg_match('/^[a-zA-Z0-9]{16,64}$/', $token)) {
        return null;
    }
    $rec = $DB->get_record('external_tokens', ['token' => $token]);
    if (!$rec || (!empty($rec->validuntil) && (int)$rec->validuntil < time())) {
        return null;
    }
    // The public catalog token is embedded in the website bundle by design;
    // it must never be accepted as a user session by this API.
    $publicServiceId = $DB->get_field('external_services', 'id', ['shortname' => 'outlms_public_catalog']);
    if ($publicServiceId && (int)$rec->externalserviceid === (int)$publicServiceId) {
        return null;
    }
    $user = $DB->get_record('user', ['id' => $rec->userid, 'deleted' => 0, 'suspended' => 0]);
    return $user ?: null;
}

function outlms_user_is_instructor(int $userId): bool {
    global $DB;
    if ($userId <= 0) {
        return false;
    }
    if (is_siteadmin($userId)) {
        return true;
    }
    return $DB->record_exists_sql(
        "SELECT 1 FROM {role_assignments} ra JOIN {role} r ON r.id = ra.roleid
          WHERE ra.userid = ? AND r.shortname IN ('editingteacher', 'teacher', 'manager', 'coursecreator')",
        [$userId]
    );
}

function outlms_get_kickstart_templates_catalog(): array {
    global $DB;
    $blueprints = [
        1 => [
            'id' => 1,
            'sort' => 1,
            'code' => 'undergraduate_degree',
            'title' => 'Undergraduate Degree Programme (TCU & SARIS Accredited)',
            'short_title' => 'Undergraduate Degree',
            'badge' => '8 Semester Units',
            'icon' => 'isax-verify',
            'accentColor' => '#013BA6',
            'target_format' => 'tiles',
            'num_sections' => 8,
            'description' => 'Standardized 8-module university semester syllabus with SARIS rotating QR attendance tracking, continuous assessment assignments, grading rubrics, and final exam readiness.',
            'preview_url' => '/course/course-details?id=2',
            'tags' => ['undergraduate', 'degree', 'saris', 'tcu'],
            'included_capabilities' => [
                'SARIS Rotating QR Attendance Register',
                'Continuous Assessment Assignment & Rubric',
                'Interactive Visual Tiles Grid Layout',
                'Milestone Completion Telemetry Bar',
            ],
            'sections' => [
                1 => ['name' => 'Unit 1: Foundations, Theoretical Framework & Historical Context', 'summary' => '<p>Core theoretical foundations, academic terminology, and institutional context aligned with TCU degree standards.</p>'],
                2 => ['name' => 'Unit 2: Core Analytical Principles & Applied Methodologies', 'summary' => '<p>Analytical frameworks, problem-solving methodologies, and structured academic reading guides.</p>'],
                3 => ['name' => 'Unit 3: Regulatory Standards, Governance & Institutional Frameworks', 'summary' => '<p>National and East African regulatory compliance, governance models, and statutory analysis.</p>'],
                4 => ['name' => 'Unit 4: Case Study Analysis & Mid-Semester Continuous Assessment', 'summary' => '<p>Applied Tanzanian and regional case studies with mid-semester continuous assessment rubric (30% weight).</p>'],
                5 => ['name' => 'Unit 5: Quantitative Modeling & Empirical Evaluation', 'summary' => '<p>Data interpretation, empirical modeling, and practical workshop exercises.</p>'],
                6 => ['name' => 'Unit 6: Field Practice & Regional Center Seminar Workshop', 'summary' => '<p>Interactive regional center seminar activities with SARIS QR attendance verification.</p>'],
                7 => ['name' => 'Unit 7: Synthesis, Policy Formulation & Peer Review', 'summary' => '<p>Capstone synthesis, peer critique, and academic policy brief preparation.</p>'],
                8 => ['name' => 'Unit 8: Comprehensive Revision & Final Examination Readiness', 'summary' => '<p>Past examination paper walkthroughs, marking scheme review, and final proctored exam preparation.</p>'],
            ],
        ],
        2 => [
            'id' => 2,
            'sort' => 2,
            'code' => 'postgraduate_seminar',
            'title' => 'Postgraduate & Masters Seminar (Research & Dissertation)',
            'short_title' => 'Postgraduate & Masters',
            'badge' => '6 Research Gates',
            'icon' => 'isax-book-1',
            'accentColor' => '#06b6d4',
            'target_format' => 'onetopic',
            'num_sections' => 6,
            'description' => 'Advanced postgraduate seminar layout featuring horizontal tabbed research gates, literature review synthesis, VPL cloud data modeling labs, and thesis defense evaluation.',
            'preview_url' => '/course/course-details?id=3',
            'tags' => ['postgraduate', 'masters', 'research', 'seminar'],
            'included_capabilities' => [
                'OneTopic Horizontal Research Gate Tabs',
                'VPL Cloud Data & Statistical Sandbox Lab',
                'Supervisor Checkpoint & Thesis Rubric',
                'SARIS Postgraduate Colloquium Attendance',
            ],
            'sections' => [
                1 => ['name' => 'Gate 1: Epistemological Foundations & Advanced Research Design', 'summary' => '<p>Research paradigms, problem statement formulation, and conceptual framework engineering.</p>'],
                2 => ['name' => 'Gate 2: Systematic Literature Review & Bibliometric Synthesis', 'summary' => '<p>Critical synthesis of scholarly literature, citation matrix construction, and research gap identification.</p>'],
                3 => ['name' => 'Gate 3: Quantitative & Qualitative Data Collection Instruments', 'summary' => '<p>Sampling strategies, survey/interview instrument validation, and reliability testing.</p>'],
                4 => ['name' => 'Gate 4: Computational Data Analysis & Cloud Sandbox Modeling', 'summary' => '<p>Reproducible statistical and computational modeling using the OUT Cloud Virtual Lab IDE.</p>'],
                5 => ['name' => 'Gate 5: Ethical Clearance, Academic Integrity & Draft Manuscript', 'summary' => '<p>Research clearance protocols, originality verification, and full chapter manuscript submission.</p>'],
                6 => ['name' => 'Gate 6: Postgraduate Seminar Colloquium & Thesis Defense', 'summary' => '<p>Oral defense presentation rubric, external examiner feedback resolution, and final deposit.</p>'],
            ],
        ],
        3 => [
            'id' => 3,
            'sort' => 3,
            'code' => 'short_course_cpd',
            'title' => 'Short Courses & CPD Micro-Credential (Verifiable Certificate)',
            'short_title' => 'Short Course & CPD',
            'badge' => '4 Executive Sprints',
            'icon' => 'isax-award',
            'accentColor' => '#10b981',
            'target_format' => 'topcoll',
            'num_sections' => 4,
            'description' => 'High-velocity executive & professional development blueprint with compact collapsible sprints, competency quizzes, automated retention nudges, and TCU/SARIS QR-verifiable CustomCert PDF issuance.',
            'preview_url' => '/course/course-details?id=7',
            'tags' => ['cpd', 'short-course', 'certificate', 'executive'],
            'included_capabilities' => [
                'TCU & SARIS QR-Verifiable CustomCert PDF',
                'Compact Collapsible Accordion Sprints',
                'Automated 7-Day Study Momentum Nudges',
                'Executive Competency Assessment & XP Badge',
            ],
            'sections' => [
                1 => ['name' => 'Sprint 1: Executive Briefing & Industry Competency Standards', 'summary' => '<p>Core professional standards, operational objectives, and industry benchmark overview.</p>'],
                2 => ['name' => 'Sprint 2: Core Operational Toolkit & Guided Walkthroughs', 'summary' => '<p>Hands-on practitioner templates, standard operating procedures, and guided video demonstrations.</p>'],
                3 => ['name' => 'Sprint 3: Real-World Simulation & Applied Case Assessment', 'summary' => '<p>Interactive workplace scenario simulation and practical competency deliverable.</p>'],
                4 => ['name' => 'Sprint 4: Capstone Evaluation & Verifiable Credential Issuance', 'summary' => '<p>Final mastery verification and instant issuance of your cryptographically verifiable OUT CPD Certificate.</p>'],
            ],
        ],
        4 => [
            'id' => 4,
            'sort' => 4,
            'code' => 'stem_coding_lab',
            'title' => 'STEM & Computer Science Lab Course (CodeRunner & VPL IDE)',
            'short_title' => 'STEM & Coding Lab',
            'badge' => '6 Engineering Labs',
            'icon' => 'isax-code-circle',
            'accentColor' => '#8b5cf6',
            'target_format' => 'tiles',
            'num_sections' => 6,
            'description' => 'Hands-on engineering and software development curriculum pre-linked with automated CodeRunner unit-test grading questions and browser-based VPL Cloud IDE workspaces.',
            'preview_url' => '/course/course-details?id=8',
            'tags' => ['stem', 'coding', 'coderunner', 'vpl'],
            'included_capabilities' => [
                'CodeRunner Automated Unit-Test Grading Engine',
                'Browser-Based VPL Cloud IDE (Python, Node.js, SQL)',
                'Algorithmic Time-Complexity O(n) Benchmarks',
                'Visual Tiles Engineering Lab Launchpad',
            ],
            'sections' => [
                1 => ['name' => 'Lab 1: Development Environment Setup & Algorithmic Foundations', 'summary' => '<p>Cloud workspace initialization, runtime configuration, and foundational algorithmic patterns.</p>'],
                2 => ['name' => 'Lab 2: Data Structures, Memory Management & Complexity Analysis', 'summary' => '<p>Implementation of core data structures with asymptotic time and space complexity assertions.</p>'],
                3 => ['name' => 'Lab 3: Modular Architecture & Automated Unit Testing (CodeRunner)', 'summary' => '<p>Writing deterministic functions evaluated against multi-case hidden unit tests in CodeRunner.</p>'],
                4 => ['name' => 'Lab 4: API Engineering, Database Transactions & Security Hardening', 'summary' => '<p>RESTful endpoint design, parameterized SQL queries, and OWASP input validation labs.</p>'],
                5 => ['name' => 'Lab 5: Distributed Cloud Sandbox Lab & Performance Benchmarking (VPL)', 'summary' => '<p>Full-stack sandbox execution in VPL with automated rubric grading and telemetry inspection.</p>'],
                6 => ['name' => 'Lab 6: Capstone Engineering Sprint & Automated Grading Evaluation', 'summary' => '<p>End-to-end production system challenge with automated test suite verification and credential unlock.</p>'],
            ],
        ],
    ];

    try {
        if ($DB->get_manager()->table_exists('format_kickstart_template')) {
            $dbRecords = $DB->get_records('format_kickstart_template', ['visible' => 1], 'sort ASC, id ASC');
            foreach ($dbRecords as $rec) {
                $sortIdx = (int)($rec->sort ?: $rec->id);
                if (isset($blueprints[$sortIdx])) {
                    $blueprints[$sortIdx]['db_id'] = (int)$rec->id;
                    if (!empty($rec->title)) {
                        $blueprints[$sortIdx]['title'] = $rec->title;
                    }
                    if (!empty($rec->preview_url)) {
                        $blueprints[$sortIdx]['preview_url'] = $rec->preview_url;
                    }
                }
            }
        }
    } catch (\Throwable $e) {}

    return array_values($blueprints);
}

function outlms_apply_kickstart_template(int $courseId, int $templateId): array {
    global $DB;
    $course = $DB->get_record('course', ['id' => $courseId]);
    if (!$course) {
        throw new \InvalidArgumentException("Target course #{$courseId} not found.");
    }

    $catalog = outlms_get_kickstart_templates_catalog();
    $selected = $catalog[0];
    foreach ($catalog as $tpl) {
        if ((int)$tpl['id'] === $templateId || (int)($tpl['db_id'] ?? 0) === $templateId) {
            $selected = $tpl;
            break;
        }
    }

    $now = time();
    $short = $course->shortname ?: ('OUT-' . $courseId);
    $title = $course->fullname ?: 'OUT Academic Programme';

    // Update course metadata & enable completion tracking
    $DB->set_field('course', 'enablecompletion', 1, ['id' => $courseId]);
    $DB->set_field('course', 'timemodified', $now, ['id' => $courseId]);

    // Ensure Section 0 exists with rich Kickstart orientation banner
    $sec0 = $DB->get_record('course_sections', ['course' => $courseId, 'section' => 0]);
    $sec0Summary = "<p><strong>{$selected['title']}</strong> — Provisioned via OUT LMS Kickstart Template Engine.</p><p>{$selected['description']}</p>";
    if ($sec0) {
        $sec0->name = "Course Orientation, Syllabus & Governance ({$short})";
        $sec0->summary = $sec0Summary;
        $sec0->summaryformat = 1;
        $sec0->timemodified = $now;
        $DB->update_record('course_sections', $sec0);
    } else {
        $sec0 = new \stdClass();
        $sec0->course = $courseId;
        $sec0->section = 0;
        $sec0->name = "Course Orientation, Syllabus & Governance ({$short})";
        $sec0->summary = $sec0Summary;
        $sec0->summaryformat = 1;
        $sec0->sequence = '';
        $sec0->visible = 1;
        $sec0->timemodified = $now;
        $sec0->id = $DB->insert_record('course_sections', $sec0);
    }

    // Provision all template sections
    $provisionedSections = [];
    foreach ($selected['sections'] as $secNum => $secMeta) {
        $existingSec = $DB->get_record('course_sections', ['course' => $courseId, 'section' => $secNum]);
        if ($existingSec) {
            $existingSec->name = $secMeta['name'];
            $existingSec->summary = $secMeta['summary'];
            $existingSec->summaryformat = 1;
            $existingSec->visible = 1;
            $existingSec->timemodified = $now;
            $DB->update_record('course_sections', $existingSec);
        } else {
            $newSec = new \stdClass();
            $newSec->course = $courseId;
            $newSec->section = $secNum;
            $newSec->name = $secMeta['name'];
            $newSec->summary = $secMeta['summary'];
            $newSec->summaryformat = 1;
            $newSec->sequence = '';
            $newSec->visible = 1;
            $newSec->timemodified = $now;
            $DB->insert_record('course_sections', $newSec);
        }
        $provisionedSections[] = $secMeta['name'];
    }

    // Helper to link a module instance into mdl_course_modules & section sequence
    $attachModule = function (int $secNum, string $modName, int $instanceId) use ($DB, $courseId, $now): int {
        $modId = (int)$DB->get_field('modules', 'id', ['name' => $modName]);
        if (!$modId || $instanceId <= 0) {
            return 0;
        }
        $existingCm = $DB->get_record('course_modules', [
            'course' => $courseId,
            'module' => $modId,
            'instance' => $instanceId,
        ]);
        if ($existingCm) {
            return (int)$existingCm->id;
        }
        $sec = $DB->get_record('course_sections', ['course' => $courseId, 'section' => $secNum]);
        if (!$sec) {
            return 0;
        }
        $cm = new \stdClass();
        $cm->course = $courseId;
        $cm->module = $modId;
        $cm->instance = $instanceId;
        $cm->section = $sec->id;
        $cm->idnumber = '';
        $cm->added = $now;
        $cm->score = 0;
        $cm->indent = 0;
        $cm->visible = 1;
        $cm->visibleoncoursepage = 1;
        $cm->visibleold = 1;
        $cm->groupmode = 0;
        $cm->groupingid = 0;
        $cm->completion = 1;
        $cm->completionview = 1;
        $cm->completionexpected = 0;
        $cm->showdescription = 1;
        $cm->deletioninprogress = 0;
        $cmId = (int)$DB->insert_record('course_modules', $cm);

        $seq = array_filter(explode(',', (string)$sec->sequence));
        if (!in_array((string)$cmId, $seq, true)) {
            $seq[] = (string)$cmId;
            $DB->set_field('course_sections', 'sequence', implode(',', $seq), ['id' => $sec->id]);
        }
        return $cmId;
    };

    $provisionedModules = [];

    // 1. Provision SARIS QR Attendance in Section 1
    if ($DB->get_manager()->table_exists('attendance')) {
        $att = $DB->get_record('attendance', ['course' => $courseId]);
        if (!$att) {
            $attObj = new \stdClass();
            $attObj->course = $courseId;
            $attObj->name = "{$short} — SARIS Digital Attendance & QR Check-In Register";
            $attObj->grade = 100;
            $attObj->timemodified = $now;
            $attObj->intro = "Automated SARIS rotating QR attendance register provisioned by {$selected['short_title']} Kickstart template.";
            $attObj->introformat = 1;
            $attObj->sessiondetailspos = 'left';
            $attObj->showsessiondetails = 1;
            $attObj->showextrauserdetails = 1;
            $attId = (int)$DB->insert_record('attendance', $attObj);
            $att = $DB->get_record('attendance', ['id' => $attId]);
        }
        if ($att) {
            $attachModule(1, 'attendance', (int)$att->id);
            $provisionedModules[] = $att->name;
        }
    }

    // 2. Provision VPL Cloud Lab in Section 2 (especially for STEM & Postgraduate)
    if ($DB->get_manager()->table_exists('vpl')) {
        $vpl = $DB->get_record('vpl', ['course' => $courseId]);
        if (!$vpl) {
            $vObj = new \stdClass();
            $vObj->course = $courseId;
            $vObj->name = "{$short} — Interactive Cloud Sandbox Lab ({$selected['short_title']})";
            $vObj->shortdescription = "Browser-based multi-language Cloud IDE lab provisioned from Kickstart blueprint.";
            $vObj->intro = "<p>Complete the practical coding and analytical exercises for <strong>{$title}</strong> and run automated unit assertions.</p>";
            $vObj->introformat = 1;
            $vObj->startdate = $now - 86400 * 7;
            $vObj->duedate = $now + 86400 * 60;
            $vObj->maxfiles = 5;
            $vObj->maxfilesize = 1048576;
            $vObj->grade = 100;
            $vObj->visiblegrade = 1;
            $vObj->run = 1;
            $vObj->debug = 1;
            $vObj->evaluate = 1;
            $vObj->evaluateonsubmission = 1;
            $vObj->automaticgrading = 1;
            $vObj->maxexetime = 10;
            $vObj->maxexememory = 67108864;
            $vObj->timemodified = $now;
            $vObj->runscript = 'python3';
            $vObj->evaluator = 'biotes';
            $vplId = (int)$DB->insert_record('vpl', $vObj);
            $vpl = $DB->get_record('vpl', ['id' => $vplId]);
        }
        if ($vpl) {
            $attachModule(min(2, count($provisionedSections)), 'vpl', (int)$vpl->id);
            $provisionedModules[] = $vpl->name;
        }
    }

    // 3. Provision Verifiable CustomCert Credential in Final Section
    if ($DB->get_manager()->table_exists('customcert')) {
        $cert = $DB->get_record('customcert', ['course' => $courseId]);
        if (!$cert) {
            $cObj = new \stdClass();
            $cObj->course = $courseId;
            $cObj->templateid = 1;
            $cObj->name = "TCU & SARIS Verifiable Credential — {$short}";
            $cObj->intro = "Official QR-verifiable digital certificate issued upon completing {$title}.";
            $cObj->introformat = 1;
            $cObj->requiredtime = 0;
            $cObj->verifyany = 1;
            $cObj->deliveryoption = 'I';
            $cObj->usecustomfilename = 0;
            $cObj->emailstudents = 1;
            $cObj->emailteachers = 0;
            $cObj->issueautomatically = 1;
            $cObj->completionemailed = 0;
            $cObj->protection = 'modify';
            $cObj->language = 'en';
            $cObj->timecreated = $now;
            $cObj->timemodified = $now;
            $certId = (int)$DB->insert_record('customcert', $cObj);
            $cert = $DB->get_record('customcert', ['id' => $certId]);
        }
        if ($cert) {
            $attachModule(count($provisionedSections), 'customcert', (int)$cert->id);
            $provisionedModules[] = $cert->name;
        }
    }

    // 4. Provision Re-engagement Automated Retention Nudge
    if ($DB->get_manager()->table_exists('reengagement')) {
        $reeng = $DB->get_record('reengagement', ['course' => $courseId]);
        if (!$reeng) {
            $rObj = new \stdClass();
            $rObj->course = $courseId;
            $rObj->name = "{$short} — 7-Day Study Momentum & Milestone Reminder";
            $rObj->timecreated = $now;
            $rObj->timemodified = $now;
            $rObj->emailuser = 1;
            $rObj->emailsubject = "[{$short}] Keep Your OUT Study Momentum Active!";
            $rObj->emailcontent = "Dear Scholar, your next unit in {$title} is ready.";
            $rObj->emailcontentformat = 1;
            $rObj->emailcontentmanager = "Automated cohort retention reminder triggered.";
            $rObj->emailcontentmanagerformat = 1;
            $rObj->emailsubjectmanager = "[{$short}] SARIS Retention Telemetry";
            $rObj->emailrecipient = 0;
            $rObj->duration = 604800;
            $rObj->remindercount = 3;
            $rObj->suppresstarget = 0;
            $rObj->emaildelay = 604800;
            $reengId = (int)$DB->insert_record('reengagement', $rObj);
            $reeng = $DB->get_record('reengagement', ['id' => $reengId]);
        }
        if ($reeng) {
            $attachModule(min(3, count($provisionedSections)), 'reengagement', (int)$reeng->id);
            $provisionedModules[] = $reeng->name;
        }
    }

    try {
        rebuild_course_cache($courseId, true);
    } catch (\Throwable $e) {}

    return [
        'course_id' => $courseId,
        'course_shortname' => $short,
        'template_id' => $selected['id'],
        'template_code' => $selected['code'],
        'template_title' => $selected['title'],
        'target_format' => $selected['target_format'],
        'sections_provisioned' => count($provisionedSections),
        'section_titles' => $provisionedSections,
        'modules_provisioned' => $provisionedModules,
        'applied_at' => date('d M Y, h:i:s A', $now),
    ];
}
