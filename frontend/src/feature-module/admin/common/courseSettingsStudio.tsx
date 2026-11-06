import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  adminService,
  CourseDetailFull,
  CourseParticipantRecord,
  CourseGradeItemRecord,
  AdminCourseCategory,
} from '../../../core/api/adminService';

export interface CourseSettingsStudioProps {
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

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<'settings' | 'sections' | 'participants' | 'grades' | 'utilities'>('settings');

  // Sub-section inside Settings tab
  const [settingsSection, setSettingsSection] = useState<'general' | 'description' | 'format' | 'appearance' | 'files'>('general');

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
    maxbytes: 52428800,
    enablecompletion: 1,
  });

  // Participants & Grades
  const [participants, setParticipants] = useState<CourseParticipantRecord[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [grades, setGrades] = useState<CourseGradeItemRecord[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  // Inline Section Management state
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});
  const [editingSectionNum, setEditingSectionNum] = useState<number | null>(null);
  const [sectionNewName, setSectionNewName] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const tsToDateInput = (timestamp: number): string => {
    if (!timestamp) return '';
    const d = new Date(timestamp * 1000);
    return d.toISOString().split('T')[0];
  };

  const dateInputToTs = (dateStr: string): number => {
    if (!dateStr) return 0;
    return Math.floor(new Date(dateStr).getTime() / 1000);
  };

  // Load Course Details
  const loadDetails = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const data = await adminService.getCourseDetails(courseId);
      if (data) {
        setCourse(data);
        setForm({
          fullname: data.fullname || '',
          shortname: data.shortname || '',
          idnumber: data.idnumber || '',
          category: data.category_id || 1,
          visible: data.visible ?? 1,
          startdate: tsToDateInput(data.startdate),
          enddate_enabled: Boolean(data.enddate && data.enddate > 0),
          enddate: tsToDateInput(data.enddate),
          summary: data.summary || '',
          format: data.format || 'topics',
          hiddensections: data.hiddensections ?? 0,
          coursedisplay: data.coursedisplay ?? 0,
          lang: data.lang || '',
          newsitems: data.newsitems ?? 5,
          showgrades: data.showgrades ?? 1,
          showreports: data.showreports ?? 0,
          showactivitydates: data.showactivitydates ?? 1,
          maxbytes: data.maxbytes ?? 52428800,
          enablecompletion: data.enablecompletion ?? 1,
        });
      }
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && courseId) {
      loadDetails();
      setActiveTab('settings');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, isOpen]);

  // Load Participants
  const loadParticipantsData = async () => {
    if (!courseId) return;
    setLoadingParticipants(true);
    try {
      const data = await adminService.getCourseParticipants(courseId);
      setParticipants(data?.participants || []);
    } catch (err) {
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Load Grades
  const loadGradesData = async () => {
    if (!courseId) return;
    setLoadingGrades(true);
    try {
      const data = await adminService.getCourseGrades(courseId);
      setGrades(data?.grade_items || []);
    } catch (err) {
      setGrades([]);
    } finally {
      setLoadingGrades(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'participants' && participants.length === 0) {
      loadParticipantsData();
    } else if (isOpen && activeTab === 'grades' && grades.length === 0) {
      loadGradesData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isOpen]);

  // Save Course Settings
  const handleSubmitSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      };

      await adminService.updateCourseSettings(courseId, payload);
      onNotify('success', `Course settings for "${form.shortname}" successfully updated.`);
      if (onCourseUpdated) onCourseUpdated();
      await loadDetails();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to update course settings');
    } finally {
      setSaving(false);
    }
  };

  // Rename Section
  const handleRenameSection = async (secNum: number) => {
    if (!sectionNewName.trim() || !courseId) return;
    try {
      await adminService.manageCourseSection({
        course_id: courseId,
        section: secNum,
        sec_action: 'rename',
        name: sectionNewName.trim(),
      });
      onNotify('success', `Unit #${secNum} renamed to "${sectionNewName.trim()}".`);
      setEditingSectionNum(null);
      setSectionNewName('');
      await loadDetails();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to rename section');
    }
  };

  // Toggle Section Visibility
  const handleToggleSectionVisibility = async (secNum: number) => {
    if (!courseId) return;
    try {
      await adminService.manageCourseSection({
        course_id: courseId,
        section: secNum,
        sec_action: 'toggle_visibility',
      });
      onNotify('success', `Unit #${secNum} visibility updated.`);
      await loadDetails();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to toggle visibility');
    }
  };

  // Delete Activity Module
  const handleDeleteActivity = async (cmId: number, name: string) => {
    if (!window.confirm(`Remove learning module "${name}"?`)) return;
    try {
      await adminService.deleteActivity(cmId);
      onNotify('success', `Module "${name}" removed.`);
      await loadDetails();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to delete module');
    }
  };

  if (!isOpen) return null;

  const modalMarkup = (
    <div
      className="course-settings-studio-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2050,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflow: 'hidden',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card border-0 shadow-lg rounded-4 overflow-hidden d-flex flex-column"
        style={{
          width: '100%',
          maxWidth: '1180px',
          height: '92vh',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Studio Top Header Banner */}
        <div
          className="px-4 py-3 d-flex flex-wrap align-items-center justify-content-between flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #051426 0%, #0f172a 60%, #013BA6 100%)',
            color: '#ffffff',
          }}
        >
          <div>
            <div className="d-flex align-items-center gap-1.5 small text-light opacity-75 mb-0.5" style={{ fontSize: '11px' }}>
              <span>OUT LMS</span>
              <span>›</span>
              <span>Curriculum Management</span>
              <span>›</span>
              <span className="text-warning fw-semibold">{course?.category_name || 'Department'}</span>
              <span>›</span>
              <span className="text-white">{course?.shortname || `Course #${courseId}`}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <h5 className="fw-bold text-white mb-0" style={{ fontSize: '17px' }}>
                {course?.fullname || 'Course Curriculum Studio'}
              </h5>
              {course && (
                <div className="d-flex gap-1.5 align-items-center">
                  <span className="badge rounded-pill bg-primary px-2.5 py-1" style={{ fontSize: '10.5px' }}>
                    {course.shortname}
                  </span>
                  <span
                    className={`badge rounded-pill px-2.5 py-1 ${
                      course.visible ? 'bg-success text-white' : 'bg-warning text-dark'
                    }`}
                    style={{ fontSize: '10.5px' }}
                  >
                    {course.visible ? 'Published' : 'Draft / Hidden'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
            <button
              type="button"
              className="btn btn-sm btn-outline-light rounded-pill px-3 fw-semibold"
              onClick={loadDetails}
              style={{ fontSize: '11.5px' }}
              title="Refresh course data"
            >
              <i className="feather-refresh-cw me-1" /> Refresh
            </button>
            <button
              type="button"
              className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center p-0 border-0"
              style={{ width: '32px', height: '32px', color: '#0f172a' }}
              onClick={onClose}
              aria-label="Close Studio"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="px-4 pt-2 border-bottom bg-light d-flex gap-2 flex-shrink-0 flex-wrap">
          {[
            { id: 'settings', label: '1. Course Parameters', icon: 'feather-sliders' },
            { id: 'sections', label: `2. Study Units & Lessons (${course?.sections?.length || 0})`, icon: 'feather-layers' },
            { id: 'participants', label: `3. Enrolled Scholars (${course?.participants_count || participants.length || 0})`, icon: 'feather-users' },
            { id: 'grades', label: `4. Assessments & CA Grading (${course?.grade_items_count || grades.length || 0})`, icon: 'feather-award' },
            { id: 'utilities', label: '5. Archive & Tools', icon: 'feather-tool' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`btn btn-sm rounded-top px-3 py-2 fw-semibold border-bottom-0 ${
                  active ? 'bg-white text-primary border shadow-sm' : 'text-secondary'
                }`}
                style={{ fontSize: '12px' }}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <i className={`${tab.icon} me-1.5`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-auto flex-grow-1" style={{ backgroundColor: '#f8fafc' }}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2" role="status" />
              <div className="text-muted small">Loading course curriculum and syllabus data...</div>
            </div>
          ) : (
            <>
              {/* TAB 1: COURSE SETTINGS & PARAMETERS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSubmitSettings}>
                  <div className="row g-3">
                    {/* Left Settings Sub-menu */}
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm rounded-3 p-2 bg-white">
                        <div className="small fw-bold text-muted px-2 py-1 mb-1 text-uppercase" style={{ fontSize: '10.5px' }}>
                          Configuration
                        </div>
                        {[
                          { id: 'general', label: 'General Identity', icon: 'feather-info' },
                          { id: 'description', label: 'Syllabus & Summary', icon: 'feather-align-left' },
                          { id: 'format', label: 'Curriculum Format', icon: 'feather-layout' },
                          { id: 'appearance', label: 'Learner Display', icon: 'feather-eye' },
                          { id: 'files', label: 'Upload Limitations', icon: 'feather-upload-cloud' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSettingsSection(s.id as any)}
                            className={`btn btn-sm text-start w-100 rounded-2 px-2.5 py-1.5 mb-1 d-flex align-items-center justify-content-between ${
                              settingsSection === s.id ? 'btn-primary text-white fw-bold shadow-sm' : 'btn-light text-dark'
                            }`}
                            style={{
                              fontSize: '12px',
                              backgroundColor: settingsSection === s.id ? '#013BA6' : 'transparent',
                              border: 'none',
                            }}
                          >
                            <span>
                              <i className={`${s.icon} me-2`} />
                              {s.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right Settings Form Panes */}
                    <div className="col-md-9">
                      <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                        {settingsSection === 'general' && (
                          <div className="d-flex flex-column gap-3">
                            <h6 className="fw-bold mb-0 text-dark border-bottom pb-2">General Course Identity</h6>
                            <div className="row g-3">
                              <div className="col-12">
                                <label className="form-label small fw-semibold">Course Full Title *</label>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  required
                                  value={form.fullname}
                                  onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small fw-semibold">Course Code (Short Name) *</label>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  required
                                  value={form.shortname}
                                  onChange={(e) => setForm({ ...form, shortname: e.target.value })}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small fw-semibold">SARIS Registration / Billing ID</label>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={form.idnumber}
                                  onChange={(e) => setForm({ ...form, idnumber: e.target.value })}
                                  placeholder="e.g. OUT-CS-202"
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small fw-semibold">Academic Faculty / Department *</label>
                                <select
                                  className="form-select form-select-sm"
                                  value={form.category}
                                  onChange={(e) => setForm({ ...form, category: Number(e.target.value) })}
                                >
                                  {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small fw-semibold">Course Catalogue Visibility</label>
                                <select
                                  className="form-select form-select-sm"
                                  value={form.visible}
                                  onChange={(e) => setForm({ ...form, visible: Number(e.target.value) })}
                                >
                                  <option value={1}>Published & Enrolment Open</option>
                                  <option value={0}>Draft / Restricted to Staff</option>
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small fw-semibold">Commencement Date</label>
                                <input
                                  type="date"
                                  className="form-control form-control-sm"
                                  value={form.startdate}
                                  onChange={(e) => setForm({ ...form, startdate: e.target.value })}
                                />
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                  <label className="form-label small fw-semibold mb-0">Conclusion Date</label>
                                  <div className="form-check form-switch mb-0">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="enableEnddate"
                                      checked={form.enddate_enabled}
                                      onChange={(e) => setForm({ ...form, enddate_enabled: e.target.checked })}
                                    />
                                    <label className="form-check-label small" htmlFor="enableEnddate" style={{ fontSize: '11px' }}>
                                      Set
                                    </label>
                                  </div>
                                </div>
                                <input
                                  type="date"
                                  className="form-control form-control-sm"
                                  disabled={!form.enddate_enabled}
                                  value={form.enddate}
                                  onChange={(e) => setForm({ ...form, enddate: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {settingsSection === 'description' && (
                          <div className="d-flex flex-column gap-3">
                            <h6 className="fw-bold mb-0 text-dark border-bottom pb-2">Course Syllabus & Prospectus</h6>
                            <div>
                              <label className="form-label small fw-semibold">Academic Syllabus Summary</label>
                              <textarea
                                className="form-control form-control-sm"
                                rows={6}
                                value={form.summary}
                                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                                placeholder="Comprehensive outline of unit prerequisites, learning outcomes, and course structure..."
                              />
                            </div>
                          </div>
                        )}

                        {settingsSection === 'format' && (
                          <div className="d-flex flex-column gap-3">
                            <h6 className="fw-bold mb-0 text-dark border-bottom pb-2">Curriculum Format & Delivery</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label small fw-semibold">Curriculum Structure Style</label>
                                <select
                                  className="form-select form-select-sm"
                                  value={form.format}
                                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                                >
                                  <option value="kickstart">Kickstart Course Wizard & Starter Templates (Institutional Default)</option>
                                  <option value="tiles">Tiles Visual Cards Grid</option>
                                  <option value="onetopic">OneTopic Horizontal Tabs</option>
                                  <option value="topcoll">Collapsed Topics Accordion</option>
                                  <option value="topics">Topical / Academic Study Units</option>
                                  <option value="weeks">Weekly Semester Schedule</option>
                                  <option value="singleactivity">Single Modular Activity</option>
                                </select>
                                {form.format === 'kickstart' && (
                                  <div className="form-text text-primary mt-1" style={{ fontSize: '0.78rem' }}>
                                    <i className="feather-info me-1"></i>
                                    Kickstart template wizard enabled: course opens with pre-built institutional templates and student placeholder pages.
                                  </div>
                                )}
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small fw-semibold">Course Layout Mode</label>
                                <select
                                  className="form-select form-select-sm"
                                  value={form.coursedisplay}
                                  onChange={(e) => setForm({ ...form, coursedisplay: Number(e.target.value) })}
                                >
                                  <option value={0}>Show all study units on one page</option>
                                  <option value={1}>Show one study unit per page</option>
                                </select>
                              </div>
                              <div className="col-12 mt-2">
                                <div className="p-3 rounded-3 border bg-light">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                      <div className="fw-bold small text-dark">
                                        <i className="feather-zap text-primary me-1" />
                                        Kickstart Institutional Faculty Starter Blueprints
                                      </div>
                                      <div className="text-muted" style={{ fontSize: '11px' }}>
                                        1-click automated syllabus & module provisioning via <code>format_kickstart_import_template</code>
                                      </div>
                                    </div>
                                    <span className="badge bg-primary-subtle text-primary" style={{ fontSize: '10px' }}>
                                      Moodle 5.3+ Ready
                                    </span>
                                  </div>
                                  <div className="row g-2">
                                    {[
                                      { id: 1, title: 'Undergraduate Degree Programme', badge: '8 Semester Units', desc: 'SARIS QR attendance, continuous assessment rubric & exam prep', color: '#013BA6' },
                                      { id: 2, title: 'Postgraduate & Masters Seminar', badge: '6 Research Gates', desc: 'Literature review, VPL cloud sandbox lab & thesis defense checkpoints', color: '#06b6d4' },
                                      { id: 3, title: 'Short Courses & CPD Micro-Credential', badge: '4 Executive Sprints', desc: 'Self-paced briefings, quiz & TCU/SARIS verifiable CustomCert PDF', color: '#10b981' },
                                      { id: 4, title: 'STEM & Computer Science Lab Course', badge: '6 Engineering Labs', desc: 'Pre-linked CodeRunner unit-test auto-grader & VPL Cloud IDE', color: '#8b5cf6' },
                                    ].map((tpl) => (
                                      <div className="col-md-6" key={tpl.id}>
                                        <div className="p-2 border rounded-2 bg-white d-flex justify-content-between align-items-center gap-2">
                                          <div>
                                            <div className="fw-semibold text-dark" style={{ fontSize: '12px' }}>
                                              {tpl.title}{' '}
                                              <span className="badge bg-light text-dark border ms-1" style={{ fontSize: '10px' }}>
                                                {tpl.badge}
                                              </span>
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '11px' }}>{tpl.desc}</div>
                                          </div>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary text-nowrap"
                                            style={{ fontSize: '11px', padding: '3px 8px' }}
                                            onClick={async () => {
                                              try {
                                                setSaving(true);
                                                const res = await adminService.importKickstartTemplate(courseId, tpl.id);
                                                onNotify('success', res.message || `Applied Kickstart template: ${tpl.title}`);
                                                const refreshed = await adminService.getCourseDetails(courseId);
                                                setCourse(refreshed);
                                                if (onCourseUpdated) onCourseUpdated();
                                              } catch (err: any) {
                                                onNotify('danger', err?.message || 'Failed to apply Kickstart template');
                                              } finally {
                                                setSaving(false);
                                              }
                                            }}
                                          >
                                            Apply Blueprint
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {settingsSection === 'appearance' && (
                          <div className="d-flex flex-column gap-3">
                            <h6 className="fw-bold mb-0 text-dark border-bottom pb-2">Learner Experience & Reports</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <div className="p-3 border rounded-2 bg-light d-flex justify-content-between align-items-center">
                                  <div>
                                    <div className="fw-semibold small">Display Gradebook to Scholars</div>
                                    <div className="text-muted" style={{ fontSize: '11px' }}>Continuous Assessment & Exam Scores</div>
                                  </div>
                                  <div className="form-check form-switch mb-0">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={form.showgrades === 1}
                                      onChange={(e) => setForm({ ...form, showgrades: e.target.checked ? 1 : 0 })}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="p-3 border rounded-2 bg-light d-flex justify-content-between align-items-center">
                                  <div>
                                    <div className="fw-semibold small">Show Activity Participation Logs</div>
                                    <div className="text-muted" style={{ fontSize: '11px' }}>Detailed study report summaries</div>
                                  </div>
                                  <div className="form-check form-switch mb-0">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={form.showreports === 1}
                                      onChange={(e) => setForm({ ...form, showreports: e.target.checked ? 1 : 0 })}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {settingsSection === 'files' && (
                          <div className="d-flex flex-column gap-3">
                            <h6 className="fw-bold mb-0 text-dark border-bottom pb-2">File Upload Quota & Completion</h6>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label small fw-semibold">Maximum File Upload Limit</label>
                                <select
                                  className="form-select form-select-sm"
                                  value={form.maxbytes}
                                  onChange={(e) => setForm({ ...form, maxbytes: Number(e.target.value) })}
                                >
                                  <option value={10485760}>10 MB</option>
                                  <option value={52428800}>50 MB (Recommended)</option>
                                  <option value={104857600}>100 MB</option>
                                  <option value={268435456}>256 MB</option>
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small fw-semibold">Activity Completion Tracking</label>
                                <select
                                  className="form-select form-select-sm"
                                  value={form.enablecompletion}
                                  onChange={(e) => setForm({ ...form, enablecompletion: Number(e.target.value) })}
                                >
                                  <option value={1}>Enabled (Track scholar lesson completion)</option>
                                  <option value={0}>Disabled</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                          <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-sm btn-primary rounded-pill px-4 fw-bold shadow-sm"
                            style={{ backgroundColor: '#013BA6', borderColor: '#013BA6' }}
                          >
                            {saving ? 'Saving...' : 'Save Parameters'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 2: STUDY UNITS & LESSONS */}
              {activeTab === 'sections' && (
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Course Study Units & Learning Modules</h6>
                      <small className="text-muted">
                        Reorder, rename, or toggle visibility of syllabus units and inspect attached quizzes, assignments, and reading materials.
                      </small>
                    </div>
                  </div>

                  {(!course?.sections || course.sections.length === 0) ? (
                    <div className="card border-0 shadow-sm rounded-3 p-4 text-center text-muted">
                      No study units registered yet for this course.
                    </div>
                  ) : (
                    course.sections.map((sec) => {
                      const isCollapsed = collapsedSections[sec.section];
                      return (
                        <div key={sec.id || sec.section} className="card border-0 shadow-sm rounded-3 mb-2 bg-white overflow-hidden">
                          <div className="p-3 bg-light d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-white border rounded-circle p-0 d-inline-flex align-items-center justify-content-center"
                                style={{ width: '26px', height: '26px' }}
                                onClick={() => setCollapsedSections({ ...collapsedSections, [sec.section]: !isCollapsed })}
                              >
                                {isCollapsed ? '+' : '−'}
                              </button>
                              <span className="badge bg-secondary-subtle text-secondary fw-bold" style={{ fontSize: '11px' }}>
                                Unit #{sec.section}
                              </span>
                              {editingSectionNum === sec.section ? (
                                <div className="d-flex align-items-center gap-1">
                                  <input
                                    type="text"
                                    className="form-control form-control-sm py-0"
                                    value={sectionNewName}
                                    onChange={(e) => setSectionNewName(e.target.value)}
                                    placeholder={sec.name || `Unit ${sec.section}`}
                                    style={{ fontSize: '12px' }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-primary py-0 px-2"
                                    onClick={() => handleRenameSection(sec.section)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light py-0 px-2"
                                    onClick={() => setEditingSectionNum(null)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13.5px' }}>
                                  {sec.name || (sec.section === 0 ? 'General Course Introduction' : `Study Unit #${sec.section}`)}
                                </h6>
                              )}
                              <span className="badge rounded-pill bg-light text-muted border" style={{ fontSize: '10.5px' }}>
                                {sec.modules?.length || sec.modules_count || 0} Modules
                              </span>
                            </div>

                            <div className="d-flex align-items-center gap-1">
                              <button
                                type="button"
                                className="btn btn-sm btn-light border rounded-pill px-2 py-0.5"
                                style={{ fontSize: '11px' }}
                                onClick={() => {
                                  setEditingSectionNum(sec.section);
                                  setSectionNewName(sec.name || '');
                                }}
                              >
                                Rename
                              </button>
                              <button
                                type="button"
                                className={`btn btn-sm rounded-pill px-2 py-0.5 ${
                                  sec.visible !== 0 ? 'btn-outline-success' : 'btn-outline-secondary'
                                }`}
                                style={{ fontSize: '11px' }}
                                onClick={() => handleToggleSectionVisibility(sec.section)}
                              >
                                {sec.visible !== 0 ? 'Visible' : 'Hidden'}
                              </button>
                            </div>
                          </div>

                          {!isCollapsed && sec.modules && sec.modules.length > 0 && (
                            <div className="p-3">
                              <div className="table-responsive">
                                <table className="table table-sm align-middle mb-0" style={{ fontSize: '12px' }}>
                                  <thead className="table-light">
                                    <tr>
                                      <th>Activity / Learning Resource</th>
                                      <th>Type</th>
                                      <th>Status</th>
                                      <th className="text-end">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sec.modules.map((m) => (
                                      <tr key={m.id}>
                                        <td className="fw-semibold text-dark">{m.name}</td>
                                        <td>
                                          <span
                                            className="badge rounded-pill text-uppercase"
                                            style={{
                                              fontSize: '10px',
                                              backgroundColor:
                                                m.modname === 'quiz'
                                                  ? '#e0e7ff'
                                                  : m.modname === 'assign'
                                                  ? '#fef3c7'
                                                  : '#E8F4FC',
                                              color:
                                                m.modname === 'quiz'
                                                  ? '#4338ca'
                                                  : m.modname === 'assign'
                                                  ? '#b45309'
                                                  : '#013BA6',
                                            }}
                                          >
                                            {m.modname}
                                          </span>
                                        </td>
                                        <td>
                                          <span className="badge bg-success-subtle text-success" style={{ fontSize: '10px' }}>
                                            Active
                                          </span>
                                        </td>
                                        <td className="text-end">
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-light text-danger p-0 border-0"
                                            onClick={() => handleDeleteActivity(m.id, m.name)}
                                            title="Delete module"
                                          >
                                            <i className="feather-trash-2" style={{ fontSize: 13 }} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 3: ENROLLED SCHOLARS */}
              {activeTab === 'participants' && (
                <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Enrolled Scholars &amp; Faculty Instructors</h6>
                      <small className="text-muted">Roster of candidates actively registered for this course.</small>
                    </div>
                    <button
                      type="button"
                      onClick={loadParticipantsData}
                      disabled={loadingParticipants}
                      className="btn btn-sm btn-light border rounded-pill px-3"
                      style={{ fontSize: '11.5px' }}
                    >
                      {loadingParticipants ? 'Loading...' : 'Refresh Roster'}
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '12.5px' }}>
                      <thead className="table-light">
                        <tr>
                          <th>Participant</th>
                          <th>Role</th>
                          <th>Department / Directorate</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-4 text-muted">
                              {loadingParticipants ? 'Fetching roster...' : 'No enrolled scholars found for this course.'}
                            </td>
                          </tr>
                        ) : (
                          participants.map((p) => (
                            <tr key={p.id}>
                              <td>
                                <div className="fw-bold text-dark">{p.fullname}</div>
                                <span className="text-muted small">@{p.username} • {p.email}</span>
                              </td>
                              <td>
                                <span className="badge bg-primary-subtle text-primary rounded-pill" style={{ fontSize: '10.5px' }}>
                                  {p.role}
                                </span>
                              </td>
                              <td>{p.department || 'General Studies'}</td>
                              <td>
                                <span className="badge bg-success-subtle text-success rounded-pill" style={{ fontSize: '10px' }}>
                                  {p.suspended ? 'Suspended' : 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: ASSESSMENTS & GRADES */}
              {activeTab === 'grades' && (
                <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Continuous Assessment (CA) &amp; Exam Gradebook</h6>
                      <small className="text-muted">Weighting breakdown for course assignments, quizzes, and final evaluations.</small>
                    </div>
                    <button
                      type="button"
                      onClick={loadGradesData}
                      disabled={loadingGrades}
                      className="btn btn-sm btn-light border rounded-pill px-3"
                      style={{ fontSize: '11.5px' }}
                    >
                      {loadingGrades ? 'Loading...' : 'Refresh Assessments'}
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '12.5px' }}>
                      <thead className="table-light">
                        <tr>
                          <th>Evaluation Item</th>
                          <th>Category</th>
                          <th>Max Grade</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-4 text-muted">
                              {loadingGrades ? 'Fetching grade items...' : 'No graded evaluation items configured yet.'}
                            </td>
                          </tr>
                        ) : (
                          grades.map((g) => (
                            <tr key={g.id}>
                              <td className="fw-semibold text-dark">{g.itemname || 'Course Total'}</td>
                              <td>
                                <span className="badge bg-light text-secondary border" style={{ fontSize: '10.5px' }}>
                                  {g.itemtype} {g.itemmodule ? `(${g.itemmodule})` : ''}
                                </span>
                              </td>
                              <td className="fw-bold text-primary font-monospace">{g.grademax} pts</td>
                              <td>
                                <span className="badge bg-success-subtle text-success rounded-pill" style={{ fontSize: '10px' }}>
                                  Active Evaluation
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: UTILITIES & ARCHIVE */}
              {activeTab === 'utilities' && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
                      <h6 className="fw-bold text-dark mb-1">Course Data Reconciliation</h6>
                      <p className="text-muted small mb-3">
                        Purge temporary cache files and reload syllabus structure directly from the database engine.
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await adminService.purgeCache();
                            onNotify('success', 'Course and curriculum cache refreshed successfully.');
                            await loadDetails();
                          } catch (err: any) {
                            onNotify('danger', err.message || 'Failed to refresh cache');
                          }
                        }}
                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                      >
                        Purge &amp; Refresh Course Cache
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
                      <h6 className="fw-bold text-dark mb-1">SARIS Curriculum Export</h6>
                      <p className="text-muted small mb-3">
                        Generate official course structure export for TCU accreditation audits.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onNotify('success', 'Course syllabus definition exported to institutional ledger.');
                        }}
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      >
                        Export Curriculum Definition
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-4 py-2.5 bg-white border-top d-flex align-items-center justify-content-between flex-shrink-0">
          <div className="text-muted small d-flex align-items-center gap-1.5" style={{ fontSize: '11.5px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'inline-block',
              }}
            />
            <span>Institutional Curriculum Management Mode Active</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button type="button" className="btn btn-sm btn-light border rounded-pill px-4" onClick={onClose}>
              Close Studio
            </button>
            {activeTab === 'settings' && (
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-pill px-4 fw-bold shadow-sm"
                style={{ backgroundColor: '#013BA6', borderColor: '#013BA6' }}
                onClick={() => handleSubmitSettings()}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Parameters'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
};

export default CourseSettingsStudio;
