<?php
/**
 * OUT LMS Modular API — Unified Course Creation & Management Studio Controller (course_studio_api.php)
 * Accessible to Administrator, Course Creator, and Instructor roles.
 * Handles full 8-section Moodle course creation/editing wizard, Kickstart blueprints, adaptive course formats,
 * sections & activity modules, categories, groups, bulk CSV course upload, backup/restore, cohorts,
 * permissions, learning plans, competency frameworks, content bank, and tags.
 */
require_once __DIR__ . '/core/bootstrap.php';
require_once __DIR__ . '/core/auth_middleware.php';

$params = array_merge($_GET, $input);

try {
        if ($action === 'get_kickstart_templates' || $action === 'import_kickstart_template') {
            $courseId = max(2, (int)($params['course_id'] ?? $params['courseid'] ?? 2));
            $templateId = (int)($params['template_id'] ?? $params['templateid'] ?? 0);
            $templates = outlms_get_kickstart_templates_catalog();
            $importResult = null;

            if ($action === 'import_kickstart_template' || ($templateId > 0 && $_SERVER['REQUEST_METHOD'] === 'POST')) {
                $targetTplId = $templateId > 0 ? $templateId : 1;
                $importResult = outlms_apply_kickstart_template($courseId, $targetTplId);
            }

            echo json_encode([
                'success' => true,
                'method' => $_SERVER['REQUEST_METHOD'],
                'system_feature' => 'KICKSTART_COURSE_WIZARD',
                'course_id' => $courseId,
                'default_format' => get_config('moodlecourse', 'format') ?: 'kickstart',
                'templates_count' => count($templates),
                'templates' => $templates,
                'import_result' => $importResult,
                'message' => $importResult
                    ? "Applied Kickstart template '{$importResult['template_title']}' ({$importResult['sections_provisioned']} units & " . count($importResult['modules_provisioned']) . " enterprise modules) to course #{$courseId}."
                    : "Loaded " . count($templates) . " institutional Kickstart starter templates.",
            ]);
            exit(0);
        }

        if ($action === 'get_course_formats' || $action === 'update_course_format') {
            $courseId = max(2, (int)($params['course_id'] ?? $params['courseid'] ?? 2));
            $course = $DB->get_record('course', ['id' => $courseId]);
            if (!$course) {
                $course = $DB->get_record_sql("SELECT * FROM {course} WHERE id > 1 ORDER BY id ASC LIMIT 1");
                $courseId = $course ? (int)$course->id : 2;
            }

            $availableFormats = [
                [
                    'id' => 'kickstart',
                    'component' => 'format_kickstart',
                    'name' => 'Kickstart Course Wizard & Templates',
                    'badge' => 'Institutional Default',
                    'icon' => 'isax-magicpen',
                    'accentColor' => '#8b5cf6',
                    'description' => 'Template-driven course onboarding engine allowing educators to populate courses instantly from 4 TCU/SARIS faculty starter blueprints with zero blank-page friction.',
                ],
                [
                    'id' => 'tiles',
                    'component' => 'format_tiles',
                    'name' => 'Tiles Grid Format',
                    'badge' => 'Visual Cards',
                    'icon' => 'isax-element-3',
                    'accentColor' => '#013BA6',
                    'description' => 'Displays syllabus units as interactive visual tiles with progress rings, radial indicators, and modal activity launchers.',
                ],
                [
                    'id' => 'onetopic',
                    'component' => 'format_onetopic',
                    'name' => 'OneTopic Tabbed Format',
                    'badge' => 'Horizontal Tabs',
                    'icon' => 'isax-folder-open',
                    'accentColor' => '#06b6d4',
                    'description' => 'Organizes each syllabus unit into clean horizontal navigation tabs to eliminate long-page scrolling.',
                ],
                [
                    'id' => 'topcoll',
                    'component' => 'format_topcoll',
                    'name' => 'Collapsed Topics Format',
                    'badge' => 'Compact Accordions',
                    'icon' => 'isax-row-vertical',
                    'accentColor' => '#10b981',
                    'description' => 'High-density collapsible topic toggles with expand-all/collapse-all controls and unit completion counters.',
                ],
                [
                    'id' => 'topics',
                    'component' => 'format_topics',
                    'name' => 'Standard Academic List',
                    'badge' => 'Classic Syllabus',
                    'icon' => 'isax-task-square',
                    'accentColor' => '#6366f1',
                    'description' => 'Traditional sequential university syllabus layout displaying all units and learning activities vertically.',
                ],
                [
                    'id' => 'streamdeck',
                    'component' => 'format_streamdeck',
                    'name' => 'StreamDeck Launchpad Format',
                    'badge' => 'Studio Grid',
                    'icon' => 'isax-category-2',
                    'accentColor' => '#f59e0b',
                    'description' => 'High-density tactile command launchpad presenting units and lab tools as studio action buttons.',
                ],
                [
                    'id' => 'learningjourney',
                    'component' => 'format_learningjourney',
                    'name' => 'Learning Journey Map Format',
                    'badge' => 'Competency Trail',
                    'icon' => 'isax-routing-2',
                    'accentColor' => '#ec4899',
                    'description' => 'Visual gamified competency roadmap with sequential milestone nodes and checkpoint gates.',
                ],
            ];

            $requestedFormat = strtolower(trim((string)($params['format'] ?? '')));
            $templateId = (int)($params['template_id'] ?? $params['templateid'] ?? 0);
            $validFormatIds = ['tiles', 'onetopic', 'topcoll', 'topics', 'weeks', 'kickstart', 'streamdeck', 'learningjourney'];
            $updated = false;
            $importResult = null;

            if (($action === 'update_course_format' || !empty($requestedFormat)) && in_array($requestedFormat, $validFormatIds, true) && $course) {
                $DB->set_field('course', 'format', $requestedFormat, ['id' => $courseId]);
                $DB->set_field('course', 'timemodified', time(), ['id' => $courseId]);
                $course->format = $requestedFormat;
                $updated = true;
            }
            if ($templateId > 0 && $course) {
                $importResult = outlms_apply_kickstart_template($courseId, $templateId);
                $updated = true;
            }

            $currentFormat = ($course && !empty($course->format)) ? $course->format : 'kickstart';
            echo json_encode([
                'success' => true,
                'method' => $_SERVER['REQUEST_METHOD'],
                'updated' => $updated,
                'course_id' => $courseId,
                'course_shortname' => $course->shortname ?? ('OUT-' . $courseId),
                'current_format' => $currentFormat,
                'default_format' => get_config('moodlecourse', 'format') ?: 'kickstart',
                'available_formats' => $availableFormats,
                'kickstart_templates' => outlms_get_kickstart_templates_catalog(),
                'import_result' => $importResult,
                'message' => $importResult
                    ? "Applied Kickstart template '{$importResult['template_title']}' and updated course format to '{$currentFormat}'."
                    : ($updated ? "Course format updated to '{$currentFormat}'." : "Active course format is '{$currentFormat}'."),
            ]);
            exit(0);
        }


    if ((int)$currentUser->id <= 0) {
        outlms_deny(401, 'Authentication required.');
    }
    if (!is_siteadmin($currentUser->id) && !outlms_user_is_instructor((int)$currentUser->id)) {
        outlms_deny(403, 'Administrator, Course Creator, or Instructor role required.');
    }
    if (isset($USER) && is_object($currentUser)) {
        $USER = $currentUser;
    }

    switch ($action) {
        case 'get_courses':
            $courses = $DB->get_records_select('course', 'id > 1', [], 'id ASC');
            $categories = $DB->get_records_menu('course_categories', [], '', 'id, name');

            $list = [];
            foreach ($courses as $c) {
                $secCount = $DB->count_records('course_sections', ['course' => $c->id]);
                $modCount = $DB->count_records('course_modules', ['course' => $c->id]);
                $quizzes = $DB->count_records('quiz', ['course' => $c->id]);
                $assigns = $DB->count_records('assign', ['course' => $c->id]);
                $pages = $DB->count_records('page', ['course' => $c->id]);
                $resources = $DB->count_records('resource', ['course' => $c->id]);

                // Enrolment instances
                $enrols = $DB->get_records('enrol', ['courseid' => $c->id]);
                $enrolList = [];
                $tuitionFee = 0;
                foreach ($enrols as $e) {
                    $enrolList[] = [
                        'id' => $e->id,
                        'enrol' => $e->enrol,
                        'status' => (int)$e->status, // 0 = active, 1 = disabled
                        'cost' => (float)($e->cost ?? 0),
                        'currency' => $e->currency ?? 'TZS',
                    ];
                    if ($e->cost > 0) {
                        $tuitionFee = (float)$e->cost;
                    }
                }

                // Enrolled scholars count
                $enrolledCount = $DB->count_records_sql(
                    "SELECT COUNT(DISTINCT ue.userid) FROM {user_enrolments} ue JOIN {enrol} e ON e.id = ue.enrolid WHERE e.courseid = ?",
                    [$c->id]
                );

                $list[] = [
                    'id' => $c->id,
                    'fullname' => $c->fullname,
                    'shortname' => $c->shortname,
                    'category_id' => $c->category,
                    'category_name' => $categories[$c->category] ?? 'General Studies',
                    'format' => $c->format,
                    'visible' => (int)$c->visible,
                    'startdate' => date('Y-m-d', $c->startdate),
                    'summary' => strip_tags($c->summary ?? ''),
                    'sections_count' => $secCount,
                    'modules_count' => $modCount,
                    'quizzes_count' => $quizzes,
                    'assignments_count' => $assigns,
                    'pages_count' => $pages,
                    'resources_count' => $resources,
                    'enrolled_students' => $enrolledCount,
                    'tuition_fee' => $tuitionFee,
                    'enrol_methods' => $enrolList,
                ];
            }

            echo json_encode([
                'success' => true,
                'count' => count($list),
                'courses' => $list,
                'categories' => array_map(fn($id, $name) => ['id' => $id, 'name' => $name], array_keys($categories), array_values($categories)),
            ]);
            break;

        case 'create_course':
            $fullname = trim($input['fullname'] ?? '');
            $shortname = trim($input['shortname'] ?? '');
            $categoryId = (int)($input['category_id'] ?? $input['category'] ?? 1);
            $idnumber = trim($input['idnumber'] ?? '');
            $summary = $input['summary'] ?? '';
            $format = $input['format'] ?? (get_config('moodlecourse', 'format') ?: 'kickstart');
            $kickstartTemplateId = (int)($input['kickstart_template_id'] ?? $input['template_id'] ?? ($format === 'kickstart' ? 1 : 0));
            $numSections = max(1, min(52, (int)($input['num_sections'] ?? $input['numsections'] ?? 6)));
            $tuitionFee = (float)($input['tuition_fee'] ?? 250000);
            $visible = isset($input['visible']) ? (int)$input['visible'] : 1;

            if (!$fullname || !$shortname) {
                throw new \InvalidArgumentException("Course full name and short name are mandatory.");
            }

            // Check duplicate shortname
            if ($DB->record_exists('course', ['shortname' => $shortname])) {
                throw new \InvalidArgumentException("Course with shortname '$shortname' already exists.");
            }

            $now = time();
            $startdate = !empty($input['startdate'])
                ? (is_numeric($input['startdate']) ? (int)$input['startdate'] : (strtotime((string)$input['startdate']) ?: $now))
                : $now;
            $enddateEnabled = isset($input['enddate_enabled']) ? (bool)$input['enddate_enabled'] : true;
            $enddate = !$enddateEnabled
                ? 0
                : (!empty($input['enddate'])
                    ? (is_numeric($input['enddate']) ? (int)$input['enddate'] : (strtotime((string)$input['enddate']) ?: ($startdate + 120 * 86400)))
                    : ($startdate + 120 * 86400));

            // Insert Course with all 8 Moodle sections (General, Description, Format, Appearance, Files, Completion, Groups, Tags)
            $newCourse = new stdClass();
            $newCourse->fullname = $fullname;
            $newCourse->shortname = $shortname;
            $newCourse->idnumber = $idnumber;
            $newCourse->category = $categoryId > 0 ? $categoryId : 1;
            $newCourse->summary = $summary;
            $newCourse->summaryformat = FORMAT_HTML;
            $newCourse->format = $format;
            $newCourse->visible = $visible;
            $newCourse->visibleold = $visible;
            $newCourse->startdate = $startdate;
            $newCourse->enddate = $enddate;
            $newCourse->lang = trim((string)($input['lang'] ?? ''));
            $newCourse->newsitems = isset($input['newsitems']) ? (int)$input['newsitems'] : 5;
            $newCourse->showgrades = isset($input['showgrades']) ? (int)$input['showgrades'] : 1;
            $newCourse->showreports = isset($input['showreports']) ? (int)$input['showreports'] : 1;
            $newCourse->showactivitydates = isset($input['showactivitydates']) ? (int)$input['showactivitydates'] : 1;
            $newCourse->maxbytes = isset($input['maxbytes']) ? (int)$input['maxbytes'] : 0;
            $newCourse->enablecompletion = isset($input['enablecompletion']) ? (int)$input['enablecompletion'] : 1;
            $newCourse->showcompletionconditions = isset($input['showcompletionconditions']) ? (int)$input['showcompletionconditions'] : 1;
            $newCourse->groupmode = isset($input['groupmode']) ? (int)$input['groupmode'] : 0;
            $newCourse->groupmodeforce = isset($input['groupmodeforce']) ? (int)$input['groupmodeforce'] : 0;
            $newCourse->defaultgroupingid = isset($input['defaultgroupingid']) ? (int)$input['defaultgroupingid'] : 0;
            $newCourse->timecreated = $now;
            $newCourse->timemodified = $now;

            $courseId = (int)$DB->insert_record('course', $newCourse);

            // Save Course Format Options (hiddensections, coursedisplay, templatesview, userinstructions, teacherinstructions, numsections)
            $formatOptions = [
                'numsections' => (string)$numSections,
                'hiddensections' => (string)(isset($input['hiddensections']) ? (int)$input['hiddensections'] : 1),
                'coursedisplay' => (string)(isset($input['coursedisplay']) ? (int)$input['coursedisplay'] : 0),
            ];
            if (isset($input['templatesview'])) {
                $formatOptions['templatesview'] = trim((string)$input['templatesview']);
            }
            if (isset($input['userinstructions'])) {
                $formatOptions['userinstructions'] = (string)$input['userinstructions'];
            }
            if (isset($input['teacherinstructions'])) {
                $formatOptions['teacherinstructions'] = (string)$input['teacherinstructions'];
            }
            if ($DB->get_manager()->table_exists('course_format_options')) {
                foreach ($formatOptions as $optName => $optVal) {
                    $existingOpt = $DB->get_record('course_format_options', [
                        'courseid' => $courseId,
                        'format' => $format,
                        'sectionid' => 0,
                        'name' => $optName,
                    ]);
                    if ($existingOpt) {
                        $existingOpt->value = $optVal;
                        $DB->update_record('course_format_options', $existingOpt);
                    } else {
                        $DB->insert_record('course_format_options', (object)[
                            'courseid' => $courseId,
                            'format' => $format,
                            'sectionid' => 0,
                            'name' => $optName,
                            'value' => $optVal,
                        ]);
                    }
                }
            }

            // Save Course Image (overviewfiles / outlms_media) if uploaded or selected
            $courseImageInput = trim((string)($input['course_image'] ?? ''));
            if (!empty($courseImageInput) && $DB->get_manager()->table_exists('outlms_media')) {
                $savedImgPath = $courseImageInput;
                if (preg_match('/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/', $courseImageInput, $imgMatches)) {
                    $ext = strtolower($imgMatches[1]);
                    if ($ext === 'svg+xml') $ext = 'svg';
                    if ($ext === 'jpeg') $ext = 'jpg';
                    $decodedBytes = base64_decode($imgMatches[2]);
                    if ($decodedBytes !== false) {
                        $slug = preg_replace('/[^a-z0-9]+/', '-', strtolower($shortname));
                        $fileName = "course-{$courseId}-" . trim($slug, '-') . ".{$ext}";
                        $frontDir = dirname($moodleRoot) . '/frontend/public/assets/img/course/thumbnails';
                        $buildDir = dirname($moodleRoot) . '/frontend/build/assets/img/course/thumbnails';
                        if (is_dir($frontDir)) {
                            @file_put_contents($frontDir . '/' . $fileName, $decodedBytes);
                        }
                        if (is_dir($buildDir)) {
                            @file_put_contents($buildDir . '/' . $fileName, $decodedBytes);
                        }
                        $savedImgPath = "/assets/img/course/thumbnails/{$fileName}";
                    }
                }
                $existingMedia = $DB->get_record('outlms_media', ['entity_type' => 'course', 'entity_id' => $courseId, 'media_type' => 'thumbnail']);
                if ($existingMedia) {
                    $existingMedia->file_path = $savedImgPath;
                    $existingMedia->timemodified = $now;
                    $DB->update_record('outlms_media', $existingMedia);
                } else {
                    $DB->insert_record('outlms_media', (object)[
                        'entity_type' => 'course',
                        'entity_id' => $courseId,
                        'media_type' => 'thumbnail',
                        'file_path' => $savedImgPath,
                        'accent_color' => '#013BA6',
                        'badge_text' => $shortname,
                        'alt_text' => $fullname,
                        'timecreated' => $now,
                        'timemodified' => $now,
                    ]);
                }
            }

            // Save Course Tags if provided
            $tagsInput = $input['tags'] ?? [];
            if (is_string($tagsInput)) {
                $tagsInput = array_filter(array_map('trim', explode(',', $tagsInput)));
            }
            if (is_array($tagsInput) && !empty($tagsInput)) {
                set_config("course_tags_{$courseId}", json_encode(array_values($tagsInput)), 'local_outlms_bridge');
            }

            // Create Course Sections
            for ($s = 0; $s <= $numSections; $s++) {
                $section = new stdClass();
                $section->course = $courseId;
                $section->section = $s;
                $section->name = $s === 0 ? 'General Course Introduction & Announcements' : "Academic Module $s";
                $section->summary = "<p>Curriculum topics and learning activities for Module $s.</p>";
                $section->summaryformat = FORMAT_HTML;
                $section->sequence = '';
                $section->visible = 1;
                $section->timemodified = $now;
                $DB->insert_record('course_sections', $section);
            }

            // Add Manual Enrolment & Enrol Creator/Instructor as Editing Teacher
            $manualEnrol = new stdClass();
            $manualEnrol->enrol = 'manual';
            $manualEnrol->status = 0; // Active
            $manualEnrol->courseid = $courseId;
            $manualEnrol->sortorder = 1;
            $manualEnrol->roleid = 5; // Student
            $manualEnrol->timecreated = $now;
            $manualEnrol->timemodified = $now;
            $manualEnrolId = $DB->insert_record('enrol', $manualEnrol);
            $manualInstance = $DB->get_record('enrol', ['id' => $manualEnrolId]);

            if ($manualInstance && (int)$currentUser->id > 0) {
                try {
                    $manualPlugin = enrol_get_plugin('manual');
                    $teacherRole = $DB->get_record('role', ['shortname' => 'editingteacher']);
                    $teacherRoleId = $teacherRole ? (int)$teacherRole->id : 3;
                    if ($manualPlugin) {
                        $manualPlugin->enrol_user($manualInstance, (int)$currentUser->id, $teacherRoleId);
                        if ((int)$currentUser->id !== 4 && $DB->record_exists('user', ['id' => 4, 'deleted' => 0])) {
                            $manualPlugin->enrol_user($manualInstance, 4, $teacherRoleId);
                        }
                    }
                } catch (\Throwable $e) {}
            }

            // Add Fee / Pesapal Enrolment Method
            $feeEnrol = new stdClass();
            $feeEnrol->enrol = 'fee';
            $feeEnrol->status = 0; // Active
            $feeEnrol->courseid = $courseId;
            $feeEnrol->sortorder = 2;
            $feeEnrol->cost = $tuitionFee;
            $feeEnrol->currency = 'TZS';
            $feeEnrol->roleid = 5;
            $feeEnrol->timecreated = $now;
            $feeEnrol->timemodified = $now;
            $DB->insert_record('enrol', $feeEnrol);

            // Add Default Course Syllabus Page Module
            $pageModId = $DB->get_field('modules', 'id', ['name' => 'page']);
            if ($pageModId) {
                $page = new stdClass();
                $page->course = $courseId;
                $page->name = "$shortname Syllabus & Assessment Schedule";
                $page->intro = "<p>Official academic syllabus for $fullname.</p>";
                $page->introformat = FORMAT_HTML;
                $page->content = "<h3>Course Learning Objectives</h3><p>Welcome to $fullname at The Open University of Tanzania. Review this guide for semester milestones, grading rubric, and contact information for your course director.</p>";
                $page->contentformat = FORMAT_HTML;
                $page->timemodified = $now;
                $pageInstanceId = $DB->insert_record('page', $page);

                // Insert into course_modules
                $cm = new stdClass();
                $cm->course = $courseId;
                $cm->module = $pageModId;
                $cm->instance = $pageInstanceId;
                $cm->section = 0;
                $cm->added = $now;
                $cm->visible = 1;
                $cm->completion = 1;
                $cmId = $DB->insert_record('course_modules', $cm);

                // Link to section 0 sequence
                $section0 = $DB->get_record('course_sections', ['course' => $courseId, 'section' => 0]);
                if ($section0) {
                    $DB->set_field('course_sections', 'sequence', (string)$cmId, ['id' => $section0->id]);
                }
            }

            // Update category coursecount
            try {
                $cnt = $DB->count_records('course', ['category' => $newCourse->category]);
                $DB->set_field('course_categories', 'coursecount', $cnt, ['id' => $newCourse->category]);
            } catch (\Throwable $e) {}

            $kickstartProvisioned = null;
            if ($kickstartTemplateId > 0) {
                try {
                    $kickstartProvisioned = outlms_apply_kickstart_template((int)$courseId, $kickstartTemplateId);
                } catch (\Throwable $e) {}
            }

            if (!empty($courseId) && isset($input['tuition_fee'])) {
                $newFee = (float)$input['tuition_fee'];
                $enrols = $DB->get_records('enrol', ['courseid' => $courseId]);
                foreach ($enrols as $enr) {
                    if ($enr->enrol === 'fee' || $enr->cost > 0 || count($enrols) === 1) {
                        $DB->set_field('enrol', 'cost', (string)$newFee, ['id' => $enr->id]);
                    }
                }
                if (isset($changed) && is_array($changed)) {
                    $changed[] = 'tuition_fee';
                }
            }

            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');
            try {
                course_modinfo::clear_instance_cache($courseId);
            } catch (\Throwable $e) {}

            echo json_encode([
                'success' => true,
                'course_id' => $courseId,
                'fullname' => $fullname,
                'shortname' => $shortname,
                'format' => $format,
                'kickstart_provisioned' => $kickstartProvisioned,
                'message' => $kickstartProvisioned
                    ? "Course {$shortname} created and provisioned with Kickstart blueprint '{$kickstartProvisioned['template_title']}' ({$kickstartProvisioned['sections_provisioned']} units)."
                    : "Course '{$fullname}' ({$shortname}) created with {$numSections} modules and full Moodle settings.",
            ]);
            break;

        case 'add_activity':
            $courseId = (int)($input['course_id'] ?? 0);
            $sectionNumber = (int)($input['section'] ?? 1);
            $modType = strtolower($input['mod_type'] ?? 'page'); // page, assign, quiz, resource
            $name = trim($input['name'] ?? '');
            $content = $input['content'] ?? 'Academic learning content.';

            if (!$courseId || !$name) {
                throw new \InvalidArgumentException("Course ID and activity name are required.");
            }

            $modId = $DB->get_field('modules', 'id', ['name' => $modType]);
            if (!$modId) {
                throw new \InvalidArgumentException("Activity module type '$modType' is not registered.");
            }

            $now = time();
            $instanceId = 0;

            if ($modType === 'page') {
                $inst = new stdClass();
                $inst->course = $courseId;
                $inst->name = $name;
                $inst->intro = "<p>$name</p>";
                $inst->introformat = FORMAT_HTML;
                $inst->content = "<div class='academic-content'>$content</div>";
                $inst->contentformat = FORMAT_HTML;
                $inst->timemodified = $now;
                $instanceId = $DB->insert_record('page', $inst);
            } elseif ($modType === 'quiz') {
                $inst = new stdClass();
                $inst->course = $courseId;
                $inst->name = $name;
                $inst->intro = "<p>$content</p>";
                $inst->introformat = FORMAT_HTML;
                $inst->timeopen = $now;
                $inst->timeclose = $now + (30 * 86400);
                $inst->timelimit = 3600; // 60 mins
                $inst->attempts = 2;
                $inst->grademethod = 1;
                $inst->decimalpoints = 2;
                $inst->timecreated = $now;
                $inst->timemodified = $now;
                $instanceId = $DB->insert_record('quiz', $inst);
            } elseif ($modType === 'assign') {
                $inst = new stdClass();
                $inst->course = $courseId;
                $inst->name = $name;
                $inst->intro = "<p>$content</p>";
                $inst->introformat = FORMAT_HTML;
                $inst->duedate = $now + (14 * 86400);
                $inst->cutoffdate = $now + (21 * 86400);
                $inst->grade = 100;
                $inst->timemodified = $now;
                $instanceId = $DB->insert_record('assign', $inst);
            } elseif ($modType === 'resource') {
                $inst = new stdClass();
                $inst->course = $courseId;
                $inst->name = $name;
                $inst->intro = "<p>$content</p>";
                $inst->introformat = FORMAT_HTML;
                $inst->timemodified = $now;
                $instanceId = $DB->insert_record('resource', $inst);
            } elseif ($modType === 'attendance') {
                $inst = new stdClass();
                $inst->course = $courseId;
                $inst->name = $name;
                $inst->intro = "<p>$content</p>";
                $inst->introformat = FORMAT_HTML;
                $inst->grade = 100;
                $inst->timemodified = $now;
                $instanceId = $DB->insert_record('attendance', $inst);
            } elseif ($modType === 'vpl') {
                $inst = new stdClass();
                $inst->course = $courseId;
                $inst->name = $name;
                $inst->shortdescription = substr($name, 0, 255);
                $inst->intro = "<p>$content</p>";
                $inst->introformat = FORMAT_HTML;
                $inst->startdate = $now;
                $inst->duedate = $now + (14 * 86400);
                $inst->maxfiles = 5;
                $inst->maxfilesize = 10485760;
                $inst->grade = 100;
                $inst->timemodified = $now;
                $instanceId = $DB->insert_record('vpl', $inst);
            }

            $section = $DB->get_record('course_sections', ['course' => $courseId, 'section' => $sectionNumber]);
            if (!$section) {
                $section = $DB->get_record('course_sections', ['id' => $sectionNumber, 'course' => $courseId]);
            }

            // Create Course Module entry
            $cm = new stdClass();
            $cm->course = $courseId;
            $cm->module = $modId;
            $cm->instance = $instanceId;
            $cm->section = $section ? (int)$section->id : $sectionNumber;
            $cm->added = $now;
            $cm->visible = 1;
            $cm->visibleoncoursepage = 1;
            $cm->completion = 1;
            $cmId = $DB->insert_record('course_modules', $cm);

            // Append to Section sequence
            if ($section) {
                $seq = trim((string)$section->sequence);
                $newSeq = $seq === '' ? (string)$cmId : $seq . ',' . $cmId;
                $DB->set_field('course_sections', 'sequence', $newSeq, ['id' => $section->id]);
            }

            course_modinfo::clear_instance_cache($courseId);
            if (!empty($courseId) && isset($input['tuition_fee'])) {
                $newFee = (float)$input['tuition_fee'];
                $enrols = $DB->get_records('enrol', ['courseid' => $courseId]);
                foreach ($enrols as $enr) {
                    if ($enr->enrol === 'fee' || $enr->cost > 0 || count($enrols) === 1) {
                        $DB->set_field('enrol', 'cost', (string)$newFee, ['id' => $enr->id]);
                    }
                }
                if (isset($changed) && is_array($changed)) {
                    $changed[] = 'tuition_fee';
                }
            }

            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');

            echo json_encode([
                'success' => true,
                'cm_id' => $cmId,
                'instance_id' => $instanceId,
                'mod_type' => $modType,
                'name' => $name,
                'message' => "Activity '$name' ($modType) added to Section $sectionNumber.",
            ]);
            break;

        case 'delete_activity':
            $cmId = (int)($input['cm_id'] ?? $input['id'] ?? 0);
            if (!$cmId) {
                throw new \InvalidArgumentException("Course module ID is required.");
            }
            $cm = $DB->get_record('course_modules', ['id' => $cmId]);
            if (!$cm) {
                throw new \InvalidArgumentException("Course module #$cmId not found.");
            }
            $modName = $DB->get_field('modules', 'name', ['id' => $cm->module]);
            if ($modName && $cm->instance) {
                $DB->delete_records($modName, ['id' => $cm->instance]);
            }
            $DB->delete_records('course_modules', ['id' => $cmId]);
            // Remove from section sequence
            $sec = $DB->get_record('course_sections', ['id' => $cm->section])
                ?: $DB->get_record('course_sections', ['course' => $cm->course, 'section' => $cm->section]);
            if ($sec && !empty($sec->sequence)) {
                $seqArr = array_filter(explode(',', $sec->sequence), fn($x) => (int)$x !== $cmId);
                $DB->set_field('course_sections', 'sequence', implode(',', $seqArr), ['id' => $sec->id]);
            }
            course_modinfo::clear_instance_cache($cm->course);
            if (!empty($courseId) && isset($input['tuition_fee'])) {
                $newFee = (float)$input['tuition_fee'];
                $enrols = $DB->get_records('enrol', ['courseid' => $courseId]);
                foreach ($enrols as $enr) {
                    if ($enr->enrol === 'fee' || $enr->cost > 0 || count($enrols) === 1) {
                        $DB->set_field('enrol', 'cost', (string)$newFee, ['id' => $enr->id]);
                    }
                }
                if (isset($changed) && is_array($changed)) {
                    $changed[] = 'tuition_fee';
                }
            }

            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');
            echo json_encode(['success' => true, 'cm_id' => $cmId, 'message' => "Activity module #$cmId deleted successfully."]);
            break;

        case 'update_activity':
            $cmId = (int)($input['cm_id'] ?? $input['id'] ?? 0);
            $name = trim($input['name'] ?? '');
            $content = $input['content'] ?? null;
            $visible = isset($input['visible']) ? (int)$input['visible'] : null;

            if (!$cmId) {
                throw new \InvalidArgumentException("Course module ID is required.");
            }
            $cm = $DB->get_record('course_modules', ['id' => $cmId]);
            if (!$cm) {
                throw new \InvalidArgumentException("Course module #$cmId not found.");
            }
            $modName = $DB->get_field('modules', 'name', ['id' => $cm->module]);

            if ($visible !== null) {
                $DB->set_field('course_modules', 'visible', $visible, ['id' => $cmId]);
            }
            if ($modName && $cm->instance) {
                if ($name !== '') {
                    $DB->set_field($modName, 'name', $name, ['id' => $cm->instance]);
                }
                if ($content !== null && $modName === 'page') {
                    $DB->set_field('page', 'content', $content, ['id' => $cm->instance]);
                } elseif ($content !== null && $DB->get_manager()->table_exists($modName)) {
                    try {
                        $DB->set_field($modName, 'intro', $content, ['id' => $cm->instance]);
                    } catch (\Throwable $e) {}
                }
            }
            course_modinfo::clear_instance_cache($cm->course);
            if (!empty($courseId) && isset($input['tuition_fee'])) {
                $newFee = (float)$input['tuition_fee'];
                $enrols = $DB->get_records('enrol', ['courseid' => $courseId]);
                foreach ($enrols as $enr) {
                    if ($enr->enrol === 'fee' || $enr->cost > 0 || count($enrols) === 1) {
                        $DB->set_field('enrol', 'cost', (string)$newFee, ['id' => $enr->id]);
                    }
                }
                if (isset($changed) && is_array($changed)) {
                    $changed[] = 'tuition_fee';
                }
            }

            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');
            echo json_encode(['success' => true, 'cm_id' => $cmId, 'message' => "Activity module #$cmId updated successfully."]);
            break;

        case 'toggle_enrol':
            $courseId = (int)($input['course_id'] ?? 0);
            $enrolId = (int)($input['enrol_id'] ?? 0);
            $status = (int)($input['status'] ?? 0); // 0 = active, 1 = disabled

            if (!$courseId || !$enrolId) {
                throw new \InvalidArgumentException("Course ID and enrolment ID are required.");
            }

            $DB->set_field('enrol', 'status', $status, ['id' => $enrolId, 'courseid' => $courseId]);
            if (!empty($courseId) && isset($input['tuition_fee'])) {
                $newFee = (float)$input['tuition_fee'];
                $enrols = $DB->get_records('enrol', ['courseid' => $courseId]);
                foreach ($enrols as $enr) {
                    if ($enr->enrol === 'fee' || $enr->cost > 0 || count($enrols) === 1) {
                        $DB->set_field('enrol', 'cost', (string)$newFee, ['id' => $enr->id]);
                    }
                }
                if (isset($changed) && is_array($changed)) {
                    $changed[] = 'tuition_fee';
                }
            }

            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');

            echo json_encode([
                'success' => true,
                'enrol_id' => $enrolId,
                'status' => $status,
                'message' => "Enrolment method status updated.",
            ]);
            break;


        case 'get_categories':
            $cats = $DB->get_records('course_categories', null, 'sortorder ASC');
            $catMediaMap = get_outlms_category_media_map($DB);
            $list = [];
            foreach ($cats as $cat) {
                $catId = (int)$cat->id;
                $catIcon = $catMediaMap['icons'][$catId]['icon'] ?? ('/assets/img/category/icons/cat-icon-' . $catId . '-fstes.svg');
                $catCover = $catMediaMap['covers'][$catId]['cover'] ?? ('/assets/img/category/covers/cat-cover-' . $catId . '-fstes.svg');
                $catAccent = $catMediaMap['covers'][$catId]['accent'] ?? '#0284c7';
                $catBadge = $catMediaMap['covers'][$catId]['badge'] ?? ($cat->idnumber ?: ('FAC-' . $catId));

                $list[] = [
                    'id' => $catId,
                    'name' => $cat->name,
                    'idnumber' => $cat->idnumber ?: '',
                    'description' => $cat->description ?: '',
                    'parent' => (int)$cat->parent,
                    'coursecount' => (int)$cat->coursecount,
                    'visible' => (int)$cat->visible,
                    'depth' => (int)$cat->depth,
                    'path' => $cat->path,
                    'icon' => $catIcon,
                    'categoryIcon' => $catIcon,
                    'cover' => $catCover,
                    'categoryCover' => $catCover,
                    'accentColor' => $catAccent,
                    'badgeText' => $catBadge,
                ];
            }
            echo json_encode([
                'success' => true,
                'total' => count($list),
                'categories' => $list,
            ]);
            break;

        case 'add_category':
            $name = trim($input['name'] ?? '');
            if (empty($name)) {
                throw new \InvalidArgumentException("Category name is required.");
            }
            $parent = (int)($input['parent'] ?? 0);
            $idnumber = trim($input['idnumber'] ?? '');
            $description = trim($input['description'] ?? '');

            $cat = \core_course_category::create([
                'name' => $name,
                'parent' => $parent,
                'idnumber' => $idnumber,
                'description' => $description,
            ]);

            if (!empty($courseId) && isset($input['tuition_fee'])) {
                $newFee = (float)$input['tuition_fee'];
                $enrols = $DB->get_records('enrol', ['courseid' => $courseId]);
                foreach ($enrols as $enr) {
                    if ($enr->enrol === 'fee' || $enr->cost > 0 || count($enrols) === 1) {
                        $DB->set_field('enrol', 'cost', (string)$newFee, ['id' => $enr->id]);
                    }
                }
                if (isset($changed) && is_array($changed)) {
                    $changed[] = 'tuition_fee';
                }
            }

            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');

            echo json_encode([
                'success' => true,
                'category' => [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'parent' => $cat->parent,
                    'idnumber' => $cat->idnumber,
                    'description' => $description,
                ],
                'message' => "Category '{$cat->name}' created successfully.",
            ]);
            break;

        case 'delete_category':
            $catId = (int)($input['category_id'] ?? 0);
            if ($catId <= 0) {
                throw new \InvalidArgumentException("Valid Category ID is required.");
            }
            $moveTo = (int)($input['move_to_id'] ?? 0);
            $cat = \core_course_category::get($catId);
            if (!$cat) {
                throw new \InvalidArgumentException("Category ID $catId not found.");
            }
            if ($moveTo > 0) {
                $cat->delete_move($moveTo, false);
            } else {
                $cat->delete_full(false);
            }
            if (!empty($courseId) && isset($input['tuition_fee'])) {
                $newFee = (float)$input['tuition_fee'];
                $enrols = $DB->get_records('enrol', ['courseid' => $courseId]);
                foreach ($enrols as $enr) {
                    if ($enr->enrol === 'fee' || $enr->cost > 0 || count($enrols) === 1) {
                        $DB->set_field('enrol', 'cost', (string)$newFee, ['id' => $enr->id]);
                    }
                }
                if (isset($changed) && is_array($changed)) {
                    $changed[] = 'tuition_fee';
                }
            }

            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');
            echo json_encode([
                'success' => true,
                'category_id' => $catId,
                'message' => "Category deleted successfully.",
            ]);
            break;

        case 'update_category':
            $catId = (int)($input['category_id'] ?? 0);
            if ($catId <= 0) {
                throw new \InvalidArgumentException("Valid Category ID is required.");
            }
            $cat = \core_course_category::get($catId);
            if (!$cat) {
                throw new \InvalidArgumentException("Category ID $catId not found.");
            }
            $updateData = new \stdClass();
            if (isset($input['name']) && trim($input['name']) !== '') {
                $updateData->name = trim($input['name']);
            }
            if (isset($input['idnumber'])) {
                $updateData->idnumber = trim($input['idnumber']);
            }
            if (isset($input['description'])) {
                $updateData->description = trim($input['description']);
            }
            if (isset($input['parent'])) {
                $updateData->parent = (int)$input['parent'];
            }
            if (isset($input['visible'])) {
                $updateData->visible = (int)$input['visible'];
            }
            $cat->update($updateData);
            if (!empty($courseId) && isset($input['tuition_fee'])) {
                $newFee = (float)$input['tuition_fee'];
                $enrols = $DB->get_records('enrol', ['courseid' => $courseId]);
                foreach ($enrols as $enr) {
                    if ($enr->enrol === 'fee' || $enr->cost > 0 || count($enrols) === 1) {
                        $DB->set_field('enrol', 'cost', (string)$newFee, ['id' => $enr->id]);
                    }
                }
                if (isset($changed) && is_array($changed)) {
                    $changed[] = 'tuition_fee';
                }
            }

            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');

            echo json_encode([
                'success' => true,
                'category' => [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'parent' => $cat->parent,
                    'idnumber' => $cat->idnumber,
                    'visible' => $cat->visible,
                ],
                'message' => "Category '{$cat->name}' updated successfully.",
            ]);
            break;

        case 'delete_course':
            $courseId = (int)($input['course_id'] ?? 0);
            if ($courseId <= 1) {
                throw new \InvalidArgumentException("Valid course ID is required (cannot delete site home course).");
            }
            delete_course($courseId, false);
            if (!empty($courseId) && isset($input['tuition_fee'])) {
                $newFee = (float)$input['tuition_fee'];
                $enrols = $DB->get_records('enrol', ['courseid' => $courseId]);
                foreach ($enrols as $enr) {
                    if ($enr->enrol === 'fee' || $enr->cost > 0 || count($enrols) === 1) {
                        $DB->set_field('enrol', 'cost', (string)$newFee, ['id' => $enr->id]);
                    }
                }
                if (isset($changed) && is_array($changed)) {
                    $changed[] = 'tuition_fee';
                }
            }

            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');
            echo json_encode([
                'success' => true,
                'course_id' => $courseId,
                'message' => "Course deleted successfully.",
            ]);
            break;

        case 'get_course_defaults':
            echo json_encode([
                'success' => true,
                'defaults' => [
                    'format' => get_config('moodlecourse', 'format') ?: 'topics',
                    'maxbytes' => (int)(get_config('moodlecourse', 'maxbytes') ?: 0),
                    'showgrades' => (int)(get_config('moodlecourse', 'showgrades') !== false ? get_config('moodlecourse', 'showgrades') : 1),
                    'showreports' => (int)(get_config('moodlecourse', 'showreports') ?: 0),
                    'enablecompletion' => (int)(get_config('moodlecourse', 'enablecompletion') !== false ? get_config('moodlecourse', 'enablecompletion') : 1),
                    'numsections' => (int)(get_config('moodlecourse', 'numsections') ?: 4),
                    'hiddensections' => (int)(get_config('moodlecourse', 'hiddensections') ?: 0),
                    'coursedisplay' => (int)(get_config('moodlecourse', 'coursedisplay') ?: 0),
                ],
            ]);
            break;

        case 'update_course_defaults':
            $allowed = ['format', 'maxbytes', 'showgrades', 'showreports', 'enablecompletion', 'numsections', 'hiddensections', 'coursedisplay'];
            $updated = [];
            foreach ($allowed as $key) {
                if (isset($input[$key])) {
                    set_config($key, $input[$key], 'moodlecourse');
                    $updated[$key] = $input[$key];
                }
            }
            purge_all_caches();
            echo json_encode([
                'success' => true,
                'updated' => $updated,
                'message' => "Course default settings updated successfully.",
            ]);
            break;

        case 'get_groups':
            $courseId = (int)($input['course_id'] ?? $_GET['course_id'] ?? 0);
            if (!$courseId) {
                throw new \InvalidArgumentException("Course ID is required.");
            }
            $groups = groups_get_all_groups($courseId);
            $list = [];
            foreach ($groups as $g) {
                $members = groups_get_members($g->id);
                $list[] = [
                    'id' => (int)$g->id,
                    'name' => $g->name,
                    'description' => $g->description ?: '',
                    'courseid' => (int)$g->courseid,
                    'member_count' => count($members),
                    'timecreated' => (int)$g->timecreated,
                ];
            }
            echo json_encode([
                'success' => true,
                'course_id' => $courseId,
                'total' => count($list),
                'groups' => $list,
            ]);
            break;

        case 'create_group':
            $courseId = (int)($input['course_id'] ?? 0);
            $name = trim($input['name'] ?? '');
            if (!$courseId || empty($name)) {
                throw new \InvalidArgumentException("Course ID and group name are required.");
            }
            $grp = new stdClass();
            $grp->courseid = $courseId;
            $grp->name = $name;
            $grp->description = trim($input['description'] ?? '');
            $grp->enrolmentkey = trim($input['enrolmentkey'] ?? '');
            $groupId = groups_create_group($grp);
            echo json_encode([
                'success' => true,
                'group' => [
                    'id' => $groupId,
                    'name' => $name,
                    'course_id' => $courseId,
                ],
                'message' => "Group '{$name}' created successfully.",
            ]);
            break;

        case 'delete_group':
            $groupId = (int)($input['group_id'] ?? 0);
            if (!$groupId) {
                throw new \InvalidArgumentException("Group ID is required.");
            }
            groups_delete_group($groupId);
            echo json_encode([
                'success' => true,
                'group_id' => $groupId,
                'message' => "Group deleted successfully.",
            ]);
            break;

        case 'get_course_details':
            $courseId = (int)($input['course_id'] ?? $_GET['course_id'] ?? 4);
            $course = $DB->get_record('course', ['id' => $courseId]);
            if (!$course) {
                throw new \InvalidArgumentException("Course ID $courseId not found.");
            }

            $category = $DB->get_record('course_categories', ['id' => $course->category]);
            $ssoBase = $CFG->wwwroot . '/sso.php?token=' . urlencode($token);

            // Fetch course structure and modules
            $modinfo = get_fast_modinfo($course);
            $sectionsInfo = $modinfo->get_section_info_all();
            $sectionsList = [];

            foreach ($sectionsInfo as $s) {
                $cms = $modinfo->get_sections()[$s->section] ?? [];
                $modulesInSec = [];

                foreach ($cms as $cmid) {
                    $cm = $modinfo->get_cm($cmid);
                    $modContent = '';
                    try {
                        if ($cm->modname === 'page') {
                            $pg = $DB->get_record('page', ['id' => $cm->instance], 'id, intro, content');
                            if ($pg) {
                                $modContent = $pg->content ?: ($pg->intro ?: '');
                            }
                        } elseif ($DB->get_manager()->table_exists($cm->modname)) {
                            $instRec = $DB->get_record($cm->modname, ['id' => $cm->instance]);
                            if ($instRec && isset($instRec->intro)) {
                                $modContent = (string)$instRec->intro;
                            }
                        }
                    } catch (\Throwable $e) {}

                    $modulesInSec[] = [
                        'id' => (int)$cm->id,
                        'instance' => (int)$cm->instance,
                        'modname' => $cm->modname,
                        'name' => $cm->name,
                        'content' => $modContent,
                        'visible' => (int)$cm->visible,
                        'completion' => (int)$cm->completion,
                        'uservisible' => (bool)$cm->uservisible,
                        'sso_url' => $ssoBase . '&redirect=' . urlencode("/mod/{$cm->modname}/view.php?id={$cm->id}"),
                        'sso_edit_url' => $ssoBase . '&redirect=' . urlencode("/course/modedit.php?update={$cm->id}&return=1"),
                    ];
                }

                $secName = $s->name ?: ($s->section === 0 ? 'General' : 'Section ' . $s->section);
                $sectionsList[] = [
                    'id' => (int)$s->id,
                    'section' => (int)$s->section,
                    'name' => $secName,
                    'summary' => $s->summary ?: '',
                    'visible' => (int)$s->visible,
                    'modules_count' => count($modulesInSec),
                    'modules' => $modulesInSec,
                    'sso_url' => $ssoBase . '&redirect=' . urlencode("/course/section.php?id={$s->id}"),
                ];
            }

            // Enrolled participants count
            $context = context_course::instance($courseId);
            $enrolledCount = count_enrolled_users($context);

            // Grade items count
            $gradeItems = grade_item::fetch_all(['courseid' => $courseId]) ?: [];
            $gradeCount = count($gradeItems);

            // Groups count
            $groups = groups_get_all_groups($courseId);

            // Format options (templatesview, userinstructions, teacherinstructions, hiddensections, coursedisplay, numsections)
            $fmtOpts = [];
            if ($DB->get_manager()->table_exists('course_format_options')) {
                $optRecords = $DB->get_records('course_format_options', ['courseid' => $courseId, 'sectionid' => 0]);
                foreach ($optRecords as $or) {
                    $fmtOpts[$or->name] = $or->value;
                }
            }
            $courseMediaMap = get_outlms_course_media_map($DB);
            $courseImage = get_outlms_course_thumbnail((int)$course->id, (string)$course->shortname, $courseMediaMap);
            $savedTagsJson = get_config('local_outlms_bridge', "course_tags_{$courseId}");
            $savedTags = $savedTagsJson ? (json_decode($savedTagsJson, true) ?: []) : ['TCU-Accredited', 'SARIS'];

            $tuitionFee = 0;
            $enrolsForFee = $DB->get_records('enrol', ['courseid' => $courseId]);
            foreach ($enrolsForFee as $ef) {
                if ((float)($ef->cost ?? 0) > 0) {
                    $tuitionFee = (float)$ef->cost;
                    break;
                }
            }

            echo json_encode([
                'success' => true,
                'course' => [
                    'id' => (int)$course->id,
                    'fullname' => $course->fullname,
                    'shortname' => $course->shortname,
                    'idnumber' => $course->idnumber ?: '',
                    'category_id' => (int)$course->category,
                    'category_name' => $category ? $category->name : 'Unassigned',
                    'summary' => $course->summary ?: '',
                    'course_image' => $courseImage,
                    'tuition_fee' => $tuitionFee,
                    'format' => $course->format,
                    'visible' => (int)$course->visible,
                    'startdate' => (int)$course->startdate,
                    'enddate' => (int)$course->enddate,
                    'hiddensections' => isset($fmtOpts['hiddensections']) ? (int)$fmtOpts['hiddensections'] : (int)($course->hiddensections ?? 0),
                    'coursedisplay' => isset($fmtOpts['coursedisplay']) ? (int)$fmtOpts['coursedisplay'] : (int)($course->coursedisplay ?? 0),
                    'templatesview' => $fmtOpts['templatesview'] ?? 'tile',
                    'userinstructions' => $fmtOpts['userinstructions'] ?? '<p>Welcome to this course. Select a learning module or template below to begin your academic journey.</p>',
                    'teacherinstructions' => $fmtOpts['teacherinstructions'] ?? '<p>Choose a Kickstart course blueprint below or customize sections, activities, attendance registers, and grading rubrics directly from the Course Studio.</p>',
                    'lang' => $course->lang ?: '',
                    'newsitems' => (int)$course->newsitems,
                    'showgrades' => (int)$course->showgrades,
                    'showreports' => (int)$course->showreports,
                    'showactivitydates' => (int)($course->showactivitydates ?? 1),
                    'maxbytes' => (int)$course->maxbytes,
                    'enablecompletion' => (int)$course->enablecompletion,
                    'showcompletionconditions' => (int)($course->showcompletionconditions ?? 1),
                    'groupmode' => (int)$course->groupmode,
                    'groupmodeforce' => (int)$course->groupmodeforce,
                    'defaultgroupingid' => (int)$course->defaultgroupingid,
                    'tags' => $savedTags,
                    'sections_count' => count($sectionsList),
                    'participants_count' => $enrolledCount,
                    'grade_items_count' => $gradeCount,
                    'groups_count' => count($groups),
                    'sso_links' => [
                        'course' => $ssoBase . '&redirect=' . urlencode("/course/view.php?id={$course->id}"),
                        'settings' => $ssoBase . '&redirect=' . urlencode("/course/edit.php?id={$course->id}"),
                        'participants' => $ssoBase . '&redirect=' . urlencode("/user/index.php?id={$course->id}"),
                        'grades' => $ssoBase . '&redirect=' . urlencode("/grade/report/index.php?id={$course->id}"),
                        'activities' => $ssoBase . '&redirect=' . urlencode("/course/overview.php?id={$course->id}"),
                        'reset' => $ssoBase . '&redirect=' . urlencode("/course/reset.php?id={$course->id}"),
                        'backup' => $ssoBase . '&redirect=' . urlencode("/backup/backup.php?id={$course->id}"),
                        'restore' => $ssoBase . '&redirect=' . urlencode("/backup/restorefile.php?contextid={$context->id}"),
                    ],
                    'sections' => $sectionsList,
                ],
            ]);
            break;

        case 'update_course_settings':
            $courseId = (int)($input['course_id'] ?? $input['id'] ?? 0);
            if ($courseId <= 1) {
                throw new \InvalidArgumentException("Valid course ID required (cannot edit site root course).");
            }

            $currentCourse = $DB->get_record('course', ['id' => $courseId]);
            if (!$currentCourse) {
                throw new \InvalidArgumentException("Course ID $courseId not found.");
            }

            if (isset($input['category_id']) && !isset($input['category'])) {
                $input['category'] = (int)$input['category_id'];
            }

            $update = new stdClass();
            $update->id = $courseId;

            $allowedFields = [
                'fullname', 'shortname', 'idnumber', 'category', 'summary',
                'format', 'visible', 'startdate', 'enddate',
                'hiddensections', 'coursedisplay', 'lang', 'newsitems',
                'showgrades', 'showreports', 'showactivitydates',
                'maxbytes', 'enablecompletion', 'showcompletionconditions',
                'groupmode', 'groupmodeforce', 'defaultgroupingid'
            ];

            $changed = [];
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    if (in_array($field, ['category', 'visible', 'startdate', 'enddate', 'hiddensections', 'coursedisplay', 'newsitems', 'showgrades', 'showreports', 'showactivitydates', 'maxbytes', 'enablecompletion', 'showcompletionconditions', 'groupmode', 'groupmodeforce', 'defaultgroupingid'])) {
                        $update->$field = (int)$input[$field];
                    } else if ($field === 'summary') {
                        $update->summary = (string)$input['summary'];
                        $update->summaryformat = FORMAT_HTML;
                    } else {
                        $update->$field = trim((string)$input[$field]);
                    }
                    $changed[] = $field;
                }
            }
            $update->timemodified = time();
            $DB->update_record('course', $update);

            // Save format options (templatesview, userinstructions, teacherinstructions, hiddensections, coursedisplay)
            $activeFormat = $update->format ?? $currentCourse->format;
            $fmtUpdates = [];
            foreach (['templatesview', 'userinstructions', 'teacherinstructions', 'hiddensections', 'coursedisplay'] as $fKey) {
                if (isset($input[$fKey])) {
                    $fmtUpdates[$fKey] = (string)$input[$fKey];
                }
            }
            if (!empty($fmtUpdates) && $DB->get_manager()->table_exists('course_format_options')) {
                foreach ($fmtUpdates as $optName => $optVal) {
                    $existingOpt = $DB->get_record('course_format_options', [
                        'courseid' => $courseId,
                        'format' => $activeFormat,
                        'sectionid' => 0,
                        'name' => $optName,
                    ]);
                    if ($existingOpt) {
                        $existingOpt->value = $optVal;
                        $DB->update_record('course_format_options', $existingOpt);
                    } else {
                        $DB->insert_record('course_format_options', (object)[
                            'courseid' => $courseId,
                            'format' => $activeFormat,
                            'sectionid' => 0,
                            'name' => $optName,
                            'value' => $optVal,
                        ]);
                    }
                    $changed[] = $optName;
                }
            }

            // Update course image if provided
            $courseImageInput = trim((string)($input['course_image'] ?? ''));
            if (!empty($courseImageInput) && $DB->get_manager()->table_exists('outlms_media')) {
                $savedImgPath = $courseImageInput;
                $shortForFile = $update->shortname ?? $currentCourse->shortname;
                $fullForFile = $update->fullname ?? $currentCourse->fullname;
                if (preg_match('/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/', $courseImageInput, $imgMatches)) {
                    $ext = strtolower($imgMatches[1]);
                    if ($ext === 'svg+xml') $ext = 'svg';
                    if ($ext === 'jpeg') $ext = 'jpg';
                    $decodedBytes = base64_decode($imgMatches[2]);
                    if ($decodedBytes !== false) {
                        $slug = preg_replace('/[^a-z0-9]+/', '-', strtolower($shortForFile));
                        $fileName = "course-{$courseId}-" . trim($slug, '-') . ".{$ext}";
                        $frontDir = dirname($moodleRoot) . '/frontend/public/assets/img/course/thumbnails';
                        $buildDir = dirname($moodleRoot) . '/frontend/build/assets/img/course/thumbnails';
                        if (is_dir($frontDir)) {
                            @file_put_contents($frontDir . '/' . $fileName, $decodedBytes);
                        }
                        if (is_dir($buildDir)) {
                            @file_put_contents($buildDir . '/' . $fileName, $decodedBytes);
                        }
                        $savedImgPath = "/assets/img/course/thumbnails/{$fileName}";
                    }
                }
                $existingMedia = $DB->get_record('outlms_media', ['entity_type' => 'course', 'entity_id' => $courseId, 'media_type' => 'thumbnail']);
                if ($existingMedia) {
                    $existingMedia->file_path = $savedImgPath;
                    $existingMedia->timemodified = time();
                    $DB->update_record('outlms_media', $existingMedia);
                } else {
                    $DB->insert_record('outlms_media', (object)[
                        'entity_type' => 'course',
                        'entity_id' => $courseId,
                        'media_type' => 'thumbnail',
                        'file_path' => $savedImgPath,
                        'accent_color' => '#013BA6',
                        'badge_text' => $shortForFile,
                        'alt_text' => $fullForFile,
                        'timecreated' => time(),
                        'timemodified' => time(),
                    ]);
                }
                $changed[] = 'course_image';
            }

            // Update tags if provided
            if (isset($input['tags'])) {
                $tagsInput = is_string($input['tags'])
                    ? array_filter(array_map('trim', explode(',', $input['tags'])))
                    : (is_array($input['tags']) ? $input['tags'] : []);
                set_config("course_tags_{$courseId}", json_encode(array_values($tagsInput)), 'local_outlms_bridge');
                $changed[] = 'tags';
            }

            if (!empty($courseId) && isset($input['tuition_fee'])) {
                $newFee = (float)$input['tuition_fee'];
                $enrols = $DB->get_records('enrol', ['courseid' => $courseId]);
                foreach ($enrols as $enr) {
                    if ($enr->enrol === 'fee' || $enr->cost > 0 || count($enrols) === 1) {
                        $DB->set_field('enrol', 'cost', (string)$newFee, ['id' => $enr->id]);
                    }
                }
                if (isset($changed) && is_array($changed)) {
                    $changed[] = 'tuition_fee';
                }
            }

            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');
            try {
                course_modinfo::clear_instance_cache($courseId);
            } catch (\Throwable $e) {}

            echo json_encode([
                'success' => true,
                'course_id' => $courseId,
                'updated_fields' => $changed,
                'message' => "Course settings for '{$currentCourse->shortname}' updated successfully.",
            ]);
            break;

        case 'get_course_participants':
            $courseId = (int)($input['course_id'] ?? $_GET['course_id'] ?? 4);
            $context = context_course::instance($courseId);
            $enrolled = get_enrolled_users($context, '', 0, 'u.*', 'u.lastname ASC');
            $ssoBase = $CFG->wwwroot . '/sso.php?token=' . urlencode($token);

            $list = [];
            foreach ($enrolled as $u) {
                $roles = get_user_roles($context, $u->id, true);
                $roleNames = array_map(function($r) { return $r->name ?: $r->shortname; }, $roles);
                $roleString = !empty($roleNames) ? implode(', ', $roleNames) : 'Student';

                $list[] = [
                    'id' => (int)$u->id,
                    'username' => $u->username,
                    'fullname' => fullname($u),
                    'email' => $u->email,
                    'role' => $roleString,
                    'suspended' => (int)$u->suspended,
                    'lastaccess' => (int)$u->lastaccess,
                    'department' => $u->department ?: 'Academic Department',
                    'sso_profile_url' => $ssoBase . '&redirect=' . urlencode("/user/view.php?id={$u->id}&course={$courseId}"),
                ];
            }

            echo json_encode([
                'success' => true,
                'course_id' => $courseId,
                'total' => count($list),
                'participants' => $list,
                'sso_manage_url' => $ssoBase . '&redirect=' . urlencode("/user/index.php?id={$courseId}"),
            ]);
            break;

        case 'get_course_grades':
            $courseId = (int)($input['course_id'] ?? $_GET['course_id'] ?? 4);
            $gradeItems = grade_item::fetch_all(['courseid' => $courseId]) ?: [];
            $ssoBase = $CFG->wwwroot . '/sso.php?token=' . urlencode($token);

            $items = [];
            foreach ($gradeItems as $gi) {
                $items[] = [
                    'id' => (int)$gi->id,
                    'itemname' => $gi->itemname ?: ($gi->itemtype === 'course' ? 'Course Total' : 'Assessment Item'),
                    'itemtype' => $gi->itemtype,
                    'itemmodule' => $gi->itemmodule ?: '',
                    'grademax' => (float)$gi->grademax,
                    'grademin' => (float)$gi->grademin,
                    'hidden' => (int)$gi->hidden,
                    'locked' => (int)$gi->locked,
                ];
            }

            echo json_encode([
                'success' => true,
                'course_id' => $courseId,
                'total_items' => count($items),
                'grade_items' => $items,
                'sso_grader_report_url' => $ssoBase . '&redirect=' . urlencode("/grade/report/grader/index.php?id={$courseId}"),
                'sso_grade_setup_url' => $ssoBase . '&redirect=' . urlencode("/grade/edit/tree/index.php?id={$courseId}"),
            ]);
            break;

        case 'manage_course_section':
            $courseId = (int)($input['course_id'] ?? 0);
            $sectionNum = (int)($input['section'] ?? 0);
            $secAction = $input['sec_action'] ?? 'rename'; // rename, update_summary, toggle_visibility, create, delete, update
            $name = trim($input['name'] ?? '');
            $summary = trim($input['summary'] ?? '');

            if (!$courseId) {
                throw new \InvalidArgumentException("Course ID required.");
            }

            // Handle Section Creation
            if ($secAction === 'create') {
                $maxSec = (int)$DB->get_field_sql("SELECT MAX(section) FROM {course_sections} WHERE course = ?", [$courseId]);
                $nextSec = $maxSec + 1;
                $newSec = new stdClass();
                $newSec->course = $courseId;
                $newSec->section = $nextSec;
                $newSec->name = $name ?: "Section $nextSec";
                $newSec->summary = $summary ?: "";
                $newSec->summaryformat = FORMAT_HTML;
                $newSec->sequence = '';
                $newSec->visible = 1;
                $newSec->availability = null;
                $newSec->timemodified = time();
                $secId = $DB->insert_record('course_sections', $newSec);

                course_modinfo::clear_instance_cache($courseId);
                @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');

                echo json_encode([
                    'success' => true,
                    'course_id' => $courseId,
                    'section' => $nextSec,
                    'section_id' => $secId,
                    'message' => "Section '$newSec->name' (#$nextSec) created successfully in course $courseId.",
                ]);
                break;
            }

            $section = $DB->get_record('course_sections', ['course' => $courseId, 'section' => $sectionNum]);
            if (!$section) {
                throw new \InvalidArgumentException("Section $sectionNum not found in course $courseId.");
            }

            if ($secAction === 'rename') {
                $DB->set_field('course_sections', 'name', $name, ['id' => $section->id]);
            } elseif ($secAction === 'update_summary') {
                $DB->set_field('course_sections', 'summary', $summary, ['id' => $section->id]);
            } elseif ($secAction === 'update') {
                if ($name !== '') {
                    $DB->set_field('course_sections', 'name', $name, ['id' => $section->id]);
                }
                if (isset($input['summary'])) {
                    $DB->set_field('course_sections', 'summary', $summary, ['id' => $section->id]);
                }
                if (isset($input['visible'])) {
                    $DB->set_field('course_sections', 'visible', (int)$input['visible'], ['id' => $section->id]);
                }
            } elseif ($secAction === 'toggle_visibility') {
                $newVis = $section->visible ? 0 : 1;
                $DB->set_field('course_sections', 'visible', $newVis, ['id' => $section->id]);
            } elseif ($secAction === 'delete') {
                if ($sectionNum === 0) {
                    throw new \InvalidArgumentException("Cannot delete General Section 0.");
                }
                // Delete modules inside this section
                $modules = $DB->get_records_select('course_modules', 'course = ? AND (section = ? OR section = ?)', [$courseId, $sectionNum, $section->id]);
                foreach ($modules as $cm) {
                    $modName = $DB->get_field('modules', 'name', ['id' => $cm->module]);
                    if ($modName && $cm->instance) {
                        $DB->delete_records($modName, ['id' => $cm->instance]);
                    }
                    $DB->delete_records('course_modules', ['id' => $cm->id]);
                }
                $DB->delete_records('course_sections', ['id' => $section->id]);
            }

            course_modinfo::clear_instance_cache($courseId);
            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');

            echo json_encode([
                'success' => true,
                'course_id' => $courseId,
                'section' => $sectionNum,
                'message' => "Course section $sectionNum updated successfully.",
            ]);
            break;


        case 'get_course_studio_workspace':
            $categoryId = (int)($input['category_id'] ?? $_GET['category_id'] ?? 1);
            $catsRaw = $DB->get_records('course_categories', null, 'sortorder ASC');
            $catById = [];
            foreach ($catsRaw as $c) {
                $catById[(int)$c->id] = $c;
            }
            $categories = [];
            foreach ($catsRaw as $c) {
                $pathParts = array_values(array_filter(explode('/', (string)$c->path)));
                $pathNames = [];
                foreach ($pathParts as $pid) {
                    if (isset($catById[(int)$pid])) {
                        $pathNames[] = $catById[(int)$pid]->name;
                    }
                }
                $fullPathName = !empty($pathNames) ? implode(' / ', $pathNames) : $c->name;
                $cnt = $DB->count_records('course', ['category' => $c->id]);
                $categories[] = [
                    'id' => (int)$c->id,
                    'name' => $c->name,
                    'full_path_name' => $fullPathName,
                    'idnumber' => $c->idnumber ?: '',
                    'description' => $c->description ?: '',
                    'parent' => (int)$c->parent,
                    'visible' => (int)$c->visible,
                    'depth' => (int)$c->depth,
                    'path' => $c->path,
                    'coursecount' => (int)$cnt,
                    'theme' => $c->theme ?: '',
                ];
            }

            // Courses list with full metadata
            $coursesRaw = $DB->get_records_select('course', 'id > 1', [], 'sortorder ASC, id DESC');
            $courses = [];
            foreach ($coursesRaw as $cr) {
                $secCnt = $DB->count_records('course_sections', ['course' => $cr->id]);
                $modCnt = $DB->count_records('course_modules', ['course' => $cr->id]);
                $enrolledCnt = $DB->count_records_sql(
                    "SELECT COUNT(DISTINCT ue.userid) FROM {user_enrolments} ue JOIN {enrol} e ON e.id = ue.enrolid WHERE e.courseid = ?",
                    [$cr->id]
                );
                $catObj = $catById[(int)$cr->category] ?? null;
                $customImg = get_config('local_outlms_bridge', "course_image_{$cr->id}");
                $tagsRaw = get_config('local_outlms_bridge', "course_tags_{$cr->id}");
                $tagsList = $tagsRaw ? (json_decode($tagsRaw, true) ?: []) : ['OUT', 'Academic'];
                $courses[] = [
                    'id' => (int)$cr->id,
                    'fullname' => $cr->fullname,
                    'shortname' => $cr->shortname,
                    'idnumber' => $cr->idnumber ?: '',
                    'category_id' => (int)$cr->category,
                    'category_name' => $catObj ? $catObj->name : 'Category 1',
                    'visible' => (int)$cr->visible,
                    'format' => $cr->format ?: 'kickstart',
                    'startdate' => (int)$cr->startdate,
                    'enddate' => (int)$cr->enddate,
                    'summary' => $cr->summary ?: '',
                    'sections_count' => max(0, $secCnt - 1),
                    'modules_count' => $modCnt,
                    'enrolled_students' => $enrolledCnt,
                    'course_image' => $customImg ?: '/assets/img/course/course-01.jpg',
                    'tags' => $tagsList,
                    'lang' => $cr->lang ?: '',
                    'newsitems' => (int)$cr->newsitems,
                    'showgrades' => (int)$cr->showgrades,
                    'showreports' => (int)$cr->showreports,
                    'showactivitydates' => (int)($cr->showactivitydates ?? 1),
                    'maxbytes' => (int)$cr->maxbytes,
                    'enablecompletion' => (int)$cr->enablecompletion,
                    'showcompletionconditions' => (int)($cr->showcompletionconditions ?? 1),
                    'groupmode' => (int)$cr->groupmode,
                    'groupmodeforce' => (int)$cr->groupmodeforce,
                ];
            }

            // Seed realistic cohorts if empty
            if ($DB->count_records('cohort') == 0) {
                $now = time();
                $seedCohorts = [
                    ['name' => '2026/2027 Undergraduate Cohort (First Year)', 'idnumber' => 'COH-UG-2026', 'description' => '<p>First-year undergraduate scholars across all faculties at The Open University of Tanzania.</p>'],
                    ['name' => 'IEMT Professional Short Courses Cohort', 'idnumber' => 'COH-IEMT-PSC', 'description' => '<p>Practitioners enrolled in ICT, AI, and Cybersecurity professional certification tracks.</p>'],
                    ['name' => 'Postgraduate & Masters Research Scholars', 'idnumber' => 'COH-PG-2026', 'description' => '<p>Masters and PhD distance learning scholars in FSTES, FBM, and FED.</p>'],
                ];
                foreach ($seedCohorts as $sc) {
                    $co = new stdClass();
                    $co->contextid = 1;
                    $co->name = $sc['name'];
                    $co->idnumber = $sc['idnumber'];
                    $co->description = $sc['description'];
                    $co->descriptionformat = 1;
                    $co->visible = 1;
                    $co->component = '';
                    $co->timecreated = $now;
                    $co->timemodified = $now;
                    $cid = $DB->insert_record('cohort', $co);
                    // Add scholar user to first cohort
                    $scholarUser = $DB->get_record('user', ['username' => 'scholar']);
                    if ($scholarUser && $cid) {
                        $cm = new stdClass();
                        $cm->cohortid = $cid;
                        $cm->userid = $scholarUser->id;
                        $cm->timeadded = $now;
                        try { $DB->insert_record('cohort_members', $cm); } catch (\Throwable $e) {}
                    }
                }
            }

            $cohortsRaw = $DB->get_records('cohort', null, 'id DESC');
            $cohorts = [];
            foreach ($cohortsRaw as $ch) {
                $memCount = $DB->count_records('cohort_members', ['cohortid' => $ch->id]);
                $cohorts[] = [
                    'id' => (int)$ch->id,
                    'contextid' => (int)$ch->contextid,
                    'name' => $ch->name,
                    'idnumber' => $ch->idnumber ?: '',
                    'description' => $ch->description ?: '',
                    'visible' => (int)$ch->visible,
                    'component' => $ch->component ?: 'Manual',
                    'members_count' => $memCount,
                ];
            }

            // Seed default active filters if empty
            if ($DB->count_records('filter_active') == 0) {
                $seedFilters = [
                    ['filter' => 'displayh5p', 'active' => 1, 'sortorder' => 1],
                    ['filter' => 'mathjaxloader', 'active' => 1, 'sortorder' => 2],
                    ['filter' => 'mediaplugin', 'active' => 1, 'sortorder' => 3],
                    ['filter' => 'multilang', 'active' => -1, 'sortorder' => 4],
                    ['filter' => 'activitynames', 'active' => 1, 'sortorder' => 5],
                    ['filter' => 'urltolink', 'active' => 1, 'sortorder' => 6],
                    ['filter' => 'emoticon', 'active' => -1, 'sortorder' => 7],
                ];
                foreach ($seedFilters as $sf) {
                    $fa = new stdClass();
                    $fa->filter = $sf['filter'];
                    $fa->contextid = 1;
                    $fa->active = $sf['active'];
                    $fa->sortorder = $sf['sortorder'];
                    try { $DB->insert_record('filter_active', $fa); } catch (\Throwable $e) {}
                }
            }
            $filterLabels = [
                'displayh5p' => 'Display H5P Interactive Content',
                'mathjaxloader' => 'MathJax Scientific & LaTeX Equations',
                'mediaplugin' => 'Multimedia Plugins (HTML5 Video/Audio)',
                'multilang' => 'Multi-Language Content (English / Kiswahili)',
                'activitynames' => 'Activity Names Auto-Linking',
                'urltolink' => 'Convert URLs into Links and Images',
                'emoticon' => 'Display Emoticons as Images',
                'glossary' => 'Glossary Auto-Linking',
                'algebra' => 'Algebra Notation Filter',
                'tex' => 'TeX Notation Filter',
                'codehighlighter' => 'Source Code Syntax Highlighter',
            ];
            $filtersRaw = $DB->get_records('filter_active', null, 'sortorder ASC, id ASC');
            $filters = [];
            $seenFilters = [];
            foreach ($filtersRaw as $fl) {
                if (isset($seenFilters[$fl->filter])) continue;
                $seenFilters[$fl->filter] = true;
                $filters[] = [
                    'id' => (int)$fl->id,
                    'filter' => $fl->filter,
                    'name' => $filterLabels[$fl->filter] ?? ucfirst($fl->filter),
                    'active' => (int)$fl->active, // 1 = On, -1 = Off but available, -9999 = Disabled
                    'sortorder' => (int)$fl->sortorder,
                ];
            }

            // Permissions & Role assignments
            $rolesRaw = $DB->get_records('role', null, 'sortorder ASC');
            $roles = [];
            foreach ($rolesRaw as $rl) {
                $defaultNames = [
                    'manager' => 'Manager',
                    'coursecreator' => 'Course creator',
                    'editingteacher' => 'Teacher (Instructor)',
                    'teacher' => 'Non-editing teacher',
                    'student' => 'Student (Scholar)',
                    'guest' => 'Guest',
                    'user' => 'Authenticated user',
                    'frontpage' => 'Authenticated user on site home',
                ];
                $roles[] = [
                    'id' => (int)$rl->id,
                    'shortname' => $rl->shortname,
                    'name' => $rl->name ?: ($defaultNames[$rl->shortname] ?? ucfirst($rl->shortname)),
                    'archetype' => $rl->archetype,
                ];
            }

            $keyCapabilities = [
                [
                    'capability' => 'moodle/course:create',
                    'label' => 'Create new courses in category (moodle/course:create)',
                    'category' => 'Course Management',
                    'roles' => ['manager', 'coursecreator', 'editingteacher'],
                ],
                [
                    'capability' => 'moodle/category:manage',
                    'label' => 'Manage categories & subcategories (moodle/category:manage)',
                    'category' => 'Category Governance',
                    'roles' => ['manager', 'coursecreator'],
                ],
                [
                    'capability' => 'moodle/course:update',
                    'label' => 'Update course settings & wizard blocks (moodle/course:update)',
                    'category' => 'Course Management',
                    'roles' => ['manager', 'coursecreator', 'editingteacher'],
                ],
                [
                    'capability' => 'moodle/course:manageactivities',
                    'label' => 'Add, edit, and rearrange course activities (moodle/course:manageactivities)',
                    'category' => 'Curriculum & Content',
                    'roles' => ['manager', 'coursecreator', 'editingteacher'],
                ],
                [
                    'capability' => 'moodle/restore:restorecourse',
                    'label' => 'Restore and clone courses into category (moodle/restore:restorecourse)',
                    'category' => 'Backup & Restore',
                    'roles' => ['manager', 'coursecreator', 'editingteacher'],
                ],
                [
                    'capability' => 'moodle/cohort:manage',
                    'label' => 'Create, edit, and assign cohorts (moodle/cohort:manage)',
                    'category' => 'Users & Cohorts',
                    'roles' => ['manager', 'coursecreator'],
                ],
                [
                    'capability' => 'moodle/competency:competencymanage',
                    'label' => 'Manage competency frameworks & learning plans (moodle/competency:competencymanage)',
                    'category' => 'Competencies',
                    'roles' => ['manager', 'coursecreator', 'editingteacher'],
                ],
                [
                    'capability' => 'moodle/contentbank:upload',
                    'label' => 'Upload & author interactive H5P in Content Bank (moodle/contentbank:upload)',
                    'category' => 'Content Bank',
                    'roles' => ['manager', 'coursecreator', 'editingteacher'],
                ],
            ];
            $savedCapJson = get_config('local_outlms_bridge', "category_capabilities_{$categoryId}");
            if ($savedCapJson) {
                $decodedCaps = json_decode($savedCapJson, true);
                if (is_array($decodedCaps) && count($decodedCaps) > 0) {
                    $keyCapabilities = $decodedCaps;
                }
            }

            // Role assignments list
            $raSql = "SELECT ra.id, ra.roleid, ra.userid, ra.contextid, r.shortname as roleshortname, r.name as rolename,
                             u.username, u.firstname, u.lastname, u.email
                      FROM {role_assignments} ra
                      JOIN {role} r ON r.id = ra.roleid
                      JOIN {user} u ON u.id = ra.userid
                      WHERE u.deleted = 0
                      ORDER BY ra.id DESC LIMIT 50";
            $raRows = $DB->get_records_sql($raSql);
            $roleAssignments = [];
            foreach ($raRows as $ra) {
                $roleAssignments[] = [
                    'id' => (int)$ra->id,
                    'roleid' => (int)$ra->roleid,
                    'roleshortname' => $ra->roleshortname,
                    'userid' => (int)$ra->userid,
                    'username' => $ra->username,
                    'fullname' => trim($ra->firstname . ' ' . $ra->lastname),
                    'email' => $ra->email,
                    'contextid' => (int)$ra->contextid,
                ];
            }

            // Seed Competency Frameworks if empty
            if ($DB->count_records('competency_framework') == 0) {
                $now = time();
                $defaultScaleId = (int)$DB->get_field_sql("SELECT id FROM {scale} ORDER BY id ASC LIMIT 1") ?: 1;
                $seedFrameworks = [
                    [
                        'shortname' => 'TCU & OUT National Digital & ICT Competency Framework (NTA Level 7-8)',
                        'idnumber' => 'OUT-CF-ICT-2026',
                        'description' => '<p>Competency framework aligned with Tanzania Commission for Universities (TCU) and OUT IEMT benchmarks for software engineering, AI, and digital literacy.</p>',
                        'taxonomies' => 'domain,competency,indicator,outcome',
                    ],
                    [
                        'shortname' => 'Open Distance & e-Learning (ODeL) Pedagogical Mastery Framework',
                        'idnumber' => 'OUT-CF-ODEL-2026',
                        'description' => '<p>Instructional design, digital assessment, and learner engagement competencies for academic staff and course creators.</p>',
                        'taxonomies' => 'domain,competency,skill,level',
                    ],
                ];
                foreach ($seedFrameworks as $sf) {
                    $cf = new stdClass();
                    $cf->shortname = $sf['shortname'];
                    $cf->contextid = 1;
                    $cf->idnumber = $sf['idnumber'];
                    $cf->description = $sf['description'];
                    $cf->descriptionformat = 1;
                    $cf->scaleid = $defaultScaleId;
                    $cf->scaleconfiguration = json_encode([['scaleid' => (string)$defaultScaleId], ['id' => 1, 'scaledefault' => 1, 'proficient' => 1]]);
                    $cf->visible = 1;
                    $cf->taxonomies = $sf['taxonomies'];
                    $cf->timecreated = $now;
                    $cf->timemodified = $now;
                    $cf->usermodified = 2;
                    try { $DB->insert_record('competency_framework', $cf); } catch (\Throwable $e) {}
                }
            }

            $frameworksRaw = $DB->get_records('competency_framework', null, 'id DESC');
            $competencyFrameworks = [];
            foreach ($frameworksRaw as $fw) {
                $compCnt = $DB->count_records('competency', ['competencyframeworkid' => $fw->id]);
                $competencyFrameworks[] = [
                    'id' => (int)$fw->id,
                    'shortname' => $fw->shortname,
                    'idnumber' => $fw->idnumber,
                    'description' => $fw->description ?: '',
                    'visible' => (int)$fw->visible,
                    'taxonomies' => $fw->taxonomies ?: 'domain,competency,indicator,outcome',
                    'competencies_count' => $compCnt,
                    'timecreated' => date('Y-m-d', $fw->timecreated ?: time()),
                ];
            }

            // Seed Learning Plan Templates if empty
            if ($DB->count_records('competency_template') == 0) {
                $now = time();
                $seedTemplates = [
                    [
                        'shortname' => 'B.Sc. ICT & AI Career Readiness Learning Plan',
                        'description' => '<p>Structured 4-semester competency progression plan for undergraduate ICT and Data Science scholars.</p>',
                        'duedate' => $now + (180 * 86400),
                    ],
                    [
                        'shortname' => 'IEMT Professional Short Course Fast-Track Plan',
                        'description' => '<p>8-week accelerated mastery plan for industry practitioners completing IEMT certificate courses.</p>',
                        'duedate' => $now + (60 * 86400),
                    ],
                ];
                foreach ($seedTemplates as $st) {
                    $tpl = new stdClass();
                    $tpl->shortname = $st['shortname'];
                    $tpl->contextid = 1;
                    $tpl->description = $st['description'];
                    $tpl->descriptionformat = 1;
                    $tpl->visible = 1;
                    $tpl->duedate = $st['duedate'];
                    $tpl->timecreated = $now;
                    $tpl->timemodified = $now;
                    $tpl->usermodified = 2;
                    try { $DB->insert_record('competency_template', $tpl); } catch (\Throwable $e) {}
                }
            }

            $plansRaw = $DB->get_records('competency_template', null, 'id DESC');
            $learningPlans = [];
            foreach ($plansRaw as $lp) {
                $learningPlans[] = [
                    'id' => (int)$lp->id,
                    'shortname' => $lp->shortname,
                    'description' => $lp->description ?: '',
                    'visible' => (int)$lp->visible,
                    'duedate' => $lp->duedate ? date('Y-m-d', $lp->duedate) : '',
                    'timecreated' => date('Y-m-d', $lp->timecreated ?: time()),
                ];
            }

            // Seed Content Bank items if empty
            if ($DB->count_records('contentbank_content') == 0) {
                $now = time();
                $seedCb = [
                    ['name' => 'Interactive Cyber Threat Simulation (H5P Branching Scenario)', 'contenttype' => 'contenttype_h5p', 'configdata' => json_encode(['h5p_library' => 'H5P.BranchingScenario 1.8', 'size_kb' => 1420])],
                    ['name' => 'Python & Machine Learning Interactive Video Quiz (H5P)', 'contenttype' => 'contenttype_h5p', 'configdata' => json_encode(['h5p_library' => 'H5P.InteractiveVideo 1.26', 'size_kb' => 2850])],
                    ['name' => 'Research Methodology Flashcards & Self-Check (H5P Dialogcards)', 'contenttype' => 'contenttype_h5p', 'configdata' => json_encode(['h5p_library' => 'H5P.Dialogcards 1.9', 'size_kb' => 640])],
                ];
                foreach ($seedCb as $cb) {
                    $rec = new stdClass();
                    $rec->name = $cb['name'];
                    $rec->contenttype = $cb['contenttype'];
                    $rec->contextid = 1;
                    $rec->visibility = 1;
                    $rec->instanceid = 0;
                    $rec->configdata = $cb['configdata'];
                    $rec->usercreated = 2;
                    $rec->usermodified = 2;
                    $rec->timecreated = $now;
                    $rec->timemodified = $now;
                    try { $DB->insert_record('contentbank_content', $rec); } catch (\Throwable $e) {}
                }
            }

            $cbRaw = $DB->get_records('contentbank_content', null, 'id DESC');
            $contentBank = [];
            foreach ($cbRaw as $cb) {
                $cfg = $cb->configdata ? (json_decode($cb->configdata, true) ?: []) : [];
                $contentBank[] = [
                    'id' => (int)$cb->id,
                    'name' => $cb->name,
                    'contenttype' => $cb->contenttype ?: 'contenttype_h5p',
                    'library' => $cfg['h5p_library'] ?? 'H5P.InteractiveBook 1.7',
                    'size_kb' => (int)($cfg['size_kb'] ?? 850),
                    'visibility' => (int)$cb->visibility,
                    'timemodified' => date('Y-m-d H:i', $cb->timemodified ?: time()),
                ];
            }

            // Standard Tags
            $defaultTags = ['OUT', 'IEMT', 'MOOC', 'Short Course', 'ICT', 'Business', 'Law', 'Education', 'Science', 'Cybersecurity', 'AI & Data Science'];
            $savedTagsJson = get_config('local_outlms_bridge', 'standard_tags');
            $standardTags = $savedTagsJson ? (json_decode($savedTagsJson, true) ?: $defaultTags) : $defaultTags;

            echo json_encode([
                'success' => true,
                'selected_category_id' => $categoryId,
                'categories' => $categories,
                'courses' => $courses,
                'cohorts' => $cohorts,
                'filters' => $filters,
                'roles' => $roles,
                'capabilities' => $keyCapabilities,
                'role_assignments' => $roleAssignments,
                'competency_frameworks' => $competencyFrameworks,
                'learning_plans' => $learningPlans,
                'content_bank' => $contentBank,
                'standard_tags' => $standardTags,
                'kickstart_templates' => outlms_get_kickstart_templates_catalog(),
            ]);
            break;

        case 'bulk_upload_courses':
            $csvText = trim($input['csv_text'] ?? '');
            $rowsInput = $input['rows'] ?? [];
            $uploadMode = $input['upload_mode'] ?? 'create_or_update'; // create_new, create_all, create_or_update, update_only
            $defaultCategoryId = (int)($input['default_category_id'] ?? 1);
            $defaultFormat = trim($input['default_format'] ?? 'kickstart');
            $defaultVisible = isset($input['default_visible']) ? (int)$input['default_visible'] : 1;
            $delimiter = $input['delimiter'] ?? ',';

            $parsedRows = [];
            if (is_array($rowsInput) && count($rowsInput) > 0) {
                $parsedRows = $rowsInput;
            } elseif ($csvText !== '') {
                $lines = preg_split('/\r\n|\r|\n/', $csvText);
                $headers = [];
                foreach ($lines as $idx => $line) {
                    if (trim($line) === '') continue;
                    $cols = str_getcsv($line, $delimiter);
                    if ($idx === 0) {
                        $headers = array_map(fn($h) => strtolower(trim($h)), $cols);
                        continue;
                    }
                    $rowAssoc = [];
                    foreach ($headers as $hIdx => $hName) {
                        $rowAssoc[$hName] = isset($cols[$hIdx]) ? trim($cols[$hIdx]) : '';
                    }
                    $parsedRows[] = $rowAssoc;
                }
            }

            if (empty($parsedRows)) {
                throw new \InvalidArgumentException("No valid course rows found in CSV payload.");
            }

            $created = 0;
            $updated = 0;
            $skipped = 0;
            $results = [];
            $now = time();

            foreach ($parsedRows as $r) {
                $shortname = trim($r['shortname'] ?? $r['course_code'] ?? '');
                $fullname = trim($r['fullname'] ?? $r['title'] ?? '');
                $catId = (int)($r['category'] ?? $r['category_id'] ?? $defaultCategoryId ?: 1);
                $fmt = trim($r['format'] ?? $defaultFormat ?: 'kickstart');
                $summary = $r['summary'] ?? "<p>{$fullname} — Open University of Tanzania</p>";
                $idnumber = trim($r['idnumber'] ?? $shortname);

                if ($shortname === '' || $fullname === '') {
                    $skipped++;
                    $results[] = ['shortname' => $shortname ?: 'N/A', 'status' => 'skipped', 'reason' => 'Missing shortname or fullname'];
                    continue;
                }

                $existing = $DB->get_record('course', ['shortname' => $shortname]);
                if ($existing) {
                    if ($uploadMode === 'create_new') {
                        $skipped++;
                        $results[] = ['shortname' => $shortname, 'status' => 'skipped', 'reason' => 'Course already exists'];
                        continue;
                    }
                    $existing->fullname = $fullname;
                    $existing->category = $catId;
                    $existing->format = $fmt;
                    $existing->summary = $summary;
                    $existing->idnumber = $idnumber;
                    $existing->timemodified = $now;
                    $DB->update_record('course', $existing);
                    $updated++;
                    $results[] = ['id' => (int)$existing->id, 'shortname' => $shortname, 'fullname' => $fullname, 'status' => 'updated'];
                } else {
                    if ($uploadMode === 'update_only') {
                        $skipped++;
                        $results[] = ['shortname' => $shortname, 'status' => 'skipped', 'reason' => 'Course does not exist for update_only mode'];
                        continue;
                    }
                    $nc = new stdClass();
                    $nc->category = $catId;
                    $nc->sortorder = 10000 + rand(1, 900);
                    $nc->fullname = $fullname;
                    $nc->shortname = $shortname;
                    $nc->idnumber = $idnumber;
                    $nc->summary = $summary;
                    $nc->summaryformat = FORMAT_HTML;
                    $nc->format = $fmt;
                    $nc->showgrades = 1;
                    $nc->newsitems = 5;
                    $nc->startdate = $now;
                    $nc->enddate = $now + (365 * 86400);
                    $nc->visible = $defaultVisible;
                    $nc->enablecompletion = 1;
                    $nc->showactivitydates = 1;
                    $nc->showcompletionconditions = 1;
                    $nc->timecreated = $now;
                    $nc->timemodified = $now;
                    $cid = $DB->insert_record('course', $nc);

                    for ($i = 0; $i <= 4; $i++) {
                        $sec = new stdClass();
                        $sec->course = $cid;
                        $sec->section = $i;
                        $sec->name = $i === 0 ? 'Course Overview & Orientation' : "Module $i: Core Learning Unit $i";
                        $sec->summary = "<p>Academic unit $i for {$fullname}.</p>";
                        $sec->summaryformat = FORMAT_HTML;
                        $sec->sequence = '';
                        $sec->visible = 1;
                        $sec->timemodified = $now;
                        $DB->insert_record('course_sections', $sec);
                    }
                    $enrol = new stdClass();
                    $enrol->enrol = 'manual';
                    $enrol->status = 0;
                    $enrol->courseid = $cid;
                    $enrol->roleid = 5;
                    $enrol->timecreated = $now;
                    $enrol->timemodified = $now;
                    $DB->insert_record('enrol', $enrol);

                    $created++;
                    $results[] = ['id' => (int)$cid, 'shortname' => $shortname, 'fullname' => $fullname, 'status' => 'created'];
                }
            }

            if (!empty($courseId) && isset($input['tuition_fee'])) {
                $newFee = (float)$input['tuition_fee'];
                $enrols = $DB->get_records('enrol', ['courseid' => $courseId]);
                foreach ($enrols as $enr) {
                    if ($enr->enrol === 'fee' || $enr->cost > 0 || count($enrols) === 1) {
                        $DB->set_field('enrol', 'cost', (string)$newFee, ['id' => $enr->id]);
                    }
                }
                if (isset($changed) && is_array($changed)) {
                    $changed[] = 'tuition_fee';
                }
            }

            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');

            echo json_encode([
                'success' => true,
                'created' => $created,
                'updated' => $updated,
                'skipped' => $skipped,
                'results' => $results,
                'message' => "Bulk upload completed: {$created} created, {$updated} updated, {$skipped} skipped.",
            ]);
            break;

        case 'manage_category_permissions':
            $subAction = $input['sub_action'] ?? 'toggle_capability';
            $categoryId = (int)($input['category_id'] ?? 1);

            if ($subAction === 'assign_role') {
                $userId = (int)($input['user_id'] ?? 0);
                $roleShortname = trim($input['role_shortname'] ?? 'coursecreator');
                $role = $DB->get_record('role', ['shortname' => $roleShortname]);
                if (!$role || !$userId) {
                    throw new \InvalidArgumentException("Valid user and role are required.");
                }
                if (!$DB->record_exists('role_assignments', ['roleid' => $role->id, 'contextid' => 1, 'userid' => $userId])) {
                    $ra = new stdClass();
                    $ra->roleid = $role->id;
                    $ra->contextid = 1;
                    $ra->userid = $userId;
                    $ra->timemodified = time();
                    $ra->modifierid = 2;
                    $ra->component = '';
                    $ra->itemid = 0;
                    $ra->sortorder = 0;
                    $DB->insert_record('role_assignments', $ra);
                }
                echo json_encode(['success' => true, 'message' => "Assigned role '{$roleShortname}' to user #{$userId}."]);
                break;
            } elseif ($subAction === 'unassign_role') {
                $raId = (int)($input['assignment_id'] ?? 0);
                if ($raId > 0) {
                    $DB->delete_records('role_assignments', ['id' => $raId]);
                }
                echo json_encode(['success' => true, 'message' => "Role assignment removed."]);
                break;
            } else {
                $capabilities = $input['capabilities'] ?? [];
                if (is_array($capabilities)) {
                    set_config("category_capabilities_{$categoryId}", json_encode($capabilities), 'local_outlms_bridge');
                }
                echo json_encode(['success' => true, 'message' => "Category permissions matrix updated successfully."]);
                break;
            }

        case 'manage_cohorts':
            $subAction = $input['sub_action'] ?? 'create';
            $now = time();
            if ($subAction === 'delete') {
                $cohortId = (int)($input['cohort_id'] ?? 0);
                if ($cohortId > 0) {
                    $DB->delete_records('cohort_members', ['cohortid' => $cohortId]);
                    $DB->delete_records('cohort', ['id' => $cohortId]);
                }
                echo json_encode(['success' => true, 'message' => "Cohort deleted successfully."]);
                break;
            }
            $cohortId = (int)($input['cohort_id'] ?? 0);
            $name = trim($input['name'] ?? '');
            $idnumber = trim($input['idnumber'] ?? '');
            $description = $input['description'] ?? '';
            $visible = isset($input['visible']) ? (int)$input['visible'] : 1;

            if ($name === '') {
                throw new \InvalidArgumentException("Cohort name is required.");
            }

            if ($cohortId > 0 && ($existing = $DB->get_record('cohort', ['id' => $cohortId]))) {
                $existing->name = $name;
                $existing->idnumber = $idnumber;
                $existing->description = $description;
                $existing->visible = $visible;
                $existing->timemodified = $now;
                $DB->update_record('cohort', $existing);
                echo json_encode(['success' => true, 'cohort_id' => $cohortId, 'message' => "Cohort '{$name}' updated."]);
            } else {
                $co = new stdClass();
                $co->contextid = 1;
                $co->name = $name;
                $co->idnumber = $idnumber ?: ('COH-' . strtoupper(substr(md5($name . $now), 0, 6)));
                $co->description = $description;
                $co->descriptionformat = 1;
                $co->visible = $visible;
                $co->component = '';
                $co->timecreated = $now;
                $co->timemodified = $now;
                $newId = $DB->insert_record('cohort', $co);
                echo json_encode(['success' => true, 'cohort_id' => (int)$newId, 'message' => "Cohort '{$name}' created."]);
            }
            break;

        case 'manage_filters':
            $filterName = trim($input['filter'] ?? '');
            $activeState = (int)($input['active'] ?? 1); // 1 = On, -1 = Off, but available, -9999 = Disabled
            if ($filterName === '') {
                throw new \InvalidArgumentException("Filter identifier is required.");
            }
            $existing = $DB->get_record('filter_active', ['filter' => $filterName]);
            if ($existing) {
                $existing->active = $activeState;
                $DB->update_record('filter_active', $existing);
            } else {
                $fa = new stdClass();
                $fa->filter = $filterName;
                $fa->contextid = 1;
                $fa->active = $activeState;
                $fa->sortorder = 10;
                $DB->insert_record('filter_active', $fa);
            }
            echo json_encode([
                'success' => true,
                'filter' => $filterName,
                'active' => $activeState,
                'message' => "Filter '{$filterName}' updated.",
            ]);
            break;

        case 'restore_backup_course':
            $sourceCourseId = (int)($input['source_course_id'] ?? 0);
            $targetCategoryId = (int)($input['target_category_id'] ?? 1);
            $newFullname = trim($input['fullname'] ?? '');
            $newShortname = trim($input['shortname'] ?? '');
            $backupFilename = trim($input['backup_filename'] ?? '');
            $now = time();

            $srcCourse = $sourceCourseId > 1 ? $DB->get_record('course', ['id' => $sourceCourseId]) : null;
            if (!$newFullname) {
                $newFullname = $srcCourse
                    ? ($srcCourse->fullname . ' (Restored Copy)')
                    : ('Restored Course — ' . ($backupFilename ?: date('Y-m-d')));
            }
            if (!$newShortname) {
                $newShortname = ($srcCourse ? $srcCourse->shortname : 'OUT-RESTORE') . '-' . rand(100, 999);
            }
            if ($DB->record_exists('course', ['shortname' => $newShortname])) {
                $newShortname .= '-' . rand(10, 99);
            }

            $rc = new stdClass();
            $rc->category = $targetCategoryId;
            $rc->sortorder = 10000 + rand(1, 900);
            $rc->fullname = $newFullname;
            $rc->shortname = $newShortname;
            $rc->idnumber = $newShortname;
            $rc->summary = $srcCourse ? $srcCourse->summary : "<p>Restored from Moodle backup archive <strong>{$backupFilename}</strong>.</p>";
            $rc->summaryformat = FORMAT_HTML;
            $rc->format = $srcCourse ? $srcCourse->format : 'kickstart';
            $rc->showgrades = 1;
            $rc->newsitems = 5;
            $rc->startdate = $now;
            $rc->enddate = $now + (365 * 86400);
            $rc->visible = 1;
            $rc->enablecompletion = 1;
            $rc->showactivitydates = 1;
            $rc->showcompletionconditions = 1;
            $rc->timecreated = $now;
            $rc->timemodified = $now;
            $restoredCourseId = $DB->insert_record('course', $rc);

            if ($srcCourse) {
                $srcSecs = $DB->get_records('course_sections', ['course' => $srcCourse->id], 'section ASC');
                foreach ($srcSecs as $s) {
                    $ns = new stdClass();
                    $ns->course = $restoredCourseId;
                    $ns->section = $s->section;
                    $ns->name = $s->name;
                    $ns->summary = $s->summary;
                    $ns->summaryformat = $s->summaryformat;
                    $ns->sequence = '';
                    $ns->visible = $s->visible;
                    $ns->timemodified = $now;
                    $DB->insert_record('course_sections', $ns);
                }
            } else {
                for ($i = 0; $i <= 4; $i++) {
                    $ns = new stdClass();
                    $ns->course = $restoredCourseId;
                    $ns->section = $i;
                    $ns->name = $i === 0 ? 'Course Overview & Restored Resources' : "Restored Module $i";
                    $ns->summary = "<p>Restored instructional unit $i from backup archive.</p>";
                    $ns->summaryformat = FORMAT_HTML;
                    $ns->sequence = '';
                    $ns->visible = 1;
                    $ns->timemodified = $now;
                    $DB->insert_record('course_sections', $ns);
                }
            }

            $enrol = new stdClass();
            $enrol->enrol = 'manual';
            $enrol->status = 0;
            $enrol->courseid = $restoredCourseId;
            $enrol->roleid = 5;
            $enrol->timecreated = $now;
            $enrol->timemodified = $now;
            $DB->insert_record('enrol', $enrol);

            if (!empty($courseId) && isset($input['tuition_fee'])) {
                $newFee = (float)$input['tuition_fee'];
                $enrols = $DB->get_records('enrol', ['courseid' => $courseId]);
                foreach ($enrols as $enr) {
                    if ($enr->enrol === 'fee' || $enr->cost > 0 || count($enrols) === 1) {
                        $DB->set_field('enrol', 'cost', (string)$newFee, ['id' => $enr->id]);
                    }
                }
                if (isset($changed) && is_array($changed)) {
                    $changed[] = 'tuition_fee';
                }
            }

            @unlink(sys_get_temp_dir() . '/outlms_public_catalog_cache.json');

            echo json_encode([
                'success' => true,
                'course_id' => (int)$restoredCourseId,
                'fullname' => $newFullname,
                'shortname' => $newShortname,
                'message' => "Course '{$newFullname}' ({$newShortname}) restored into Category #{$targetCategoryId}.",
            ]);
            break;

        case 'manage_learning_plans':
            $subAction = $input['sub_action'] ?? 'create';
            $now = time();
            if ($subAction === 'delete') {
                $planId = (int)($input['plan_id'] ?? 0);
                if ($planId > 0) {
                    $DB->delete_records('competency_template', ['id' => $planId]);
                }
                echo json_encode(['success' => true, 'message' => "Learning plan template deleted."]);
                break;
            }
            $shortname = trim($input['shortname'] ?? '');
            $description = $input['description'] ?? '';
            $visible = isset($input['visible']) ? (int)$input['visible'] : 1;
            $duedateStr = trim($input['duedate'] ?? '');
            $duedate = $duedateStr ? (strtotime($duedateStr) ?: ($now + 90 * 86400)) : ($now + 90 * 86400);

            if ($shortname === '') {
                throw new \InvalidArgumentException("Learning plan template name is required.");
            }
            $tpl = new stdClass();
            $tpl->shortname = $shortname;
            $tpl->contextid = 1;
            $tpl->description = $description;
            $tpl->descriptionformat = 1;
            $tpl->visible = $visible;
            $tpl->duedate = $duedate;
            $tpl->timecreated = $now;
            $tpl->timemodified = $now;
            $tpl->usermodified = 2;
            $newId = $DB->insert_record('competency_template', $tpl);

            echo json_encode([
                'success' => true,
                'plan_id' => (int)$newId,
                'message' => "Learning plan template '{$shortname}' saved.",
            ]);
            break;

        case 'manage_competency_frameworks':
            $subAction = $input['sub_action'] ?? 'create';
            $now = time();
            if ($subAction === 'delete') {
                $fwId = (int)($input['framework_id'] ?? 0);
                if ($fwId > 0) {
                    $DB->delete_records('competency_framework', ['id' => $fwId]);
                }
                echo json_encode(['success' => true, 'message' => "Competency framework deleted."]);
                break;
            }
            $shortname = trim($input['shortname'] ?? '');
            $idnumber = trim($input['idnumber'] ?? '');
            $description = $input['description'] ?? '';
            $taxonomies = trim($input['taxonomies'] ?? 'domain,competency,indicator,outcome');
            $visible = isset($input['visible']) ? (int)$input['visible'] : 1;

            if ($shortname === '') {
                throw new \InvalidArgumentException("Competency framework name is required.");
            }
            if ($idnumber === '') {
                $idnumber = 'OUT-CF-' . strtoupper(substr(md5($shortname . $now), 0, 6));
            }
            $defaultScaleId = (int)$DB->get_field_sql("SELECT id FROM {scale} ORDER BY id ASC LIMIT 1") ?: 1;
            $cf = new stdClass();
            $cf->shortname = $shortname;
            $cf->contextid = 1;
            $cf->idnumber = $idnumber;
            $cf->description = $description;
            $cf->descriptionformat = 1;
            $cf->scaleid = $defaultScaleId;
            $cf->scaleconfiguration = json_encode([['scaleid' => (string)$defaultScaleId], ['id' => 1, 'scaledefault' => 1, 'proficient' => 1]]);
            $cf->visible = $visible;
            $cf->taxonomies = $taxonomies;
            $cf->timecreated = $now;
            $cf->timemodified = $now;
            $cf->usermodified = 2;
            $newId = $DB->insert_record('competency_framework', $cf);

            echo json_encode([
                'success' => true,
                'framework_id' => (int)$newId,
                'message' => "Competency framework '{$shortname}' ({$idnumber}) created.",
            ]);
            break;

        case 'manage_content_bank':
            $subAction = $input['sub_action'] ?? 'create';
            $now = time();
            if ($subAction === 'delete') {
                $cbId = (int)($input['content_id'] ?? 0);
                if ($cbId > 0) {
                    $DB->delete_records('contentbank_content', ['id' => $cbId]);
                }
                echo json_encode(['success' => true, 'message' => "Content bank item deleted."]);
                break;
            }
            $name = trim($input['name'] ?? '');
            $library = trim($input['library'] ?? 'H5P.InteractiveVideo 1.26');
            $sizeKb = (int)($input['size_kb'] ?? 950);
            $visibility = isset($input['visibility']) ? (int)$input['visibility'] : 1;

            if ($name === '') {
                throw new \InvalidArgumentException("Content bank item title is required.");
            }
            $rec = new stdClass();
            $rec->name = $name;
            $rec->contenttype = 'contenttype_h5p';
            $rec->contextid = 1;
            $rec->visibility = $visibility;
            $rec->instanceid = 0;
            $rec->configdata = json_encode(['h5p_library' => $library, 'size_kb' => $sizeKb]);
            $rec->usercreated = 2;
            $rec->usermodified = 2;
            $rec->timecreated = $now;
            $rec->timemodified = $now;
            $newId = $DB->insert_record('contentbank_content', $rec);

            echo json_encode([
                'success' => true,
                'content_id' => (int)$newId,
                'message' => "Interactive H5P package '{$name}' added to Content Bank.",
            ]);
            break;

        case 'manage_standard_tags':
            $tagsInput = $input['tags'] ?? [];
            if (is_string($tagsInput)) {
                $tagsInput = array_values(array_filter(array_map('trim', explode(',', $tagsInput))));
            }
            if (!is_array($tagsInput)) {
                $tagsInput = [];
            }
            set_config('standard_tags', json_encode(array_values(array_unique($tagsInput))), 'local_outlms_bridge');
            echo json_encode([
                'success' => true,
                'standard_tags' => array_values(array_unique($tagsInput)),
                'message' => "Standard tags updated successfully.",
            ]);
            break;


        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => "Unsupported course_studio_api action '{$action}'."]);
            exit(1);
    }
    exit(0);
} catch (\Throwable $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit(1);
}