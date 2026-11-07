<?php
/**
 * Open University of Tanzania (OUT) LMS
 * Automated Demo Users Seeder & Production Identity Provisioner
 *
 * Seeds or verifies institutional demo accounts:
 *   1. Super Administrator (admin / Admin@2026!)
 *   2. Course Director & Senior Lecturer (instructor / Instructor@2026!)
 *   3. Registered Undergraduate Scholar (student / Student@2026!)
 *   4. Curriculum & Course Creator (coursecreator / Creator@2026!)
 *
 * Usage:
 *   php seed_demo_users.php
 *   php backend/seed_demo_users.php
 */

define('CLI_SCRIPT', true);

// -----------------------------------------------------------------------------
// 1. Locate and Load Configuration
// -----------------------------------------------------------------------------
$searchRoots = [
    __DIR__,
    dirname(__DIR__),
    dirname(__DIR__) . '/moodle-backend',
    dirname(__DIR__, 2) . '/moodle-backend',
    '/home/lms.wolinet.com/public_html/moodle-backend',
    '/home/lms.wolinet.com/public_html',
    dirname(__DIR__, 2),
];

$configPath = null;
foreach ($searchRoots as $root) {
    if (file_exists($root . '/config.php')) {
        $configPath = $root . '/config.php';
        break;
    }
}

// Demo Account Definitions
$demoAccounts = [
    [
        'id'          => 2,
        'username'    => 'admin',
        'password'    => 'Admin@2026!',
        'firstname'   => 'OUT LMS',
        'lastname'    => 'Administrator',
        'email'       => 'admin@out.ac.tz',
        'department'  => 'Directorate of ICT Services',
        'phone1'      => '+255 22 266 8820',
        'city'        => 'Dar es Salaam',
        'country'     => 'TZ',
        'role'        => 'admin',
        'title'       => 'Chief System Administrator & Registrar',
    ],
    [
        'id'          => 4,
        'username'    => 'instructor',
        'password'    => 'Instructor@2026!',
        'firstname'   => 'Dr. Amina',
        'lastname'    => 'Kilindo',
        'email'       => 'instructor@out.ac.tz',
        'department'  => 'Department of Computing & Information Technology',
        'phone1'      => '+255 754 987 654',
        'city'        => 'Dar es Salaam',
        'country'     => 'TZ',
        'role'        => 'instructor',
        'title'       => 'Senior Lecturer & Course Director',
    ],
    [
        'id'          => 3,
        'username'    => 'student',
        'password'    => 'Student@2026!',
        'firstname'   => 'Baraka',
        'lastname'    => 'Mkwawa',
        'email'       => 'student@out.ac.tz',
        'department'  => 'Faculty of Science, Technology & Environmental Studies',
        'phone1'      => '+255 712 345 678',
        'city'        => 'Dar es Salaam',
        'country'     => 'TZ',
        'role'        => 'student',
        'title'       => 'BSc. Computer Science Student',
    ],
    [
        'id'          => 14,
        'username'    => 'coursecreator',
        'password'    => 'Creator@2026!',
        'firstname'   => 'Prof. Joseph',
        'lastname'    => 'Mbwambo',
        'email'       => 'coursecreator@out.ac.tz',
        'department'  => 'Directorate of Curriculum & Academic Quality',
        'phone1'      => '+255 754 112 233',
        'city'        => 'Dar es Salaam',
        'country'     => 'TZ',
        'role'        => 'coursecreator',
        'title'       => 'Curriculum & Course Creator',
    ],
];

echo "==============================================================================\n";
echo " [OUT LMS] Seeding Demo Users & Production Identity Provisioner\n";
echo "==============================================================================\n\n";

$moodleLoaded = false;
if ($configPath) {
    try {
        require_once $configPath;
        if (isset($CFG) && isset($DB)) {
            $moodleLoaded = true;
            echo "[OK] Moodle DB connection active: {$CFG->dbname} ({$CFG->dbhost})\n\n";
        }
    } catch (\Throwable $e) {
        echo "[INFO] Moodle full bootstrap notice: " . $e->getMessage() . "\n";
        echo "       Switching to direct high-speed PDO provisioner...\n\n";
    }
}

// -----------------------------------------------------------------------------
// PATH A: Native Moodle Framework Provisioning
// -----------------------------------------------------------------------------
if ($moodleLoaded) {
    global $CFG, $DB;
    @require_once $CFG->libdir . '/adminlib.php';
    @require_once $CFG->dirroot . '/course/lib.php';
    @require_once $CFG->dirroot . '/user/lib.php';
    @require_once $CFG->libdir . '/enrollib.php';

    $service = $DB->get_record('external_services', ['shortname' => 'moodle_mobile_app']);
    if (!$service) {
        $service = $DB->get_record_select('external_services', 'enabled = 1', [], 'id ASC', '*', 0, 1);
    }
    $serviceId = $service ? (int)$service->id : 1;
    $sysContext = class_exists('\context_system') ? \context_system::instance() : null;

    foreach ($demoAccounts as $def) {
        $uname = $def['username'];
        $plainPass = $def['password'];
        $user = $DB->get_record_select('user', '(username = ? OR email = ?) AND deleted = 0', [$uname, $def['email']]);
        if (!$user && $uname === 'admin') {
            $user = $DB->get_record('user', ['id' => 2, 'deleted' => 0]);
        }

        $now = time();
        $hashed = password_hash($plainPass, PASSWORD_DEFAULT);
        if (function_exists('hash_internal_user_password')) {
            try { $hashed = hash_internal_user_password($plainPass); } catch (\Throwable $e) {}
        }

        if ($user) {
            $user->firstname    = $def['firstname'];
            $user->lastname     = $def['lastname'];
            $user->department   = $def['department'];
            $user->phone1       = $def['phone1'];
            $user->city         = $def['city'];
            $user->country      = $def['country'];
            $user->password     = $hashed;
            $user->timemodified = $now;
            $user->suspended    = 0;
            $user->confirmed    = 1;
            $DB->update_record('user', $user);
            if (function_exists('update_internal_user_password')) {
                try { update_internal_user_password($user, $plainPass); } catch (\Throwable $e) {}
            }
            echo "  [UPDATED] User '{$uname}' (ID: {$user->id})\n";
        } else {
            $newUser = new \stdClass();
            $newUser->auth         = 'manual';
            $newUser->confirmed    = 1;
            $newUser->policyagreed = 1;
            $newUser->deleted      = 0;
            $newUser->suspended    = 0;
            $newUser->mnethostid   = 1;
            $newUser->username     = $uname;
            $newUser->password     = $hashed;
            $newUser->firstname    = $def['firstname'];
            $newUser->lastname     = $def['lastname'];
            $newUser->email        = $def['email'];
            $newUser->department   = $def['department'];
            $newUser->phone1       = $def['phone1'];
            $newUser->city         = $def['city'];
            $newUser->country      = $def['country'];
            $newUser->lang         = 'en';
            $newUser->calendartype = 'gregorian';
            $newUser->timezone     = 'Africa/Dar_es_Salaam';
            $newUser->timecreated  = $now;
            $newUser->timemodified = $now;
            $newId = $DB->insert_record('user', $newUser);
            $user = $DB->get_record('user', ['id' => $newId]);
            echo "  [CREATED] User '{$uname}' (ID: {$user->id})\n";
        }

        // Roles & Enrolments
        if ($def['role'] === 'admin') {
            $siteAdmins = explode(',', (string)get_config(null, 'siteadmins'));
            $siteAdmins = array_filter(array_map('trim', $siteAdmins));
            if (!in_array((string)$user->id, $siteAdmins, true)) {
                $siteAdmins[] = (string)$user->id;
                set_config('siteadmins', implode(',', array_unique($siteAdmins)));
                echo "    -> Site Administrator privileges confirmed\n";
            }
        } elseif ($def['role'] === 'coursecreator' && $sysContext && function_exists('role_assign')) {
            $creatorRole = $DB->get_record('role', ['shortname' => 'coursecreator']);
            if ($creatorRole && !user_has_role_assignment($user->id, $creatorRole->id, $sysContext->id)) {
                role_assign($creatorRole->id, $user->id, $sysContext->id);
                echo "    -> Assigned 'coursecreator' role in System Context\n";
            }
        }

        // Target Course 2
        $targetCourse = $DB->get_record('course', ['id' => 2]);
        if ($targetCourse && class_exists('\context_course')) {
            $courseContext = \context_course::instance(2);
            if ($def['role'] === 'instructor') {
                $editingTeacherRole = $DB->get_record('role', ['shortname' => 'editingteacher']);
                if ($editingTeacherRole && function_exists('role_assign') && !user_has_role_assignment($user->id, $editingTeacherRole->id, $courseContext->id)) {
                    role_assign($editingTeacherRole->id, $user->id, $courseContext->id);
                }
                if (function_exists('enrol_get_plugin') && ($manualPlugin = enrol_get_plugin('manual'))) {
                    $instance = $DB->get_record('enrol', ['courseid' => 2, 'enrol' => 'manual']);
                    if ($instance) {
                        $manualPlugin->enrol_user($instance, $user->id, $editingTeacherRole ? $editingTeacherRole->id : 3);
                        echo "    -> Enrolled as Course Director in Course 2 (CS101)\n";
                    }
                }
            } elseif ($def['role'] === 'student') {
                $studentRole = $DB->get_record('role', ['shortname' => 'student']);
                if ($studentRole && function_exists('role_assign') && !user_has_role_assignment($user->id, $studentRole->id, $courseContext->id)) {
                    role_assign($studentRole->id, $user->id, $courseContext->id);
                }
                if (function_exists('enrol_get_plugin') && ($manualPlugin = enrol_get_plugin('manual'))) {
                    $instance = $DB->get_record('enrol', ['courseid' => 2, 'enrol' => 'manual']);
                    if ($instance) {
                        $manualPlugin->enrol_user($instance, $user->id, $studentRole ? $studentRole->id : 5);
                        echo "    -> Enrolled as Active Scholar in Course 2 (CS101)\n";
                    }
                }
            }
        }

        // Token
        $existingToken = $DB->get_record('external_tokens', ['userid' => $user->id]);
        if (!$existingToken || empty($existingToken->token)) {
            $token = md5(uniqid((string)$user->id, true) . microtime() . bin2hex(random_bytes(8)));
            $newToken = new \stdClass();
            $newToken->token = $token;
            $newToken->tokentype = 0;
            $newToken->userid = $user->id;
            $newToken->externalserviceid = $serviceId;
            $newToken->contextid = 1;
            $newToken->creatorid = $user->id;
            $newToken->timecreated = time();
            $newToken->lastaccess = time();
            $newToken->validuntil = 0;
            $DB->insert_record('external_tokens', $newToken);
            echo "    -> Provisioned external REST Token: {$token}\n";
        }
    }
} else {
    // -----------------------------------------------------------------------------
    // PATH B: Direct Resilient PDO Provisioning
    // -----------------------------------------------------------------------------
    $dbHost = getenv('MOODLE_DB_HOST') ?: '127.0.0.1';
    $dbPort = getenv('MOODLE_DB_PORT') ? (int)getenv('MOODLE_DB_PORT') : 3306;
    $dbName = getenv('MOODLE_DB_NAME') ?: (DIRECTORY_SEPARATOR === '\\' ? 'moodle_out' : 'lms_lms');
    $dbUser = getenv('MOODLE_DB_USER') ?: (DIRECTORY_SEPARATOR === '\\' ? 'root' : 'lms_out');
    $dbPass = getenv('MOODLE_DB_PASSWORD') !== false ? (string)getenv('MOODLE_DB_PASSWORD') : (DIRECTORY_SEPARATOR === '\\' ? '' : 'PA+JaP*0elAzFlEr');
    $prefix = getenv('MOODLE_DB_PREFIX') ?: 'mdl_';

    echo "[INFO] Connecting via Direct PDO to {$dbName}@{$dbHost}:{$dbPort} as '{$dbUser}'...\n";
    $pdo = new PDO("mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    echo "[OK] Direct PDO connection established!\n\n";

    $now = time();
    foreach ($demoAccounts as $def) {
        $uname = $def['username'];
        $plainPass = $def['password'];
        $hashed = password_hash($plainPass, PASSWORD_DEFAULT);

        // Check user existence
        $stmt = $pdo->prepare("SELECT * FROM `{$prefix}user` WHERE (username = ? OR email = ?) AND deleted = 0 LIMIT 1");
        $stmt->execute([$uname, $def['email']]);
        $existing = $stmt->fetch();

        if ($existing) {
            $userId = (int)$existing['id'];
            $upd = $pdo->prepare("UPDATE `{$prefix}user` SET firstname = ?, lastname = ?, email = ?, department = ?, phone1 = ?, city = ?, country = ?, password = ?, suspended = 0, confirmed = 1, timemodified = ? WHERE id = ?");
            $upd->execute([$def['firstname'], $def['lastname'], $def['email'], $def['department'], $def['phone1'], $def['city'], $def['country'], $hashed, $now, $userId]);
            echo "  [UPDATED] User '{$uname}' (ID: {$userId})\n";
        } else {
            $ins = $pdo->prepare("INSERT INTO `{$prefix}user` (auth, confirmed, policyagreed, deleted, suspended, mnethostid, username, password, firstname, lastname, email, department, phone1, city, country, lang, calendartype, timezone, timecreated, timemodified) VALUES ('manual', 1, 1, 0, 0, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en', 'gregorian', 'Africa/Dar_es_Salaam', ?, ?)");
            $ins->execute([$uname, $hashed, $def['firstname'], $def['lastname'], $def['email'], $def['department'], $def['phone1'], $def['city'], $def['country'], $now, $now]);
            $userId = (int)$pdo->lastInsertId();
            echo "  [CREATED] User '{$uname}' (ID: {$userId})\n";
        }

        // Token
        $tStmt = $pdo->prepare("SELECT id, token FROM `{$prefix}external_tokens` WHERE userid = ? LIMIT 1");
        $tStmt->execute([$userId]);
        $tokenRow = $tStmt->fetch();
        if (!$tokenRow || empty($tokenRow['token'])) {
            $token = md5(uniqid((string)$userId, true) . microtime() . bin2hex(random_bytes(8)));
            $insToken = $pdo->prepare("INSERT INTO `{$prefix}external_tokens` (token, tokentype, userid, externalserviceid, contextid, creatorid, timecreated, lastaccess, validuntil) VALUES (?, 0, ?, 1, 1, ?, ?, ?, 0)");
            $insToken->execute([$token, $userId, $userId, $now, $now]);
            echo "    -> Provisioned external REST Token: {$token}\n";
        }

        // Admin privileges in mdl_config
        if ($def['role'] === 'admin') {
            $cfgStmt = $pdo->prepare("SELECT value FROM `{$prefix}config` WHERE name = 'siteadmins' LIMIT 1");
            $cfgStmt->execute();
            $cfgVal = $cfgStmt->fetchColumn();
            $adminIds = array_filter(array_map('trim', explode(',', (string)$cfgVal)));
            if (!in_array((string)$userId, $adminIds, true)) {
                $adminIds[] = (string)$userId;
                $newAdmins = implode(',', array_unique($adminIds));
                $updCfg = $pdo->prepare("UPDATE `{$prefix}config` SET value = ? WHERE name = 'siteadmins'");
                $updCfg->execute([$newAdmins]);
                echo "    -> Site Administrator privileges confirmed in mdl_config\n";
            }
        }
    }
}

echo "\n==============================================================================\n";
echo " [SUCCESS] Demo Accounts Provisioned & Active on Server!\n";
echo "==============================================================================\n";
echo "  1. Admin:         admin / Admin@2026!                 -> /admin/dashboard\n";
echo "  2. Instructor:    instructor / Instructor@2026!       -> /instructor/instructor-dashboard\n";
echo "  3. Student:       student / Student@2026!             -> /student/student-dashboard\n";
echo "  4. CourseCreator: coursecreator / Creator@2026!       -> /course/add-course\n";
echo "==============================================================================\n";
