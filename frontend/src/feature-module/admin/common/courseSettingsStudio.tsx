import React, { useState, useEffect } from 'react';
import {
  adminService,
  CourseDetailFull,
  CourseSectionDetail,
  CourseModuleItem,
  CourseParticipantRecord,
  CourseGradeItemRecord,
  AdminCourseCategory,
} from '../../../core/api/adminService';

interface CourseSettingsStudioProps {
  courseId: number;
  isOpen: boolean;
  onClose: () => void;
  categories: AdminCourseCategory[];
  onNotify: (type: 'success' | 'danger', message: string) => void;
  onCourseUpdated?: () => void;
}

export const CourseSettingsStudio: React.FC<CourseSettingsStudioProps> = ({
  courseId,
  isOpen,
  onClose,
  categories,
  onNotify,
  onCourseUpdated,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [course, setCourse] = useState<CourseDetailFull | null>(null);

  // Active contextual navigation tab
  const [activeTab, setActiveTab] = useState<'settings' | 'sections' | 'participants' | 'grades' | 'more'>('settings');

  // Active accordion section in Settings tab
  const [settingsSection, setSettingsSection] = useState<'general' | 'description' | 'format' | 'appearance' | 'files' | 'completion'>('general');

  // Form state
  const [form, setForm] = useState<{
    fullname: string;
    shortname: string;
    idnumber: string;
    category: number;
    visible: number;
    startdate: string;
    enddate_enabled: boolean;
    enddate: string;
    summary: string;
    format: string;
    hiddensections: number;
    coursedisplay: number;
    lang: string;
    newsitems: number;
    showgrades: number;
    showreports: number;
    showactivitydates: number;
    maxbytes: number;
    enablecompletion: number;
    groupmode: number;
    groupmodeforce: number;
    defaultgroupingid: number;
  }>({
    fullname: '',
    shortname: '',
    idnumber: '',
    category: 1,
    visible: 1,
    startdate: '',
    enddate_enabled: false,
    enddate: '',
    summary: '',
    format: 'topics',
    hiddensections: 0,
    coursedisplay: 0,
    lang: '',
    newsitems: 5,
    showgrades: 1,
    showreports: 0,
    showactivitydates: 1,
    maxbytes: 0,
    enablecompletion: 1,
    groupmode: 0,
    groupmodeforce: 0,
    defaultgroupingid: 0,
  });

  // Participants & Grades lazy loading
  const [participants, setParticipants] = useState<CourseParticipantRecord[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsSsoUrl, setParticipantsSsoUrl] = useState('');

  const [grades, setGrades] = useState<CourseGradeItemRecord[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [gradesSsoUrl, setGradesSsoUrl] = useState('');
  const [gradeSetupSsoUrl, setGradeSetupSsoUrl] = useState('');

  // Course index collapse state for sections
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});

  // Editing section inline state
  const [editingSectionNum, setEditingSectionNum] = useState<number | null>(null);
  const [sectionNewName, setSectionNewName] = useState('');

  // Helper to format timestamp to YYYY-MM-DD
  const tsToDateInput = (timestamp: number): string => {
    if (!timestamp) return '';
    const d = new Date(timestamp * 1000);
    return d.toISOString().split('T')[0];
  };

  // Helper to parse date string back to unix timestamp
  const dateInputToTs = (dateStr: string): number => {
    if (!dateStr) return 0;
    return Math.floor(new Date(dateStr).getTime() / 1000);
  };

  // Load Course Details
  const loadDetails = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const details = await adminService.getCourseDetails(courseId);
      setCourse(details);
      setForm({
        fullname: details.fullname || '',
        shortname: details.shortname || '',
        idnumber: details.idnumber || '',
        category: details.category_id || 1,
        visible: details.visible !== undefined ? details.visible : 1,
        startdate: tsToDateInput(details.startdate),
        enddate_enabled: details.enddate > 0,
        enddate: details.enddate > 0 ? tsToDateInput(details.enddate) : '',
        summary: details.summary || '',
        format: details.format || 'topics',
        hiddensections: details.hiddensections || 0,
        coursedisplay: details.coursedisplay || 0,
        lang: details.lang || '',
        newsitems: details.newsitems !== undefined ? details.newsitems : 5,
        showgrades: details.showgrades !== undefined ? details.showgrades : 1,
        showreports: details.showreports !== undefined ? details.showreports : 0,
        showactivitydates: details.showactivitydates !== undefined ? details.showactivitydates : 1,
        maxbytes: details.maxbytes || 0,
        enablecompletion: details.enablecompletion !== undefined ? details.enablecompletion : 1,
        groupmode: details.groupmode || 0,
        groupmodeforce: details.groupmodeforce || 0,
        defaultgroupingid: details.defaultgroupingid || 0,
      });
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && courseId) {
      loadDetails();
    }
  }, [isOpen, courseId]);

  // Load Participants when tab selected
  const loadParticipantsData = async () => {
    if (!courseId) return;
    setLoadingParticipants(true);
    try {
      const res = await adminService.getCourseParticipants(courseId);
      setParticipants(res.participants || []);
      setParticipantsSsoUrl(res.sso_manage_url || '');
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to load participants');
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Load Grades when tab selected
  const loadGradesData = async () => {
    if (!courseId) return;
    setLoadingGrades(true);
    try {
      const res = await adminService.getCourseGrades(courseId);
      setGrades(res.grade_items || []);
      setGradesSsoUrl(res.sso_grader_report_url || '');
      setGradeSetupSsoUrl(res.sso_grade_setup_url || '');
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to load grade items');
    } finally {
      setLoadingGrades(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'participants' && participants.length === 0) {
      loadParticipantsData();
    } else if (activeTab === 'grades' && grades.length === 0) {
      loadGradesData();
    }
  }, [activeTab]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    setSaving(true);
    try {
      const payload: Partial<CourseDetailFull> = {
        fullname: form.fullname,
        shortname: form.shortname,
        idnumber: form.idnumber,
        category_id: form.category,
        visible: form.visible,
        startdate: dateInputToTs(form.startdate),
        enddate: form.enddate_enabled ? dateInputToTs(form.enddate) : 0,
        summary: form.summary,
        format: form.format,
        hiddensections: form.hiddensections,
        coursedisplay: form.coursedisplay,
        lang: form.lang,
        newsitems: form.newsitems,
        showgrades: form.showgrades,
        showreports: form.showreports,
        showactivitydates: form.showactivitydates,
        maxbytes: form.maxbytes,
        enablecompletion: form.enablecompletion,
        groupmode: form.groupmode,
        groupmodeforce: form.groupmodeforce,
        defaultgroupingid: form.defaultgroupingid,
      };

      await adminService.updateCourseSettings(courseId, payload);
      onNotify('success', `Course settings for "${form.shortname}" updated successfully.`);
      if (onCourseUpdated) onCourseUpdated();
      await loadDetails();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to update course settings');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Course Section Collapse
  const toggleSectionCollapse = (secNum: number) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [secNum]: !prev[secNum],
    }));
  };

  // Manage Section: Rename
  const handleRenameSection = async (secNum: number) => {
    if (!sectionNewName.trim() || !courseId) return;
    try {
      await adminService.manageCourseSection({
        course_id: courseId,
        section: secNum,
        sec_action: 'rename',
        name: sectionNewName.trim(),
      });
      onNotify('success', `Section ${secNum} renamed to "${sectionNewName.trim()}".`);
      setEditingSectionNum(null);
      setSectionNewName('');
      await loadDetails();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to rename section');
    }
  };

  // Manage Section: Toggle Visibility
  const handleToggleSectionVisibility = async (secNum: number) => {
    if (!courseId) return;
    try {
      await adminService.manageCourseSection({
        course_id: courseId,
        section: secNum,
        sec_action: 'toggle_visibility',
      });
      onNotify('success', `Section ${secNum} visibility toggled.`);
      await loadDetails();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to toggle visibility');
    }
  };

  // Purge all caches action
  const handlePurgeCaches = async () => {
    try {
      await adminService.purgeCache();
      onNotify('success', 'Moodle cache successfully purged for this course.');
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to purge caches');
    }
  };

  // Return null if modal closed
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1050 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '94vw' }}>
        <div className="modal-content shadow-2xl border-0 rounded-4 overflow-hidden">
          {/* Modal Header Banner */}
          <div
            className="modal-header text-white px-4 py-3 border-0 d-flex flex-wrap align-items-center justify-content-between"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0369a1 100%)',
            }}
          >
            <div>
              {/* Breadcrumb line */}
              <div className="d-flex align-items-center gap-2 small text-light opacity-75 mb-1">
                <span>OUTLMS</span>
                <span>&gt;</span>
                <span>Dashboard</span>
                <span>&gt;</span>
                <span>My courses</span>
                <span>&gt;</span>
                <span className="text-warning fw-semibold">{course?.category_name || 'Category'}</span>
                <span>&gt;</span>
                <span className="text-white">{course?.shortname || `Course #${courseId}`}</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <h4 className="modal-title fw-bold text-white mb-0">
                  {course?.fullname || 'Course Settings Studio'}
                </h4>
                {course && (
                  <div className="d-flex gap-2">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                      {course.shortname}
                    </span>
                    <span className="badge bg-secondary-subtle text-light border border-secondary-subtle px-2 py-1">
                      ID #{course.id}
                    </span>
                    <span
                      className={`badge ${
                        course.visible ? 'bg-success text-white' : 'bg-warning text-dark'
                      } px-2 py-1`}
                    >
                      {course.visible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
              {course?.sso_links?.course && (
                <a
                  href={course.sso_links.course}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 shadow-sm"
                  title="Direct Zero-Prompt SSO into Course View"
                >
                  <i className="feather-external-link" />
                  <span>Launch Moodle View</span>
                </a>
              )}
              {course?.sso_links?.settings && (
                <a
                  href={course.sso_links.settings}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 shadow-sm"
                  title="Direct Zero-Prompt SSO into /course/edit.php"
                >
                  <i className="feather-edit-3" />
                  <span>Moodle Edit (/edit.php)</span>
                </a>
              )}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary text-white"
                onClick={handlePurgeCaches}
                title="Purge Moodle Caches"
              >
                <i className="feather-refresh-cw me-1" />
                Purge Caches
              </button>
              <button
                type="button"
                className="btn-close btn-close-white ms-2"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
          </div>

          {/* Contextual Tabs Navigation */}
          <div className="bg-light border-bottom px-4 pt-2">
            <ul className="nav nav-tabs border-0 gap-2">
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-2 fw-semibold border-0 rounded-top ${
                    activeTab === 'settings'
                      ? 'bg-white text-primary border-bottom border-primary border-3 active shadow-sm'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  <i className="feather-settings me-1" />
                  Settings
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-2 fw-semibold border-0 rounded-top ${
                    activeTab === 'sections'
                      ? 'bg-white text-primary border-bottom border-primary border-3 active shadow-sm'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('sections')}
                >
                  <i className="feather-layers me-1" />
                  Course Index & Sections ({course?.sections?.length || 0})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-2 fw-semibold border-0 rounded-top ${
                    activeTab === 'participants'
                      ? 'bg-white text-primary border-bottom border-primary border-3 active shadow-sm'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('participants')}
                >
                  <i className="feather-users me-1" />
                  Participants ({course?.participants_count || 0})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-2 fw-semibold border-0 rounded-top ${
                    activeTab === 'grades'
                      ? 'bg-white text-primary border-bottom border-primary border-3 active shadow-sm'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('grades')}
                >
                  <i className="feather-award me-1" />
                  Grades & Assessments ({course?.grade_items_count || 0})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link px-3 py-2 fw-semibold border-0 rounded-top ${
                    activeTab === 'more'
                      ? 'bg-white text-primary border-bottom border-primary border-3 active shadow-sm'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('more')}
                >
                  <i className="feather-more-horizontal me-1" />
                  More & Utilities
                </button>
              </li>
            </ul>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4 bg-light-subtle">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status" />
                <h5 className="text-muted fw-semibold">Loading Moodle course settings & structure...</h5>
                <p className="text-secondary small">Course #{courseId} metadata is synchronizing via headless REST bridge</p>
              </div>
            ) : (
              <>
                {/* 1. SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                      {/* Left: Section Navigation Pill / List */}
                      <div className="col-lg-3 col-md-4">
                        <div className="card shadow-sm border-0 sticky-top" style={{ top: '10px' }}>
                          <div className="card-header bg-white py-3 border-bottom">
                            <h6 className="fw-bold mb-0 text-dark">
                              <i className="feather-sliders text-primary me-2" />
                              Settings Navigation
                            </h6>
                          </div>
                          <div className="list-group list-group-flush small">
                            <button
                              type="button"
                              className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 border-0 ${
                                settingsSection === 'general' ? 'bg-primary-subtle text-primary fw-bold' : ''
                              }`}
                              onClick={() => setSettingsSection('general')}
                            >
                              <span>
                                <i className="feather-info me-2" />
                                General
                              </span>
                              <i className="feather-chevron-right small opacity-50" />
                            </button>
                            <button
                              type="button"
                              className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 border-0 ${
                                settingsSection === 'description' ? 'bg-primary-subtle text-primary fw-bold' : ''
                              }`}
                              onClick={() => setSettingsSection('description')}
                            >
                              <span>
                                <i className="feather-align-left me-2" />
                                Description & Image
                              </span>
                              <i className="feather-chevron-right small opacity-50" />
                            </button>
                            <button
                              type="button"
                              className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 border-0 ${
                                settingsSection === 'format' ? 'bg-primary-subtle text-primary fw-bold' : ''
                              }`}
                              onClick={() => setSettingsSection('format')}
                            >
                              <span>
                                <i className="feather-layout me-2" />
                                Course Format
                              </span>
                              <i className="feather-chevron-right small opacity-50" />
                            </button>
                            <button
                              type="button"
                              className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 border-0 ${
                                settingsSection === 'appearance' ? 'bg-primary-subtle text-primary fw-bold' : ''
                              }`}
                              onClick={() => setSettingsSection('appearance')}
                            >
                              <span>
                                <i className="feather-eye me-2" />
                                Appearance
                              </span>
                              <i className="feather-chevron-right small opacity-50" />
                            </button>
                            <button
                              type="button"
                              className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 border-0 ${
                                settingsSection === 'files' ? 'bg-primary-subtle text-primary fw-bold' : ''
                              }`}
                              onClick={() => setSettingsSection('files')}
                            >
                              <span>
                                <i className="feather-upload-cloud me-2" />
                                Files & Uploads
                              </span>
                              <i className="feather-chevron-right small opacity-50" />
                            </button>
                            <button
                              type="button"
                              className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 border-0 ${
                                settingsSection === 'completion' ? 'bg-primary-subtle text-primary fw-bold' : ''
                              }`}
                              onClick={() => setSettingsSection('completion')}
                            >
                              <span>
                                <i className="feather-check-circle me-2" />
                                Completion & Groups
                              </span>
                              <i className="feather-chevron-right small opacity-50" />
                            </button>
                          </div>
                          <div className="card-footer bg-white p-3 border-top">
                            <button
                              type="submit"
                              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
                              disabled={saving}
                            >
                              {saving ? (
                                <>
                                  <span className="spinner-border spinner-border-sm" />
                                  <span>Saving Settings...</span>
                                </>
                              ) : (
                                <>
                                  <i className="feather-save" />
                                  <span>Save Course Settings</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Active Settings Form Pane */}
                      <div className="col-lg-9 col-md-8">
                        {/* 1.1 General Settings */}
                        {settingsSection === 'general' && (
                          <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white py-3 border-bottom">
                              <h5 className="fw-bold mb-0 text-dark">
                                <i className="feather-info text-primary me-2" />
                                General Course Settings
                              </h5>
                              <p className="text-muted small mb-0 mt-1">
                                Configure the foundational identity, naming, faculty categorization, and enrollment validity window.
                              </p>
                            </div>
                            <div className="card-body p-4">
                              <div className="row g-3">
                                <div className="col-12">
                                  <label className="form-label fw-semibold">
                                    Course Full Name <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={form.fullname}
                                    onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                                    placeholder="e.g. Financial Management & Strategic Planning"
                                  />
                                  <div className="form-text">
                                    The full course name is displayed at the top of each page in the course and in course listings.
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Course Short Name <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={form.shortname}
                                    onChange={(e) => setForm({ ...form, shortname: e.target.value })}
                                    placeholder="e.g. BBA301"
                                  />
                                  <div className="form-text">
                                    Used in navigation breadcrumbs and email notifications (must be unique).
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Course ID Number
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={form.idnumber}
                                    onChange={(e) => setForm({ ...form, idnumber: e.target.value })}
                                    placeholder="e.g. OUT-BBA-301"
                                  />
                                  <div className="form-text">
                                    Official OUT SARIS registration or financial billing code.
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Course Category <span className="text-danger">*</span>
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: parseInt(e.target.value, 10) })}
                                  >
                                    {categories.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.name} (ID: {c.id})
                                      </option>
                                    ))}
                                    {/* Fallback if category not in list */}
                                    {!categories.some((c) => c.id === form.category) && course && (
                                      <option value={course.category_id}>
                                        {course.category_name} (ID: {course.category_id})
                                      </option>
                                    )}
                                  </select>
                                  <div className="form-text">
                                    Determines the faculty or department under which this course appears.
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Course Visibility <span className="text-danger">*</span>
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.visible}
                                    onChange={(e) => setForm({ ...form, visible: parseInt(e.target.value, 10) })}
                                  >
                                    <option value={1}>Show (Available to students & public directory)</option>
                                    <option value={0}>Hide (Restricted to instructors & administrators only)</option>
                                  </select>
                                  <div className="form-text">
                                    Hidden courses do not appear in search or the student course directory.
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Course Start Date
                                  </label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={form.startdate}
                                    onChange={(e) => setForm({ ...form, startdate: e.target.value })}
                                  />
                                  <div className="form-text">
                                    Determines the start of weekly format sections and timeline sorting.
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <div className="d-flex align-items-center justify-content-between mb-1">
                                    <label className="form-label fw-semibold mb-0">Course End Date</label>
                                    <div className="form-check form-switch mb-0">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="enableEndDate"
                                        checked={form.enddate_enabled}
                                        onChange={(e) => setForm({ ...form, enddate_enabled: e.target.checked })}
                                      />
                                      <label className="form-check-label small" htmlFor="enableEndDate">
                                        Enable
                                      </label>
                                    </div>
                                  </div>
                                  <input
                                    type="date"
                                    className="form-control"
                                    disabled={!form.enddate_enabled}
                                    value={form.enddate}
                                    onChange={(e) => setForm({ ...form, enddate: e.target.value })}
                                  />
                                  <div className="form-text">
                                    When reached, the course shifts to the Past courses tab in student dashboards.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 1.2 Description & Image */}
                        {settingsSection === 'description' && (
                          <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white py-3 border-bottom">
                              <h5 className="fw-bold mb-0 text-dark">
                                <i className="feather-align-left text-primary me-2" />
                                Course Description & Media
                              </h5>
                              <p className="text-muted small mb-0 mt-1">
                                Overview syllabus summary, learning goals, and course card banner image.
                              </p>
                            </div>
                            <div className="card-body p-4">
                              <div className="mb-4">
                                <label className="form-label fw-semibold">
                                  Course Summary
                                </label>
                                <textarea
                                  className="form-control"
                                  rows={6}
                                  value={form.summary}
                                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                                  placeholder="Provide an executive course synopsis, prerequisites, and learning objectives..."
                                />
                                <div className="form-text">
                                  HTML formatted description displayed in the course overview, search results, and syllabus overview.
                                </div>
                              </div>

                              <div className="border rounded-3 p-3 bg-white">
                                <h6 className="fw-bold mb-2 text-dark">Course Banner & Card Image</h6>
                                <p className="text-muted small mb-3">
                                  Accepted file types: Image files used on the web (<code>.gif</code>, <code>.jpg</code>, <code>.jpeg</code>, <code>.png</code>, <code>.webp</code>, <code>.svg</code>).
                                </p>
                                <div className="d-flex align-items-center gap-3">
                                  <div
                                    className="bg-light border rounded-3 d-flex align-items-center justify-content-center text-secondary"
                                    style={{ width: '120px', height: '80px' }}
                                  >
                                    <i className="feather-image fs-2" />
                                  </div>
                                  <div>
                                    <div className="fw-semibold text-dark">Default Institutional Brand Graphic</div>
                                    <div className="text-secondary small">
                                      To upload or change the course banner directly in Moodle's file picker repository:
                                    </div>
                                    {course?.sso_links?.settings && (
                                      <a
                                        href={course.sso_links.settings}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary mt-2"
                                      >
                                        <i className="feather-upload me-1" />
                                        Open Moodle File Manager (SSO)
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 1.3 Course Format */}
                        {settingsSection === 'format' && (
                          <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white py-3 border-bottom">
                              <h5 className="fw-bold mb-0 text-dark">
                                <i className="feather-layout text-primary me-2" />
                                Course Format Configuration
                              </h5>
                              <p className="text-muted small mb-0 mt-1">
                                Layout structure for modules, topic progression, and section pagination.
                              </p>
                            </div>
                            <div className="card-body p-4">
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Format Type
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.format}
                                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                                  >
                                    <option value="topics">Topics format (Custom sections)</option>
                                    <option value="weeks">Weekly format (Calendar-based weeks)</option>
                                    <option value="singleactivity">Single activity format (Direct Quiz or SCORM)</option>
                                    <option value="social">Social format (Forum centered)</option>
                                  </select>
                                  <div className="form-text">
                                    Topics format organizes content into numbered sections with custom module groupings.
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Hidden Sections Display
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.hiddensections}
                                    onChange={(e) => setForm({ ...form, hiddensections: parseInt(e.target.value, 10) })}
                                  >
                                    <option value={0}>Hide completely (Invisible to students)</option>
                                    <option value={1}>Show section names only (Collapsed outline)</option>
                                  </select>
                                  <div className="form-text">
                                    Determines whether hidden sections are entirely suppressed or shown as greyed out headers.
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Course Layout
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.coursedisplay}
                                    onChange={(e) => setForm({ ...form, coursedisplay: parseInt(e.target.value, 10) })}
                                  >
                                    <option value={0}>Show all sections on one page</option>
                                    <option value={1}>Show one section per page (Pagination)</option>
                                  </select>
                                  <div className="form-text">
                                    One section per page improves mobile usability and prevents infinite vertical scrolling.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 1.4 Appearance */}
                        {settingsSection === 'appearance' && (
                          <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white py-3 border-bottom">
                              <h5 className="fw-bold mb-0 text-dark">
                                <i className="feather-eye text-primary me-2" />
                                Appearance & Student Visibility
                              </h5>
                              <p className="text-muted small mb-0 mt-1">
                                Configure localized language forcing, announcement items, and gradebook visibility.
                              </p>
                            </div>
                            <div className="card-body p-4">
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Force Language
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.lang}
                                    onChange={(e) => setForm({ ...form, lang: e.target.value })}
                                  >
                                    <option value="">Do not force (User profile default)</option>
                                    <option value="en">English (en)</option>
                                    <option value="sw">Swahili (sw)</option>
                                  </select>
                                  <div className="form-text">
                                    Force UI language strings regardless of student account preference.
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Number of Announcements
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.newsitems}
                                    onChange={(e) => setForm({ ...form, newsitems: parseInt(e.target.value, 10) })}
                                  >
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                      <option key={n} value={n}>
                                        {n} {n === 1 ? 'announcement' : 'announcements'}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="form-text">
                                    Number of recent announcements shown in the course Latest announcements block.
                                  </div>
                                </div>

                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">
                                    Show Gradebook to Students
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.showgrades}
                                    onChange={(e) => setForm({ ...form, showgrades: parseInt(e.target.value, 10) })}
                                  >
                                    <option value={1}>Yes (Students can view their grades)</option>
                                    <option value={0}>No (Grades hidden from student view)</option>
                                  </select>
                                  <div className="form-text">
                                    Allows students to see a list of their grades for this course.
                                  </div>
                                </div>

                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">
                                    Show Activity Reports
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.showreports}
                                    onChange={(e) => setForm({ ...form, showreports: parseInt(e.target.value, 10) })}
                                  >
                                    <option value={1}>Yes (Students can view activity logs)</option>
                                    <option value={0}>No (Recommended for performance)</option>
                                  </select>
                                  <div className="form-text">
                                    Activity reports show detailed logs and submission timestamps.
                                  </div>
                                </div>

                                <div className="col-md-4">
                                  <label className="form-label fw-semibold">
                                    Show Activity Dates
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.showactivitydates}
                                    onChange={(e) => setForm({ ...form, showactivitydates: parseInt(e.target.value, 10) })}
                                  >
                                    <option value={1}>Yes (Show opened / due dates)</option>
                                    <option value={0}>No (Hide dates on course page)</option>
                                  </select>
                                  <div className="form-text">
                                    Displays due dates and activity opened dates beneath module titles.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 1.5 Files & Uploads */}
                        {settingsSection === 'files' && (
                          <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white py-3 border-bottom">
                              <h5 className="fw-bold mb-0 text-dark">
                                <i className="feather-upload-cloud text-primary me-2" />
                                Files and Upload Limits
                              </h5>
                              <p className="text-muted small mb-0 mt-1">
                                Course-level threshold for student submission files, attachments, and quiz uploads.
                              </p>
                            </div>
                            <div className="card-body p-4">
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Maximum Upload Size
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.maxbytes}
                                    onChange={(e) => setForm({ ...form, maxbytes: parseInt(e.target.value, 10) })}
                                  >
                                    <option value={0}>Site upload limit (128 MB)</option>
                                    <option value={104857600}>100 MB</option>
                                    <option value={52428800}>50 MB</option>
                                    <option value={20971520}>20 MB</option>
                                    <option value={10485760}>10 MB</option>
                                    <option value={5242880}>5 MB</option>
                                    <option value={2097152}>2 MB</option>
                                    <option value={1048576}>1 MB</option>
                                    <option value={512000}>500 KB</option>
                                  </select>
                                  <div className="form-text">
                                    Sets the maximum size of files that can be uploaded by students in assignments and forums.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 1.6 Completion & Groups */}
                        {settingsSection === 'completion' && (
                          <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white py-3 border-bottom">
                              <h5 className="fw-bold mb-0 text-dark">
                                <i className="feather-check-circle text-primary me-2" />
                                Completion Tracking & Group Mode
                              </h5>
                              <p className="text-muted small mb-0 mt-1">
                                Activity completion prerequisites, graduation requirements, and cohort partitioning.
                              </p>
                            </div>
                            <div className="card-body p-4">
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Enable Completion Tracking
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.enablecompletion}
                                    onChange={(e) => setForm({ ...form, enablecompletion: parseInt(e.target.value, 10) })}
                                  >
                                    <option value={1}>Yes (Activities can have completion criteria)</option>
                                    <option value={0}>No (Disable tracking across course)</option>
                                  </select>
                                  <div className="form-text">
                                    Required for progress bars, digital badges, and automated certificate issuance.
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Group Mode
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.groupmode}
                                    onChange={(e) => setForm({ ...form, groupmode: parseInt(e.target.value, 10) })}
                                  >
                                    <option value={0}>No groups (All students participate together)</option>
                                    <option value={1}>Separate groups (Students can only see their own group)</option>
                                    <option value={2}>Visible groups (Students work in groups but can view others)</option>
                                  </select>
                                  <div className="form-text">
                                    Cohort division for forum discussions, grading allocations, and assignment submissions.
                                  </div>
                                </div>

                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Force Group Mode
                                  </label>
                                  <select
                                    className="form-select"
                                    value={form.groupmodeforce}
                                    onChange={(e) => setForm({ ...form, groupmodeforce: parseInt(e.target.value, 10) })}
                                  >
                                    <option value={0}>No (Activities can specify their own group mode)</option>
                                    <option value={1}>Yes (Course group mode is forced on all activities)</option>
                                  </select>
                                  <div className="form-text">
                                    When forced, individual activity settings cannot override this mode.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                )}

                {/* 2. SECTIONS & COURSE INDEX TAB */}
                {activeTab === 'sections' && (
                  <div className="row g-4">
                    {/* Left: Collapsible Course Index Tree */}
                    <div className="col-lg-4 col-md-5">
                      <div className="card shadow-sm border-0 sticky-top" style={{ top: '10px' }}>
                        <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                          <h6 className="fw-bold mb-0 text-dark">
                            <i className="feather-list text-primary me-2" />
                            Course Index
                          </h6>
                          <span className="badge bg-primary-subtle text-primary">
                            {course?.sections?.length || 0} Sections
                          </span>
                        </div>
                        <div className="card-body p-0" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
                          <div className="list-group list-group-flush small">
                            {course?.sections?.map((sec) => (
                              <div key={sec.id} className="list-group-item p-3 border-bottom">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                  <div className="d-flex align-items-center gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light p-1 border-0"
                                      onClick={() => toggleSectionCollapse(sec.section)}
                                      title={collapsedSections[sec.section] ? 'Expand section' : 'Collapse section'}
                                    >
                                      <i
                                        className={`feather-chevron-${
                                          collapsedSections[sec.section] ? 'right' : 'down'
                                        } text-muted`}
                                      />
                                    </button>
                                    <a
                                      href={sec.sso_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="fw-bold text-dark text-decoration-none hover-primary"
                                      title="Open section in Moodle (SSO)"
                                    >
                                      {sec.name}
                                    </a>
                                  </div>
                                  <div className="d-flex align-items-center gap-1">
                                    <span
                                      className={`badge ${
                                        sec.visible ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'
                                      } px-2 py-0`}
                                      style={{ fontSize: '10px' }}
                                    >
                                      {sec.visible ? 'Visible' : 'Hidden'}
                                    </span>
                                  </div>
                                </div>

                                {/* Child Modules Outline */}
                                {!collapsedSections[sec.section] && (
                                  <div className="ps-3 border-start ms-2">
                                    {sec.modules && sec.modules.length > 0 ? (
                                      sec.modules.map((m) => (
                                        <div
                                          key={m.id}
                                          className="d-flex align-items-center justify-content-between py-1 px-2 rounded hover-bg-light"
                                        >
                                          <div className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: '75%' }}>
                                            <i
                                              className={`${
                                                m.modname === 'quiz'
                                                  ? 'feather-help-circle text-danger'
                                                  : m.modname === 'forum'
                                                  ? 'feather-message-square text-info'
                                                  : m.modname === 'page'
                                                  ? 'feather-file-text text-primary'
                                                  : m.modname === 'assign'
                                                  ? 'feather-clipboard text-warning'
                                                  : 'feather-box text-secondary'
                                              } small`}
                                            />
                                            <span className="text-secondary small text-truncate" title={m.name}>
                                              {m.name}
                                            </span>
                                          </div>
                                          <div className="d-flex align-items-center gap-1">
                                            <a
                                              href={m.sso_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="badge bg-light text-primary border"
                                              title="Launch Activity SSO"
                                            >
                                              Open
                                            </a>
                                            <a
                                              href={m.sso_edit_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="badge bg-light text-secondary border"
                                              title="Edit Activity in Moodle (SSO)"
                                            >
                                              Edit
                                            </a>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-muted fst-italic py-1 d-block" style={{ fontSize: '11px' }}>
                                        No learning activities in this section
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Detailed Section Management Cards */}
                    <div className="col-lg-8 col-md-7">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h5 className="fw-bold text-dark mb-0">Curriculum Sections & Modules</h5>
                        <div className="text-muted small">
                          All edits persist directly into Moodle 5.x database table <code>mdl_course_sections</code>
                        </div>
                      </div>

                      {course?.sections?.map((sec) => (
                        <div key={sec.id} className="card shadow-sm border-0 mb-3">
                          <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-primary text-white rounded-pill px-2 py-1">
                                Section {sec.section}
                              </span>
                              {editingSectionNum === sec.section ? (
                                <div className="d-flex align-items-center gap-2">
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={sectionNewName}
                                    onChange={(e) => setSectionNewName(e.target.value)}
                                    placeholder={sec.name}
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleRenameSection(sec.section)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => {
                                      setEditingSectionNum(null);
                                      setSectionNewName('');
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <h6 className="fw-bold mb-0 text-dark">{sec.name}</h6>
                              )}
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              {editingSectionNum !== sec.section && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary py-1 px-2"
                                  onClick={() => {
                                    setEditingSectionNum(sec.section);
                                    setSectionNewName(sec.name);
                                  }}
                                  title="Rename Section"
                                >
                                  <i className="feather-edit-2 small me-1" />
                                  Rename
                                </button>
                              )}
                              <button
                                type="button"
                                className={`btn btn-sm ${
                                  sec.visible ? 'btn-outline-warning' : 'btn-outline-success'
                                } py-1 px-2`}
                                onClick={() => handleToggleSectionVisibility(sec.section)}
                                title={sec.visible ? 'Hide section from students' : 'Make section visible to students'}
                              >
                                <i className={`feather-eye${sec.visible ? '-off' : ''} small me-1`} />
                                {sec.visible ? 'Hide' : 'Show'}
                              </button>
                              <a
                                href={sec.sso_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary py-1 px-2"
                                title="Open section page in Moodle"
                              >
                                <i className="feather-external-link small me-1" />
                                Section View
                              </a>
                            </div>
                          </div>

                          <div className="card-body p-3">
                            {sec.summary ? (
                              <div
                                className="text-secondary small mb-3 p-2 bg-light rounded"
                                dangerouslySetInnerHTML={{ __html: sec.summary }}
                              />
                            ) : (
                              <p className="text-muted fst-italic small mb-2">No summary description provided.</p>
                            )}

                            <h6 className="fw-semibold text-secondary small text-uppercase mb-2">
                              Interactive Learning Activities ({sec.modules.length})
                            </h6>
                            {sec.modules.length > 0 ? (
                              <div className="table-responsive">
                                <table className="table table-sm table-hover align-middle mb-0">
                                  <thead className="table-light small">
                                    <tr>
                                      <th>Type</th>
                                      <th>Activity Name</th>
                                      <th>Visibility</th>
                                      <th className="text-end">SSO Launchers</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sec.modules.map((m) => (
                                      <tr key={m.id}>
                                        <td>
                                          <span
                                            className={`badge ${
                                              m.modname === 'quiz'
                                                ? 'bg-danger-subtle text-danger'
                                                : m.modname === 'forum'
                                                ? 'bg-info-subtle text-info'
                                                : m.modname === 'page'
                                                ? 'bg-primary-subtle text-primary'
                                                : 'bg-secondary-subtle text-secondary'
                                            } text-uppercase px-2 py-1`}
                                          >
                                            {m.modname}
                                          </span>
                                        </td>
                                        <td>
                                          <span className="fw-semibold text-dark">{m.name}</span>
                                        </td>
                                        <td>
                                          <span
                                            className={`badge ${
                                              m.visible ? 'bg-success text-white' : 'bg-warning text-dark'
                                            } px-2 py-1`}
                                          >
                                            {m.visible ? 'Visible' : 'Hidden'}
                                          </span>
                                        </td>
                                        <td className="text-end">
                                          <div className="d-flex justify-content-end gap-2">
                                            <a
                                              href={m.sso_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="btn btn-sm btn-outline-primary py-0 px-2 small"
                                              title="Launch student view"
                                            >
                                              <i className="feather-play me-1" />
                                              View
                                            </a>
                                            <a
                                              href={m.sso_edit_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="btn btn-sm btn-outline-secondary py-0 px-2 small"
                                              title="Edit activity settings in Moodle"
                                            >
                                              <i className="feather-sliders me-1" />
                                              Configure
                                            </a>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-3 bg-light rounded text-muted small">
                                No activity modules present in this section.
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. PARTICIPANTS TAB */}
                {activeTab === 'participants' && (
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">
                          <i className="feather-users text-primary me-2" />
                          Enrolled Course Participants
                        </h5>
                        <p className="text-muted small mb-0 mt-1">
                          Live enrolment roster loaded directly from Moodle <code>mdl_user_enrolments</code>
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        {participantsSsoUrl && (
                          <a
                            href={participantsSsoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                            title="Open Moodle Enrolment Manager (/user/index.php)"
                          >
                            <i className="feather-user-plus me-1" />
                            Manage Enrolments (SSO)
                          </a>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-light border"
                          onClick={loadParticipantsData}
                          disabled={loadingParticipants}
                        >
                          <i className="feather-refresh-cw me-1" />
                          Refresh Roster
                        </button>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      {loadingParticipants ? (
                        <div className="text-center py-4">
                          <div className="spinner-border spinner-border-sm text-primary mb-2" />
                          <div className="text-muted small">Loading participants...</div>
                        </div>
                      ) : participants.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover align-middle mb-0">
                            <thead className="table-light small">
                              <tr>
                                <th>Name & Profile</th>
                                <th>Email</th>
                                <th>Assigned Role</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th className="text-end">Moodle Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {participants.map((p) => (
                                <tr key={p.id}>
                                  <td>
                                    <div className="d-flex align-items-center gap-2">
                                      <div
                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                        style={{ width: '34px', height: '34px', fontSize: '13px' }}
                                      >
                                        {p.fullname.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="fw-semibold text-dark">{p.fullname}</div>
                                        <div className="text-secondary small">@{p.username}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="small text-secondary">{p.email}</span>
                                  </td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        p.role.toLowerCase().includes('teacher') || p.role.toLowerCase().includes('instructor')
                                          ? 'bg-warning-subtle text-warning border border-warning'
                                          : p.role.toLowerCase().includes('admin')
                                          ? 'bg-danger-subtle text-danger border border-danger'
                                          : 'bg-primary-subtle text-primary border border-primary'
                                      } px-2 py-1`}
                                    >
                                      {p.role}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="small text-secondary">{p.department}</span>
                                  </td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        p.suspended ? 'bg-danger text-white' : 'bg-success-subtle text-success'
                                      }`}
                                    >
                                      {p.suspended ? 'Suspended' : 'Active'}
                                    </span>
                                  </td>
                                  <td className="text-end">
                                    <a
                                      href={p.sso_profile_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-sm btn-outline-secondary py-1 px-2 small"
                                      title="Open user course profile in Moodle"
                                    >
                                      <i className="feather-external-link me-1" />
                                      Profile
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          No enrolled participants found in this course.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. GRADES TAB */}
                {activeTab === 'grades' && (
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">
                          <i className="feather-award text-primary me-2" />
                          Gradebook & Assessment Items
                        </h5>
                        <p className="text-muted small mb-0 mt-1">
                          Configured assessments and course total metrics from Moodle <code>mdl_grade_items</code>
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        {gradesSsoUrl && (
                          <a
                            href={gradesSsoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                            title="Open Moodle Grader Report (/grade/report/grader/index.php)"
                          >
                            <i className="feather-bar-chart-2 me-1" />
                            Grader Report (SSO)
                          </a>
                        )}
                        {gradeSetupSsoUrl && (
                          <a
                            href={gradeSetupSsoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-secondary"
                            title="Open Gradebook Setup Tree"
                          >
                            <i className="feather-sliders me-1" />
                            Gradebook Setup (SSO)
                          </a>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-light border"
                          onClick={loadGradesData}
                          disabled={loadingGrades}
                        >
                          <i className="feather-refresh-cw me-1" />
                          Refresh
                        </button>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      {loadingGrades ? (
                        <div className="text-center py-4">
                          <div className="spinner-border spinner-border-sm text-primary mb-2" />
                          <div className="text-muted small">Loading grade items...</div>
                        </div>
                      ) : grades.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover align-middle mb-0">
                            <thead className="table-light small">
                              <tr>
                                <th>Assessment Item</th>
                                <th>Item Type</th>
                                <th>Module</th>
                                <th>Max Grade</th>
                                <th>Min Grade</th>
                                <th>Visibility</th>
                                <th>Lock Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {grades.map((gi) => (
                                <tr key={gi.id}>
                                  <td>
                                    <div className="fw-semibold text-dark">{gi.itemname}</div>
                                  </td>
                                  <td>
                                    <span className="badge bg-secondary-subtle text-secondary text-uppercase px-2 py-1">
                                      {gi.itemtype}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="small text-secondary">{gi.itemmodule || 'Course'}</span>
                                  </td>
                                  <td>
                                    <span className="fw-bold text-success">{gi.grademax}</span>
                                  </td>
                                  <td>
                                    <span className="small text-muted">{gi.grademin}</span>
                                  </td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        gi.hidden ? 'bg-warning text-dark' : 'bg-success text-white'
                                      }`}
                                    >
                                      {gi.hidden ? 'Hidden' : 'Visible'}
                                    </span>
                                  </td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        gi.locked ? 'bg-danger text-white' : 'bg-light text-secondary border'
                                      }`}
                                    >
                                      {gi.locked ? 'Locked' : 'Unlocked'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          No assessment grade items defined for this course.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. MORE & UTILITIES TAB */}
                {activeTab === 'more' && (
                  <div className="row g-4">
                    <div className="col-md-6 col-lg-4">
                      <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4 text-center">
                          <div className="rounded-circle bg-primary-subtle text-primary p-3 d-inline-flex mb-3">
                            <i className="feather-download-cloud fs-3" />
                          </div>
                          <h6 className="fw-bold text-dark">Course Backup</h6>
                          <p className="text-muted small">
                            Generate a full Moodle archive (.mbz) including enrolled students, grades, and resources.
                          </p>
                          {course?.sso_links?.backup && (
                            <a
                              href={course.sso_links.backup}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary w-100"
                            >
                              <i className="feather-external-link me-1" />
                              Launch Backup Wizard
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                      <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4 text-center">
                          <div className="rounded-circle bg-success-subtle text-success p-3 d-inline-flex mb-3">
                            <i className="feather-upload-cloud fs-3" />
                          </div>
                          <h6 className="fw-bold text-dark">Course Restore</h6>
                          <p className="text-muted small">
                            Import or restore an existing backup into this course shell or overwrite content.
                          </p>
                          {course?.sso_links?.restore && (
                            <a
                              href={course.sso_links.restore}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-success w-100"
                            >
                              <i className="feather-external-link me-1" />
                              Restore File Manager
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                      <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4 text-center">
                          <div className="rounded-circle bg-warning-subtle text-warning p-3 d-inline-flex mb-3">
                            <i className="feather-rotate-ccw fs-3" />
                          </div>
                          <h6 className="fw-bold text-dark">Reset Course Data</h6>
                          <p className="text-muted small">
                            Wipe previous semester students, quiz submissions, and forum posts for the new academic year.
                          </p>
                          {course?.sso_links?.reset && (
                            <a
                              href={course.sso_links.reset}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-warning w-100"
                            >
                              <i className="feather-external-link me-1" />
                              Launch Reset Tool
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-white border-top px-4 py-3 d-flex align-items-center justify-content-between">
            <div className="text-secondary small">
              <i className="feather-shield text-success me-1" />
              Authenticated as OUT LMS Administrator (Zero-Prompt Moodle SSO Active)
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-light border px-4" onClick={onClose}>
                Close Studio
              </button>
              {activeTab === 'settings' && (
                <button
                  type="button"
                  className="btn btn-primary px-4 d-flex align-items-center gap-2 shadow-sm"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <i className="feather-save" />
                      <span>Save Course Settings</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CourseSettingsStudio;
