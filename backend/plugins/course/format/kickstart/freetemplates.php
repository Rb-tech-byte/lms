<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Kickstart templates list.
 *
 * @package    format_kickstart
 * @copyright  2021 bdecent gmbh <https://bdecent.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Get the free templates shipped with this plugin.
 *
 * @return array
 */
function format_kickstart_get_default_templates() {
    return [
        '0' => [
            'id' => 0,
            'title' => 'Undergraduate Degree Programme (TCU & SARIS Accredited)',
            'description' => '<p dir="ltr" style="text-align: left;">Standardized 8-module semester syllabus with SARIS rotating QR attendance tracking, continuous assessment assignments, grading rubrics, and final exam readiness.</p>',
            'tags' => ['undergraduate', 'degree', 'saris', 'tcu'],
            'backupfile' => 'course-10-online.mbz',
            'preview_url' => '/course/course-details?id=2',
            'restrictcohort' => 0,
            'cohortids' => [],
            'restrictcategory' => 0,
            'categoryids' => [],
            'includesubcategories' => 0,
            'restrictrole' => 0,
            'roleids' => [],
            'descriptionformat' => 1,
        ],
        '1' => [
            'id' => 1,
            'title' => 'Postgraduate & Masters Seminar (Research & Dissertation)',
            'description' => '<p dir="ltr" style="text-align: left;">Advanced seminar layout featuring literature review forums, research methodology checkpoints, cloud lab workspaces, and thesis defense evaluation gates.</p>',
            'tags' => ['postgraduate', 'masters', 'research', 'seminar'],
            'backupfile' => 'course-10-online.mbz',
            'preview_url' => '/course/course-details?id=3',
            'restrictcohort' => 0,
            'cohortids' => [],
            'restrictcategory' => 0,
            'categoryids' => [],
            'includesubcategories' => 0,
            'restrictrole' => 0,
            'roleids' => [],
            'descriptionformat' => 1,
        ],
        '2' => [
            'id' => 2,
            'title' => 'Short Courses & CPD Micro-Credential (Verifiable Certificate)',
            'description' => '<p dir="ltr" style="text-align: left;">High-velocity executive & professional development blueprint with self-paced video units, competency quizzes, and automated TCU/SARIS QR-verifiable CustomCert PDF issuance.</p>',
            'tags' => ['cpd', 'short-course', 'certificate', 'executive'],
            'backupfile' => 'course-10-online.mbz',
            'preview_url' => '/course/course-details?id=7',
            'restrictcohort' => 0,
            'cohortids' => [],
            'restrictcategory' => 0,
            'categoryids' => [],
            'includesubcategories' => 0,
            'restrictrole' => 0,
            'roleids' => [],
            'descriptionformat' => 1,
        ],
        '3' => [
            'id' => 3,
            'title' => 'STEM & Computer Science Lab Course (CodeRunner & VPL IDE)',
            'description' => '<p dir="ltr" style="text-align: left;">Hands-on engineering and software development curriculum pre-linked with automated CodeRunner unit-test grading questions and browser-based VPL Cloud IDE labs.</p>',
            'tags' => ['stem', 'coding', 'coderunner', 'vpl'],
            'backupfile' => 'course-10-online.mbz',
            'preview_url' => '/course/course-details?id=8',
            'restrictcohort' => 0,
            'cohortids' => [],
            'restrictcategory' => 0,
            'categoryids' => [],
            'includesubcategories' => 0,
            'restrictrole' => 0,
            'roleids' => [],
            'descriptionformat' => 1,
        ],
    ];
}
