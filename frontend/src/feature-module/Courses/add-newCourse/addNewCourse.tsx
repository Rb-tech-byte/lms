import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { all_routes } from '../../router/all_routes';
import { courseService, MoodleCategory } from '../../../core/api/courseService';
import { adminService } from '../../../core/api/adminService';
import { useAuth } from '../../../core/auth/authContext';

const DEFAULT_KICKSTART_TEMPLATES = [
  {
    id: 1,
    code: 'undergraduate_degree',
    title: 'Undergraduate Degree Programme (TCU & SARIS Accredited)',
    short_title: 'Undergraduate Degree',
    badge: '8 Semester Units',
    icon: 'isax-verify',
    accentColor: '#013BA6',
    target_format: 'tiles',
    num_sections: 8,
    description: 'Standardized 8-module university semester syllabus with SARIS rotating QR attendance tracking, continuous assessment assignments, grading rubrics, and final exam readiness.',
    included_capabilities: [
      'SARIS Rotating QR Attendance Register',
      'Continuous Assessment Assignment & Rubric',
      'Interactive Visual Tiles Grid Layout',
      'Milestone Completion Telemetry Bar',
    ],
  },
  {
    id: 2,
    code: 'postgraduate_seminar',
    title: 'Postgraduate & Masters Seminar (Research & Dissertation)',
    short_title: 'Postgraduate & Masters',
    badge: '6 Research Gates',
    icon: 'isax-book-1',
    accentColor: '#06b6d4',
    target_format: 'onetopic',
    num_sections: 6,
    description: 'Advanced postgraduate seminar layout featuring horizontal tabbed research gates, literature review synthesis, VPL cloud data modeling labs, and thesis defense evaluation.',
    included_capabilities: [
      'OneTopic Horizontal Research Gate Tabs',
      'VPL Cloud Data & Statistical Sandbox Lab',
      'Supervisor Checkpoint & Thesis Rubric',
      'SARIS Postgraduate Colloquium Attendance',
    ],
  },
  {
    id: 3,
    code: 'short_course_cpd',
    title: 'Short Courses & CPD Micro-Credential (Verifiable Certificate)',
    short_title: 'Short Course & CPD',
    badge: '4 Executive Sprints',
    icon: 'isax-award',
    accentColor: '#10b981',
    target_format: 'topcoll',
    num_sections: 4,
    description: 'High-velocity executive & professional development blueprint with compact collapsible sprints, competency quizzes, automated retention nudges, and TCU/SARIS QR-verifiable CustomCert PDF issuance.',
    included_capabilities: [
      'TCU & SARIS QR-Verifiable CustomCert PDF',
      'Compact Collapsible Accordion Sprints',
      'Automated 7-Day Study Momentum Nudges',
      'Executive Competency Assessment & XP Badge',
    ],
  },
  {
    id: 4,
    code: 'stem_coding_lab',
    title: 'STEM & Computer Science Lab Course (CodeRunner & VPL IDE)',
    short_title: 'STEM & Coding Lab',
    badge: '6 Engineering Labs',
    icon: 'isax-code-circle',
    accentColor: '#8b5cf6',
    target_format: 'tiles',
    num_sections: 6,
    description: 'Hands-on engineering and software development curriculum pre-linked with automated CodeRunner unit-test grading questions and browser-based VPL Cloud IDE workspaces.',
    included_capabilities: [
      'CodeRunner Automated Unit-Test Grading Engine',
      'Browser-Based VPL Cloud IDE (Python, Node.js, SQL)',
      'Algorithmic Time-Complexity O(n) Benchmarks',
      'Visual Tiles Engineering Lab Launchpad',
    ],
  },
];

const AddNewCourse: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<MoodleCategory[]>([]);
  const [fullname, setFullname] = useState('');
  const [shortname, setShortname] = useState('');
  const [categoryid, setCategoryid] = useState<number>(1);
  const [format, setFormat] = useState('kickstart');
  const [kickstartTemplates, setKickstartTemplates] = useState<any[]>(DEFAULT_KICKSTART_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(1);
  const [numsections, setNumsections] = useState<number>(8);
  const [summary, setSummary] = useState('');
  const [visible, setVisible] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [createdCourseId, setCreatedCourseId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    courseService.getCategories().then((cats) => {
      if (!mounted) return;
      setCategories(cats || []);
      if (cats && cats.length > 0) {
        setCategoryid(cats[0].id);
      }
    });
    adminService
      .getKickstartTemplates()
      .then((res) => {
        if (!mounted) return;
        if (res && Array.isArray(res.templates) && res.templates.length > 0) {
          setKickstartTemplates(res.templates);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectTemplate = (tpl: any) => {
    setSelectedTemplateId(Number(tpl.id));
    setFormat('kickstart');
    if (tpl.num_sections) {
      setNumsections(Number(tpl.num_sections));
    }
    if (!summary.trim() && tpl.description) {
      setSummary(tpl.description);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!fullname.trim() || !shortname.trim()) {
      setFeedback({ type: 'danger', text: 'Course full title and course code (short name) are required.' });
      return;
    }
    setSubmitting(true);
    try {
      const res: any = await adminService.createCourse({
        fullname: fullname.trim(),
        shortname: shortname.trim().toUpperCase(),
        category_id: categoryid,
        summary: summary.trim(),
        format,
        kickstart_template_id: format === 'kickstart' ? selectedTemplateId : undefined,
        num_sections: numsections,
      });
      if (res && (res.status === 'success' || res.success || res.course_id || res.courseid || res.id)) {
        const cid = Number(res.course_id || res.courseid || res.id || 0);
        setCreatedCourseId(cid);
        setFeedback({
          type: 'success',
          text:
            res.message ||
            `Course "${fullname}" (${shortname.toUpperCase()}) created in Moodle (ID #${cid}) with Kickstart starter blueprint.`,
        });
      } else {
        setFeedback({
          type: 'danger',
          text: res?.message || 'Unable to create course in Moodle. Check your role permissions.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'danger',
        text: err?.message || 'Error communicating with Moodle course creation service.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Create New Academic Course" />
      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="add-course-item card border-0 shadow-sm p-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 border-bottom pb-3 mb-4">
                  <div>
                    <h4 className="mb-1 fw-bold">Create Official OUT Moodle Course</h4>
                    <p className="text-muted small mb-0">
                      Signed in as <strong>{user?.name || 'Academic Staff'}</strong> ({user?.role || 'instructor'})
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <Link
                      to={
                        user?.role === 'admin'
                          ? all_routes.adminDashboard
                          : all_routes.instructorDashboard
                      }
                      className="btn btn-outline-secondary btn-sm"
                    >
                      <i className="isax isax-arrow-left-2 me-1" />
                      Back to Console
                    </Link>
                  </div>
                </div>

                {feedback && (
                  <div className={`alert alert-${feedback.type} d-flex justify-content-between align-items-center`}>
                    <span>{feedback.text}</span>
                    {createdCourseId ? (
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`${all_routes.courseDetails}?id=${createdCourseId}`)}
                          className="btn btn-sm btn-primary"
                        >
                          View Course Page
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`${all_routes.courseWatch}?id=${createdCourseId}`)}
                          className="btn btn-sm btn-dark"
                        >
                          Open Classroom
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">
                        Course Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Bachelor of Science in ICT — Distributed Systems"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Course Code (Short Name) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., OIT-304"
                        value={shortname}
                        onChange={(e) => setShortname(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Academic Faculty / Category</label>
                      <select
                        className="form-select"
                        value={categoryid}
                        onChange={(e) => setCategoryid(Number(e.target.value))}
                      >
                        {categories.length === 0 ? (
                          <option value={1}>General Academic Programmes</option>
                        ) : (
                          categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} ({cat.coursecount} courses)
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Moodle Course Format</label>
                      <select
                        className="form-select"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                      >
                        <option value="kickstart">🚀 Kickstart Course Wizard & Templates (Institutional Default)</option>
                        <option value="tiles">🎨 Tiles Visual Cards Grid</option>
                        <option value="onetopic">📑 OneTopic Horizontal Tabs</option>
                        <option value="topcoll">📂 Collapsed Topics Accordion</option>
                        <option value="topics">Custom Sections / Topics Format</option>
                        <option value="weeks">Weekly Academic Schedule Format</option>
                        <option value="singleactivity">Single Activity Assessment Format</option>
                      </select>
                      {format === 'kickstart' && (
                        <div className="form-text text-primary mt-1" style={{ fontSize: '0.8rem' }}>
                          <i className="feather-info me-1"></i>
                          Institutional default: automatically provisions your selected faculty starter template upon creation.
                        </div>
                      )}
                    </div>

                    <div className="col-md-2">
                      <label className="form-label fw-semibold">Modules / Weeks</label>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        className="form-control"
                        value={numsections}
                        onChange={(e) => setNumsections(Number(e.target.value))}
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label fw-semibold">Visibility</label>
                      <select
                        className="form-select"
                        value={visible}
                        onChange={(e) => setVisible(Number(e.target.value))}
                      >
                        <option value={1}>Published</option>
                        <option value={0}>Hidden Draft</option>
                      </select>
                    </div>

                    {format === 'kickstart' && (
                      <div className="col-12">
                        <div className="p-3 rounded-3 border bg-light">
                          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                            <div>
                              <h6 className="fw-bold mb-0 text-dark">
                                <i className="isax isax-magicpen text-primary me-1" />
                                Select Kickstart Institutional Faculty Starter Blueprint
                              </h6>
                              <small className="text-muted">
                                Automatically provisions accredited syllabus units, SARIS QR attendance, VPL Cloud IDE labs, and verifiable CustomCert credentials.
                              </small>
                            </div>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                              4 Accredited Starters Ready
                            </span>
                          </div>
                          <div className="row g-2 mt-1">
                            {kickstartTemplates.map((tpl: any) => {
                              const isSelected = Number(selectedTemplateId) === Number(tpl.id);
                              return (
                                <div className="col-md-6" key={tpl.id}>
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleSelectTemplate(tpl)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') handleSelectTemplate(tpl);
                                    }}
                                    className={`p-3 rounded-3 border bg-white h-100 transition-all ${
                                      isSelected ? 'border-primary shadow-sm' : 'border-secondary-subtle'
                                    }`}
                                    style={{
                                      cursor: 'pointer',
                                      borderLeftWidth: isSelected ? '4px' : '1px',
                                      borderLeftColor: isSelected ? tpl.accentColor || '#013BA6' : undefined,
                                    }}
                                  >
                                    <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                                      <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                                        {isSelected && <i className="feather-check-circle text-primary me-1" />}
                                        {tpl.title}
                                      </div>
                                      <span
                                        className="badge"
                                        style={{
                                          backgroundColor: `${tpl.accentColor || '#013BA6'}18`,
                                          color: tpl.accentColor || '#013BA6',
                                          fontSize: '0.72rem',
                                        }}
                                      >
                                        {tpl.badge || `${tpl.num_sections} Units`}
                                      </span>
                                    </div>
                                    <p className="text-muted mb-2" style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
                                      {tpl.description}
                                    </p>
                                    {Array.isArray(tpl.included_capabilities) && (
                                      <div className="d-flex flex-wrap gap-1">
                                        {tpl.included_capabilities.map((cap: string, idx: number) => (
                                          <span
                                            key={idx}
                                            className="badge bg-light text-secondary border"
                                            style={{ fontSize: '0.68rem', fontWeight: 500 }}
                                          >
                                            ✓ {cap}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="col-12">
                      <label className="form-label fw-semibold">Course Syllabus & Overview</label>
                      <textarea
                        rows={5}
                        className="form-control"
                        placeholder="Describe learning outcomes, assessment structure, and reading requirements..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                      />
                    </div>

                    <div className="col-12 d-flex justify-content-end gap-2 pt-3 border-top">
                      <Link to={all_routes.courseGrid} className="btn btn-light border">
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary px-4"
                      >
                        {submitting ? 'Provisioning in Moodle...' : 'Create Moodle Course'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewCourse;
