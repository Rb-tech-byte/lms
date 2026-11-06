<?php
/**
 * Open University of Tanzania (OUT) LMS
 * Enterprise System Features & Sample Data Seeder
 *
 * Populates all 19 academic programmes and short courses with rich sample data
 * across Adaptive Layouts, Cloud Virtual Labs, Automated Unit-Test Grading,
 * SARIS QR Digital Attendance, Milestone Telemetry, Gamification XP,
 * Verifiable Digital Credentials, and Automated Scholar Retention Campaigns.
 */

define('CLI_SCRIPT', true);
require_once __DIR__ . '/config.php';
require_once $CFG->libdir . '/adminlib.php';
require_once $CFG->dirroot . '/course/lib.php';

global $DB;

echo "=== Seeding OUT LMS Core System Features & Sample Data Across All Courses ===\n";

$dbman = $DB->get_manager();
$xmldbPlugins = [
    'attendance' => $CFG->dirroot . '/mod/attendance/db/install.xml',
    'vpl' => $CFG->dirroot . '/mod/vpl/db/install.xml',
    'customcert' => $CFG->dirroot . '/mod/customcert/db/install.xml',
    'reengagement' => $CFG->dirroot . '/mod/reengagement/db/install.xml',
    'format_kickstart_template' => $CFG->dirroot . '/course/format/kickstart/db/install.xml',
];
foreach ($xmldbPlugins as $checkTable => $xmlPath) {
    if (!$dbman->table_exists($checkTable) && file_exists($xmlPath)) {
        try {
            $dbman->install_from_xmldb_file($xmlPath);
            echo "  [OK] Installed XMLDB schema for '{$checkTable}'\n";
        } catch (\Throwable $e) {
            echo "  [WARN] XMLDB install notice for {$checkTable}: " . $e->getMessage() . "\n";
        }
    }
}

foreach (['attendance', 'vpl', 'customcert', 'reengagement'] as $modName) {
    if (!$DB->record_exists('modules', ['name' => $modName])) {
        $modRec = new \stdClass();
        $modRec->name = $modName;
        $modRec->cron = 0;
        $modRec->lastcron = 0;
        $modRec->search = '';
        $modRec->visible = 1;
        $DB->insert_record('modules', $modRec);
        echo "  [OK] Registered activity module '{$modName}' in mdl_modules\n";
    }
}

$courses = $DB->get_records_sql("SELECT * FROM {course} WHERE id > 1 ORDER BY id ASC");
$now = time();

// Map module names to IDs in mdl_modules
$moduleMap = [];
$mods = $DB->get_records('modules');
foreach ($mods as $m) {
    $moduleMap[$m->name] = (int)$m->id;
}

$formatRotation = [
    2 => 'tiles',     // CS101
    3 => 'onetopic',  // CS202
    4 => 'topcoll',   // BBA301
    6 => 'tiles',     // BBA302
    7 => 'tiles',     // PSC-CYBER
    8 => 'tiles',     // PSC-DATASCI
    9 => 'onetopic',  // PSC-WEBMOB
    10 => 'topcoll',  // PSC-GIS
    11 => 'onetopic', // PSC-CLOUD
    12 => 'topcoll',  // PSC-FINTECH
    13 => 'topcoll',  // PSC-ITPM
    14 => 'tiles',    // PSC-DBA
    15 => 'tiles',    // MOOC-AI
    16 => 'onetopic', // MOOC-DIGLIT
    17 => 'topcoll',  // MOOC-ODEL
    18 => 'tiles',    // MOOC-INFOSEC
    19 => 'topics',   // MOOC-RDM
    20 => 'tiles',    // PSC-EGOV
    21 => 'onetopic', // PSC-PEDAGOGY
];

/**
 * Helper to attach a module instance into mdl_course_modules and mdl_course_sections
 */
function ensure_course_module_in_section(int $courseId, int $sectionNum, string $modName, int $instanceId, array $moduleMap): int {
    global $DB;
    if (!isset($moduleMap[$modName])) {
        return 0;
    }
    $modId = $moduleMap[$modName];
    $existingCm = $DB->get_record('course_modules', [
        'course' => $courseId,
        'module' => $modId,
        'instance' => $instanceId,
    ]);
    if ($existingCm) {
        return (int)$existingCm->id;
    }

    $sec = $DB->get_record('course_sections', ['course' => $courseId, 'section' => $sectionNum]);
    if (!$sec) {
        $sec = $DB->get_record('course_sections', ['course' => $courseId, 'section' => 1]);
    }
    if (!$sec) {
        return 0;
    }

    $cm = new \stdClass();
    $cm->course = $courseId;
    $cm->module = $modId;
    $cm->instance = $instanceId;
    $cm->section = $sec->id;
    $cm->idnumber = '';
    $cm->added = time();
    $cm->score = 0;
    $cm->indent = 0;
    $cm->visible = 1;
    $cm->visibleoncoursepage = 1;
    $cm->visibleold = 1;
    $cm->groupmode = 0;
    $cm->groupingid = 0;
    $cm->completion = 1;
    $cm->completionview = 0;
    $cm->completionexpected = 0;
    $cm->showdescription = 0;
    $cm->availability = null;
    $cm->deletioninprogress = 0;
    $cmId = (int)$DB->insert_record('course_modules', $cm);

    $seq = trim((string)$sec->sequence);
    $seqArr = array_filter(explode(',', $seq));
    if (!in_array((string)$cmId, $seqArr, true)) {
        $seqArr[] = (string)$cmId;
        $DB->set_field('course_sections', 'sequence', implode(',', $seqArr), ['id' => $sec->id]);
    }
    return $cmId;
}

foreach ($courses as $course) {
    $courseId = (int)$course->id;
    $short = $course->shortname ?: ('OUT-' . $courseId);
    $title = $course->fullname ?: 'OUT Academic Programme';

    // 1. Set Adaptive Layout Format
    $targetFormat = $formatRotation[$courseId] ?? 'tiles';
    $DB->set_field('course', 'format', $targetFormat, ['id' => $courseId]);
    $DB->set_field('course', 'enablecompletion', 1, ['id' => $courseId]);

    // 2. Seed SARIS QR Digital Attendance (mdl_attendance, statuses, sessions, logs)
    $att = $DB->get_record('attendance', ['course' => $courseId]);
    if (!$att) {
        $attObj = new \stdClass();
        $attObj->course = $courseId;
        $attObj->name = "{$short} Digital Attendance & Live Seminar Register";
        $attObj->grade = 100;
        $attObj->timemodified = $now;
        $attObj->intro = "SARIS-integrated digital attendance register with dynamic QR code passkeys and real-time participation scoring for {$title}.";
        $attObj->introformat = 1;
        $attObj->sessiondetailspos = 'left';
        $attObj->showsessiondetails = 1;
        $attObj->showextrauserdetails = 1;
        $attId = (int)$DB->insert_record('attendance', $attObj);
        $att = $DB->get_record('attendance', ['id' => $attId]);
    }
    ensure_course_module_in_section($courseId, 1, 'attendance', (int)$att->id, $moduleMap);

    $statuses = $DB->get_records('attendance_statuses', ['attendanceid' => $att->id, 'deleted' => 0], 'grade DESC, id ASC');
    if (empty($statuses)) {
        $seedSt = [
            ['acronym' => 'P', 'description' => 'Present (On Time)', 'grade' => 2.00],
            ['acronym' => 'L', 'description' => 'Late Arrival', 'grade' => 1.00],
            ['acronym' => 'E', 'description' => 'Excused Absence', 'grade' => 1.00],
            ['acronym' => 'A', 'description' => 'Absent', 'grade' => 0.00],
        ];
        foreach ($seedSt as $st) {
            $stObj = new \stdClass();
            $stObj->attendanceid = $att->id;
            $stObj->acronym = $st['acronym'];
            $stObj->description = $st['description'];
            $stObj->grade = $st['grade'];
            $stObj->visible = 1;
            $stObj->deleted = 0;
            $stObj->setnumber = 0;
            $DB->insert_record('attendance_statuses', $stObj);
        }
        $statuses = $DB->get_records('attendance_statuses', ['attendanceid' => $att->id, 'deleted' => 0], 'grade DESC, id ASC');
    }

    $stByAcronym = [];
    $stIds = [];
    foreach ($statuses as $st) {
        $stByAcronym[strtoupper($st->acronym)] = $st;
        $stIds[] = (int)$st->id;
    }

    $sessions = $DB->get_records('attendance_sessions', ['attendanceid' => $att->id], 'sessdate ASC');
    if (count($sessions) < 4) {
        $sessionTemplates = [
            [
                'offset' => -86400 * 21,
                'duration' => 5400,
                'desc' => "Session 1: Programme Orientation & Architectural Foundations ({$short})",
                'pass' => "OUT-{$courseId}-S1",
                'status' => 'P',
                'remark' => 'Verified via SARIS QR Scanner (Kinondoni Regional Center)',
            ],
            [
                'offset' => -86400 * 14,
                'duration' => 5400,
                'desc' => "Session 2: Applied Methodology & Guided Case Workshop ({$short})",
                'pass' => "OUT-{$courseId}-S2",
                'status' => 'P',
                'remark' => 'Verified via OUT LMS Live Seminar Check-In',
            ],
            [
                'offset' => -86400 * 7,
                'duration' => 7200,
                'desc' => "Session 3: Practical Sandbox Lab & Peer Code Review ({$short})",
                'pass' => "OUT-{$courseId}-S3",
                'status' => 'P',
                'remark' => 'Verified via Digital Classroom Passkey',
            ],
            [
                'offset' => 3600,
                'duration' => 7200,
                'desc' => "Session 4: Executive Assessment Clinic & Live Q&A ({$short})",
                'pass' => "OUT-{$courseId}-LIVE",
                'status' => null,
                'remark' => null,
            ],
        ];

        $existingCount = count($sessions);
        for ($i = $existingCount; $i < 4; $i++) {
            $tpl = $sessionTemplates[$i];
            $sObj = new \stdClass();
            $sObj->attendanceid = $att->id;
            $sObj->groupid = 0;
            $sObj->sessdate = $now + $tpl['offset'];
            $sObj->duration = $tpl['duration'];
            $sObj->lasttaken = $tpl['status'] ? ($now + $tpl['offset'] + 600) : null;
            $sObj->lasttakenby = 2;
            $sObj->timemodified = $now;
            $sObj->description = $tpl['desc'];
            $sObj->descriptionformat = 1;
            $sObj->studentscanmark = 1;
            $sObj->allowupdatestatus = 1;
            $sObj->studentpassword = $tpl['pass'];
            $sObj->includeqrcode = 1;
            $sObj->rotateqrcode = 1;
            $sObj->rotateqrcodesecret = substr(md5($short . $tpl['pass']), 0, 8);
            $sessId = (int)$DB->insert_record('attendance_sessions', $sObj);

            if ($tpl['status'] && isset($stByAcronym[$tpl['status']])) {
                foreach ([2, 3, 4] as $uid) {
                    if (!$DB->record_exists('attendance_log', ['sessionid' => $sessId, 'studentid' => $uid])) {
                        $logObj = new \stdClass();
                        $logObj->sessionid = $sessId;
                        $logObj->studentid = $uid;
                        $logObj->statusid = (int)$stByAcronym[$tpl['status']]->id;
                        $logObj->statusset = implode(',', $stIds);
                        $logObj->timetaken = $now + $tpl['offset'] + 300;
                        $logObj->takenby = $uid;
                        $logObj->remarks = $tpl['remark'];
                        $logObj->ipaddress = '196.41.52.' . (10 + $uid);
                        $DB->insert_record('attendance_log', $logObj);
                    }
                }
            }
        }
    }

    // 3. Seed OUT Cloud Virtual Labs (mdl_vpl & mdl_vpl_submissions)
    $labs = $DB->get_records('vpl', ['course' => $courseId], 'id ASC');
    if (empty($labs)) {
        $seedLabs = [
            [
                'name' => "{$short} Virtual Lab 1: Core Algorithmic & Data Validation Pipeline",
                'shortdescription' => "Design and execute a resilient validation and aggregation module for {$title} datasets using the OUT Cloud Sandbox IDE.",
                'intro' => "Interactive cloud lab for {$title}. Write your implementation, run automated unit assertions, and inspect real-time telemetry.",
                'sec' => 1,
            ],
            [
                'name' => "{$short} Virtual Lab 2: Enterprise Security & Performance Audit",
                'shortdescription' => "Implement an automated audit routine that verifies data integrity, throughput thresholds, and boundary conditions.",
                'intro' => "Advanced practical engineering lab for {$title} with automated test bench evaluation.",
                'sec' => 2,
            ],
        ];
        foreach ($seedLabs as $lItem) {
            $vObj = new \stdClass();
            $vObj->course = $courseId;
            $vObj->name = $lItem['name'];
            $vObj->shortdescription = $lItem['shortdescription'];
            $vObj->intro = $lItem['intro'];
            $vObj->introformat = 1;
            $vObj->startdate = $now - 86400 * 14;
            $vObj->duedate = $now + 86400 * 30;
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
            ensure_course_module_in_section($courseId, $lItem['sec'], 'vpl', $vplId, $moduleMap);
        }
        $labs = $DB->get_records('vpl', ['course' => $courseId], 'id ASC');
    } else {
        $secNum = 1;
        foreach ($labs as $lab) {
            ensure_course_module_in_section($courseId, min(2, $secNum++), 'vpl', (int)$lab->id, $moduleMap);
        }
    }

    // Ensure pre-populated sample VPL submissions exist so users immediately see graded test output
    $sampleTests = [
        ['name' => 'Test 1: Standard Academic Dataset Input', 'expected' => '240', 'actual' => '240', 'passed' => true, 'timeMs' => 11],
        ['name' => 'Test 2: Boundary & Empty Collection Handling', 'expected' => '0', 'actual' => '0', 'passed' => true, 'timeMs' => 8],
        ['name' => 'Test 3: Negative & Malformed Value Filtering', 'expected' => '185', 'actual' => '185', 'passed' => true, 'timeMs' => 13],
        ['name' => 'Test 4: Time Complexity O(n) Benchmark (10,000 records)', 'expected' => 'PASS (<50ms)', 'actual' => 'PASS (16ms)', 'passed' => true, 'timeMs' => 16],
    ];
    foreach ($labs as $lab) {
        $starterSource = "# {$short} — Automated Cloud Lab Solution\ndef solve_out_lab(items):\n    valid = [x for x in items if isinstance(x, (int, float)) and x > 0]\n    return sum(valid)\n\nif __name__ == '__main__':\n    sample = [60, -15, 90, 0, 90]\n    print('Computed Total:', solve_out_lab(sample))\n";
        $commentJson = json_encode([
            'language' => 'python',
            'source_code' => $starterSource,
            'passed' => 4,
            'total' => 4,
            'tests' => $sampleTests,
        ]);
        foreach ([2, 3, 4] as $uid) {
            if (!$DB->record_exists('vpl_submissions', ['vpl' => $lab->id, 'userid' => $uid])) {
                $subObj = new \stdClass();
                $subObj->vpl = $lab->id;
                $subObj->userid = $uid;
                $subObj->datesubmitted = $now - 3600 * 6;
                $subObj->comments = $commentJson;
                $subObj->grader = 2;
                $subObj->dategraded = $now - 3600 * 5;
                $subObj->grade = 100.00;
                $subObj->groupid = 0;
                $subObj->nevaluations = 3;
                $subObj->save_count = 4;
                $subObj->run_count = 5;
                $subObj->debug_count = 1;
                $DB->insert_record('vpl_submissions', $subObj);
            }
        }
    }

    // 4. Seed Verifiable Digital Credentials (mdl_customcert & mdl_customcert_issues)
    $cert = $DB->get_record('customcert', ['course' => $courseId]);
    if (!$cert) {
        $cObj = new \stdClass();
        $cObj->course = $courseId;
        $cObj->templateid = 1;
        $cObj->name = "Official TCU & SARIS Verifiable Credential — {$short}";
        $cObj->intro = "Cryptographically verifiable digital certificate of completion issued by the Open University of Tanzania for {$title}.";
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
        $cObj->timecreated = $now - 86400 * 30;
        $cObj->timemodified = $now;
        $certId = (int)$DB->insert_record('customcert', $cObj);
        $cert = $DB->get_record('customcert', ['id' => $certId]);
    }
    ensure_course_module_in_section($courseId, 2, 'customcert', (int)$cert->id, $moduleMap);

    foreach ([2, 3, 4] as $uid) {
        if (!$DB->record_exists('customcert_issues', ['customcertid' => $cert->id, 'userid' => $uid])) {
            $cleanShort = preg_replace('/[^A-Z0-9]/', '', strtoupper($short));
            $code = 'OUT-2026-' . substr($cleanShort, 0, 6) . '-' . strtoupper(substr(md5($courseId . '-' . $uid . '-CRED'), 0, 6));
            $iObj = new \stdClass();
            $iObj->userid = $uid;
            $iObj->customcertid = $cert->id;
            $iObj->code = $code;
            $iObj->emailed = 1;
            $iObj->timecreated = $now - 86400 * 2;
            $DB->insert_record('customcert_issues', $iObj);
        }
    }

    // 5. Seed Automated Scholar Retention Campaigns (mdl_reengagement)
    $nudges = $DB->get_records('reengagement', ['course' => $courseId], 'id ASC');
    if (empty($nudges)) {
        $rObj = new \stdClass();
        $rObj->course = $courseId;
        $rObj->name = "{$short} 7-Day Study Momentum & Continuous Assessment Alert";
        $rObj->timecreated = $now - 86400 * 14;
        $rObj->timemodified = $now - 3600 * 2;
        $rObj->emailuser = 1;
        $rObj->emailsubject = "[{$short}] Keep Your OUT Academic Streak & Milestone Progress Active!";
        $rObj->emailcontent = "Dear Scholar, your next unit lecture and practical sandbox lab in {$title} are ready for completion.";
        $rObj->emailcontentformat = 1;
        $rObj->emailcontentmanager = "Automated cohort retention reminder triggered.";
        $rObj->emailcontentmanagerformat = 1;
        $rObj->emailsubjectmanager = "[{$short}] SARIS Retention Telemetry Notification";
        $rObj->emailrecipient = 0;
        $rObj->duration = 604800;
        $rObj->remindercount = 3;
        $rObj->suppresstarget = 0;
        $rObj->emaildelay = 604800;
        $reengId = (int)$DB->insert_record('reengagement', $rObj);
        ensure_course_module_in_section($courseId, 2, 'reengagement', $reengId, $moduleMap);
    }

    // 6. Seed Milestone Telemetry Completion (mdl_course_modules_completion) for ~70% of course modules
    $courseCms = $DB->get_records('course_modules', ['course' => $courseId, 'deletioninprogress' => 0], 'id ASC');
    $cmList = array_values($courseCms);
    $totalCms = count($cmList);
    $targetComplete = max(1, (int)ceil($totalCms * 0.7));
    for ($idx = 0; $idx < $totalCms; $idx++) {
        $cmItem = $cmList[$idx];
        $shouldComplete = ($idx < $targetComplete) ? 1 : 0;
        foreach ([2, 3, 4] as $uid) {
            $existingComp = $DB->get_record('course_modules_completion', ['coursemoduleid' => $cmItem->id, 'userid' => $uid]);
            if (!$existingComp && $shouldComplete === 1) {
                $compObj = new \stdClass();
                $compObj->coursemoduleid = $cmItem->id;
                $compObj->userid = $uid;
                $compObj->completionstate = 1;
                $compObj->overrideby = null;
                $compObj->timemodified = $now - (86400 * ($totalCms - $idx));
                $DB->insert_record('course_modules_completion', $compObj);
            }
        }
    }

    try {
        rebuild_course_cache($courseId, true);
    } catch (\Throwable $e) {}
    echo "  [OK] Seeded Course #{$courseId} ({$short}) — Format: {$targetFormat}, Modules: {$totalCms}\n";
}

if (file_exists(__DIR__ . '/seed_65_marketplace_features.php')) {
    require_once(__DIR__ . '/seed_65_marketplace_features.php');
    $extRes = seed_out_65_marketplace_features();
    echo "  [OK] Provisioned {$extRes['unique_new_capabilities']} additional capabilities across {$extRes['courses_count']} courses (Total rows: {$extRes['total_feature_rows']})\n";
}

// 7. Set Kickstart as Institutional Default Format & Seed 4 Core Faculty Starter Templates
set_config('format', 'kickstart', 'moodlecourse');
set_config('version', '2026110201', 'format_kickstart');
set_config('course_templates_view', 'tile', 'format_kickstart');
echo "  [OK] Set Institutional Default Course Format to 'kickstart'\n";

$dbman = $DB->get_manager();
if (!$dbman->table_exists('format_kickstart_template')) {
    $table = new \xmldb_table('format_kickstart_template');
    $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
    $table->add_field('title', XMLDB_TYPE_CHAR, '255', null, XMLDB_NOTNULL, null, null);
    $table->add_field('description', XMLDB_TYPE_TEXT, null, null, false, null, null);
    $table->add_field('descriptionformat', XMLDB_TYPE_INTEGER, '10', null, false, null, '1');
    $table->add_field('preview_url', XMLDB_TYPE_CHAR, '255', null, false, null, null);
    $table->add_field('restrictcohort', XMLDB_TYPE_INTEGER, '1', null, false, null, '0');
    $table->add_field('restrictcategory', XMLDB_TYPE_INTEGER, '1', null, false, null, '0');
    $table->add_field('restrictrole', XMLDB_TYPE_INTEGER, '1', null, false, null, '0');
    $table->add_field('restrictuser', XMLDB_TYPE_INTEGER, '1', null, false, null, '0');
    $table->add_field('cohortids', XMLDB_TYPE_TEXT, null, null, false, null, null);
    $table->add_field('categoryids', XMLDB_TYPE_TEXT, null, null, false, null, null);
    $table->add_field('userids', XMLDB_TYPE_TEXT, null, null, false, null, null);
    $table->add_field('includesubcategories', XMLDB_TYPE_INTEGER, '1', null, false, null, '0');
    $table->add_field('roleids', XMLDB_TYPE_TEXT, null, null, false, null, null);
    $table->add_field('sort', XMLDB_TYPE_INTEGER, '10', null, false, null, '1');
    $table->add_field('courseformat', XMLDB_TYPE_INTEGER, '1', null, false, null, '0');
    $table->add_field('coursefromtemplate', XMLDB_TYPE_INTEGER, '1', null, false, null, '0');
    $table->add_field('courseid', XMLDB_TYPE_INTEGER, '10', null, false, null, '0');
    $table->add_field('userid', XMLDB_TYPE_INTEGER, '10', null, false, null, '2');
    $table->add_field('status', XMLDB_TYPE_INTEGER, '1', null, false, null, '1');
    $table->add_field('visible', XMLDB_TYPE_INTEGER, '1', null, false, null, '1');
    $table->add_field('format', XMLDB_TYPE_CHAR, '40', null, false, null, 'tiles');
    $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
    $dbman->create_table($table);
}

if (!$dbman->table_exists('format_kickstart_options')) {
    $optTable = new \xmldb_table('format_kickstart_options');
    $optTable->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
    $optTable->add_field('templateid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
    $optTable->add_field('displayname', XMLDB_TYPE_CHAR, '255', null, XMLDB_NOTNULL, null, null);
    $optTable->add_field('format', XMLDB_TYPE_CHAR, '21', null, XMLDB_NOTNULL, null, null);
    $optTable->add_field('sectionid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
    $optTable->add_field('name', XMLDB_TYPE_CHAR, '100', null, XMLDB_NOTNULL, null, null);
    $optTable->add_field('value', XMLDB_TYPE_TEXT, null, null, false, null, null);
    $optTable->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
    $dbman->create_table($optTable);
}

$starterTemplates = [
    [
        'sort' => 1,
        'title' => 'Undergraduate Degree Programme (TCU & SARIS Accredited)',
        'description' => '<p>Standardized 8-module semester syllabus with SARIS rotating QR attendance tracking, continuous assessment assignments, grading rubrics, and final exam readiness.</p>',
        'preview_url' => '/course/course-details?id=2',
        'courseid' => 2,
        'format' => 'tiles',
    ],
    [
        'sort' => 2,
        'title' => 'Postgraduate & Masters Seminar (Research & Dissertation)',
        'description' => '<p>Advanced seminar layout featuring literature review forums, research methodology checkpoints, cloud lab workspaces, and thesis defense evaluation gates.</p>',
        'preview_url' => '/course/course-details?id=3',
        'courseid' => 3,
        'format' => 'onetopic',
    ],
    [
        'sort' => 3,
        'title' => 'Short Courses & CPD Micro-Credential (Verifiable Certificate)',
        'description' => '<p>High-velocity executive & professional development blueprint with self-paced video units, competency quizzes, and automated TCU/SARIS QR-verifiable CustomCert PDF issuance.</p>',
        'preview_url' => '/course/course-details?id=7',
        'courseid' => 7,
        'format' => 'topcoll',
    ],
    [
        'sort' => 4,
        'title' => 'STEM & Computer Science Lab Course (CodeRunner & VPL IDE)',
        'description' => '<p>Hands-on engineering and software development curriculum pre-linked with automated CodeRunner unit-test grading questions and browser-based VPL Cloud IDE labs.</p>',
        'preview_url' => '/course/course-details?id=8',
        'courseid' => 8,
        'format' => 'tiles',
    ],
];

foreach ($starterTemplates as $st) {
    $existingTpl = $DB->get_record('format_kickstart_template', ['sort' => $st['sort']]);
    if ($existingTpl) {
        $existingTpl->title = $st['title'];
        $existingTpl->description = $st['description'];
        $existingTpl->preview_url = $st['preview_url'];
        $existingTpl->courseid = $st['courseid'];
        $existingTpl->format = $st['format'];
        $existingTpl->visible = 1;
        $existingTpl->status = 1;
        $DB->update_record('format_kickstart_template', $existingTpl);
    } else {
        $tplRec = new \stdClass();
        $tplRec->title = $st['title'];
        $tplRec->description = $st['description'];
        $tplRec->descriptionformat = 1;
        $tplRec->preview_url = $st['preview_url'];
        $tplRec->restrictcohort = 0;
        $tplRec->restrictcategory = 0;
        $tplRec->restrictrole = 0;
        $tplRec->restrictuser = 0;
        $tplRec->cohortids = '[]';
        $tplRec->categoryids = '[]';
        $tplRec->userids = '[]';
        $tplRec->includesubcategories = 0;
        $tplRec->roleids = '[]';
        $tplRec->sort = $st['sort'];
        $tplRec->courseformat = 0;
        $tplRec->coursefromtemplate = 1;
        $tplRec->courseid = $st['courseid'];
        $tplRec->userid = 2;
        $tplRec->status = 1;
        $tplRec->visible = 1;
        $tplRec->format = $st['format'];
        $DB->insert_record('format_kickstart_template', $tplRec);
    }
}
echo "  [OK] Seeded 4 Institutional Kickstart Faculty Starter Templates in mdl_format_kickstart_template\n";

purge_all_caches();
if (function_exists('opcache_reset')) {
    @opcache_reset();
}
echo "=== Completed Seeding & Purged All Moodle Caches ===\n";

