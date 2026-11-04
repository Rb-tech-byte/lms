import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { courseService, PublicCatalogCourse } from '../../../core/api/courseService';
import { adminService } from '../../../core/api/adminService';
import { useAuth } from '../../../core/auth/authContext';

interface DynamicModule {
  id: number;
  instance: number;
  modname: string;
  name: string;
  visible: number;
  completion: number;
}

interface DynamicSection {
  id: number;
  section: number;
  name: string;
  summary: string;
  visible: number;
  modules_count: number;
  modules: DynamicModule[];
}

interface DynamicCourseDetail {
  id: number;
  fullname: string;
  shortname: string;
  idnumber: string;
  category_id: number;
  category_name: string;
  summary: string;
  format: string;
  visible: number;
  startdate: number;
  enddate: number;
  tuitionFee: number;
  priceFormatted: string;
  courseImage: string;
  rating: string;
  reviewsCount: number;
  sections_count: number;
  modules_count: number;
  participants_count: number;
  instructor: {
    id: number;
    fullname: string;
    role: string;
    department: string;
    email: string;
    avatar: string;
    bio: string;
  };
  sections: DynamicSection[];
}

const getModuleMeta = (modname: string) => {
  switch (modname) {
    case 'quiz':
      return { icon: 'isax-clipboard-tick', color: '#dc2626', bg: '#fef2f2', label: 'Quiz Assessment' };
    case 'assign':
      return { icon: 'isax-document-upload', color: '#d97706', bg: '#fffbeb', label: 'Coursework' };
    case 'forum':
      return { icon: 'isax-messages-2', color: '#7c3aed', bg: '#f5f3ff', label: 'Discussion Forum' };
    case 'page':
      return { icon: 'isax-book-1', color: '#0171BB', bg: '#f0f9ff', label: 'Lecture Notes' };
    case 'resource':
      return { icon: 'isax-document-text', color: '#059669', bg: '#ecfdf5', label: 'Study Guide' };
    case 'url':
      return { icon: 'isax-link-21', color: '#2563eb', bg: '#eff6ff', label: 'Resource Link' };
    default:
      return { icon: 'isax-teacher', color: '#475569', bg: '#f8fafc', label: 'Learning Activity' };
  }
};

const CourseDetails: React.FC = () => {
  const routes = all_routes;
  const { user, role } = useAuth();
  const isStaff = role === 'admin' || role === 'instructor';

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = Number(searchParams.get('id') || searchParams.get('course_id') || 8);

  const [courseId, setCourseId] = useState<number>(initialCourseId > 1 ? initialCourseId : 8);
  const [course, setCourse] = useState<DynamicCourseDetail | null>(null);
  const [allCourses, setAllCourses] = useState<PublicCatalogCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'syllabus' | 'overview' | 'lecturer'>('syllabus');
  const [activitySearch, setActivitySearch] = useState<string>('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Staff inline curriculum management modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<DynamicSection | null>(null);
  const [sectionForm, setSectionForm] = useState({ name: '', summary: '', visible: 1 });
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [targetSectionNum, setTargetSectionNum] = useState<number>(1);
  const [moduleForm, setModuleForm] = useState({ modname: 'page', name: '', intro: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const paramId = Number(searchParams.get('id') || searchParams.get('course_id') || 0);
    if (paramId > 1 && paramId !== courseId) {
      setCourseId(paramId);
    }
  }, [searchParams, courseId]);

  const loadCourseData = useCallback(async (targetId: number) => {
    setLoading(true);
    try {
      const [detailData, catalogData] = await Promise.all([
        courseService.getPublicCourseDetails(targetId),
        courseService.getPublicCatalog(),
      ]);
      setCourse(detailData);
      setAllCourses(catalogData.courses || []);

      if (detailData?.sections?.length) {
        const initialExpanded: Record<number, boolean> = {};
        detailData.sections.forEach((s: DynamicSection, i: number) => {
          initialExpanded[s.id] = i < 2;
        });
        setExpandedSections(initialExpanded);
      }
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Unable to load programme details.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourseData(courseId);
  }, [courseId, loadCourseData]);

  const handleSelectCourse = (newId: number) => {
    setCourseId(newId);
    setSearchParams({ id: String(newId) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSection = (secId: number) => {
    setExpandedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      if (editingSection) {
        await adminService.manageCourseSection({
          course_id: course.id,
          section: editingSection.section,
          sec_action: 'update',
          name: sectionForm.name,
          summary: sectionForm.summary,
          visible: sectionForm.visible,
        });
        setFeedback({ type: 'success', message: `Updated syllabus unit "${sectionForm.name}".` });
      } else {
        await adminService.manageCourseSection({
          course_id: course.id,
          sec_action: 'create',
          name: sectionForm.name,
          summary: sectionForm.summary,
        });
        setFeedback({ type: 'success', message: `Added new syllabus unit "${sectionForm.name}".` });
      }
      setShowSectionModal(false);
      setEditingSection(null);
      await loadCourseData(course.id);
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Could not save syllabus unit.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSection = async (sec: DynamicSection) => {
    if (!course || sec.section === 0) return;
    setSubmitting(true);
    try {
      await adminService.manageCourseSection({
        course_id: course.id,
        section: sec.section,
        sec_action: 'delete',
      });
      setFeedback({ type: 'success', message: `Removed unit "${sec.name}".` });
      await loadCourseData(course.id);
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Could not delete unit.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !moduleForm.name.trim()) return;
    setSubmitting(true);
    try {
      await adminService.addActivity({
        course_id: course.id,
        section: targetSectionNum,
        mod_type: (['page', 'quiz', 'assign', 'resource'].includes(moduleForm.modname)
          ? moduleForm.modname
          : 'page') as 'page' | 'quiz' | 'assign' | 'resource',
        name: moduleForm.name.trim(),
        content: moduleForm.content || moduleForm.intro,
      });
      setFeedback({ type: 'success', message: `Added activity "${moduleForm.name}" to Unit ${targetSectionNum}.` });
      setShowModuleModal(false);
      setModuleForm({ modname: 'page', name: '', intro: '', content: '' });
      await loadCourseData(course.id);
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Could not add learning activity.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (cmId: number, modTitle: string) => {
    if (!course) return;
    setSubmitting(true);
    try {
      await adminService.deleteActivity(cmId);
      setFeedback({ type: 'success', message: `Removed activity "${modTitle}".` });
      await loadCourseData(course.id);
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Could not remove activity.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter sections and modules based on activity search and type
  const filteredSections = useMemo(() => {
    if (!course?.sections) return [];
    if (!activitySearch.trim() && activityTypeFilter === 'all') return course.sections;

    const q = activitySearch.toLowerCase().trim();
    return course.sections
      .map((sec) => {
        const matchesSection = sec.name.toLowerCase().includes(q) || (sec.summary && sec.summary.toLowerCase().includes(q));
        const matchedMods = sec.modules.filter((m) => {
          const typeMatch = activityTypeFilter === 'all' || m.modname === activityTypeFilter;
          const searchMatch = !q || m.name.toLowerCase().includes(q);
          return typeMatch && searchMatch;
        });

        if (matchesSection || matchedMods.length > 0) {
          return {
            ...sec,
            modules: matchedMods,
          };
        }
        return null;
      })
      .filter((s): s is DynamicSection => s !== null);
  }, [course, activitySearch, activityTypeFilter]);

  const relatedCourses = allCourses.filter((c) => c.id !== course?.id).slice(0, 4);

  return (
    <div style={{ background: '#f8fafc', minHeight: '85vh', paddingBottom: '70px' }}>
      {/* Compact Dark-Navy Programme Banner Card */}
      <section
        className="py-3.5"
        style={{
          background: 'linear-gradient(135deg, #005B97 0%, #0171BB 55%, #0082D6 100%)',
          borderBottom: '3px solid #FFD200',
        }}
      >
        <div className="container">
          {/* Quick Switcher Bar */}
          {allCourses.length > 1 && (
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="d-flex align-items-center gap-1.5 small" style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                <Link to={routes.home} className="text-decoration-none" style={{ color: '#cbd5e1' }}>
                  Home
                </Link>
                <span>/</span>
                <Link to={routes.courseGrid} className="text-decoration-none" style={{ color: '#cbd5e1' }}>
                  Catalog
                </Link>
                <span>/</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{course?.shortname || 'Course'}</span>
              </div>
              <div className="d-flex align-items-center gap-1 flex-wrap">
                <span className="small me-1" style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                  Programmes:
                </span>
                {allCourses.slice(0, 7).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCourse(c.id)}
                    className="btn btn-sm rounded-pill px-2.5 py-0.5 fw-semibold"
                    style={{
                      fontSize: '0.72rem',
                      background: c.id === course?.id ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                      color: c.id === course?.id ? '#0f172a' : '#e2e8f0',
                      border: 'none',
                    }}
                  >
                    {c.shortname}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading || !course ? (
            <div className="py-4 text-center text-white">
              <div className="spinner-border spinner-border-sm text-warning me-2" role="status" />
              <span className="small">Loading programme curriculum...</span>
            </div>
          ) : (
            <div className="row align-items-center g-3">
              <div className="col-lg-8">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  <span
                    className="badge rounded-pill px-2.5 py-0.5 fw-bold"
                    style={{ background: '#FFD200', color: '#051426', fontSize: '0.72rem' }}
                  >
                    {course.shortname}
                  </span>
                  <Link
                    to={`${routes.courseCategory}?id=${course.category_id}`}
                    className="badge rounded-pill text-decoration-none px-2.5 py-0.5 fw-medium"
                    style={{
                      background: 'rgba(255,255,255,0.14)',
                      color: '#f8fafc',
                      fontSize: '0.72rem',
                    }}
                  >
                    <i className="isax isax-buildings-2 me-1" />
                    {course.category_name}
                  </Link>
                  <span
                    className="badge rounded-pill px-2 py-0.5"
                    style={{ background: 'rgba(16,185,129,0.25)', color: '#6ee7b7', fontSize: '0.7rem' }}
                  >
                    TCU Accredited
                  </span>
                </div>

                <h1 className="fw-bold text-white mb-2" style={{ fontSize: 'clamp(1.3rem, 2.1vw, 1.75rem)' }}>
                  {course.fullname}
                </h1>

                <p className="mb-2.5" style={{ color: '#cbd5e1', fontSize: '0.86rem', maxWidth: 660, lineHeight: 1.5 }}>
                  {course.summary ||
                    'Accredited university programme combining structured study units, interactive assessments, and regional academic support.'}
                </p>

                <div className="d-flex flex-wrap align-items-center gap-3 pt-1">
                  <Link
                    to={`${routes.instructorDetails}?id=${course.instructor.id}`}
                    className="d-flex align-items-center gap-2 text-decoration-none"
                  >
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.fullname}
                      className="rounded-circle border border-2 border-warning"
                      style={{ width: 30, height: 30, objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                      }}
                    />
                    <div>
                      <div className="fw-semibold text-white" style={{ fontSize: '0.8rem', lineHeight: 1.1 }}>
                        {course.instructor.fullname}
                      </div>
                      <small style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{course.instructor.role}</small>
                    </div>
                  </Link>

                  <div className="vr bg-light opacity-25 d-none d-sm-block" />

                  <div className="d-flex align-items-center gap-3 flex-wrap" style={{ color: '#e2e8f0', fontSize: '0.78rem' }}>
                    <span>
                      <i className="isax isax-book-1 text-warning me-1" />
                      <strong>{course.sections.length}</strong> Units
                    </span>
                    <span>
                      <i className="isax isax-Menu-board text-info me-1" />
                      <strong>{course.modules_count}</strong> Activities
                    </span>
                    <span>
                      <i className="isax isax-profile-2user text-success me-1" />
                      <strong>{course.participants_count}</strong> Enrolled
                    </span>
                    <span>
                      <i className="fas fa-star text-warning me-1" />
                      <strong>{course.rating}</strong> ({course.reviewsCount})
                    </span>
                  </div>
                </div>
              </div>

              {/* Compact Hero Tuition Card */}
              <div className="col-lg-4">
                <div
                  className="p-3 rounded-4"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                    <span className="small text-muted" style={{ color: '#cbd5e1', fontSize: '0.74rem' }}>
                      Tuition & Enrollment
                    </span>
                    <span className="badge bg-success-subtle text-success rounded-pill" style={{ fontSize: '0.68rem' }}>
                      Open Intake
                    </span>
                  </div>
                  <div className="d-flex align-items-baseline justify-content-between mb-2.5">
                    <h3 className="fw-bold text-white mb-0" style={{ fontSize: '1.4rem' }}>
                      {course.priceFormatted}
                    </h3>
                    <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Institutional Rate</small>
                  </div>
                  <div className="d-grid gap-1.5">
                    <Link
                      to={`${routes.courseWatch}?courseId=${course.id}`}
                      className="btn btn-warning fw-bold rounded-pill py-1.5"
                      style={{ fontSize: '0.82rem', color: '#0f172a' }}
                    >
                      <i className="isax isax-play-circle me-1" />
                      {user ? 'Open Learning Classroom' : 'Preview Digital Classroom'}
                    </Link>
                    <div className="d-flex gap-1.5">
                      <Link
                        to={`${routes.courseCheckout}?id=${course.id}`}
                        className="btn btn-light btn-sm fw-semibold rounded-pill flex-grow-1 py-1"
                        style={{ fontSize: '0.76rem', color: '#071F38' }}
                      >
                        Enrol Now
                      </Link>
                      <Link
                        to={`${routes.courseCart}?id=${course.id}`}
                        className="btn btn-outline-light btn-sm fw-semibold rounded-pill px-3 py-1"
                        style={{ fontSize: '0.76rem' }}
                      >
                        <i className="isax isax-shopping-cart me-1" />
                        Cart
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-4">
        <div className="container">
          {feedback && (
            <div className={`alert alert-${feedback.type} d-flex align-items-center justify-content-between py-2 px-3 rounded-3 mb-3 small`}>
              <span>{feedback.message}</span>
              <button type="button" className="btn-close btn-sm" onClick={() => setFeedback(null)} />
            </div>
          )}

          {course && (
            <div className="row g-4">
              {/* Left Column: Tabs + Dynamic Syllabus + Overview + Lecturer */}
              <div className="col-lg-8">
                {/* Compact Navigation Pills Bar */}
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 bg-white p-2 rounded-3 shadow-sm border mb-3">
                  <div className="d-flex gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveTab('syllabus')}
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                        activeTab === 'syllabus' ? 'btn-primary' : 'btn-light text-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className="isax isax-book-saved me-1" />
                      Syllabus & Units ({course.sections.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                        activeTab === 'overview' ? 'btn-primary' : 'btn-light text-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className="isax isax-document-text me-1" />
                      Programme Overview
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('lecturer')}
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                        activeTab === 'lecturer' ? 'btn-primary' : 'btn-light text-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className="isax isax-teacher me-1" />
                      Course Coordinator
                    </button>
                  </div>

                  {isStaff && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSection(null);
                        setSectionForm({ name: '', summary: '', visible: 1 });
                        setShowSectionModal(true);
                      }}
                      className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-1 fw-semibold"
                      style={{ fontSize: '0.74rem' }}
                    >
                      <i className="feather-plus me-1" />
                      Add Unit
                    </button>
                  )}
                </div>

                {/* TAB 1: SYLLABUS & LEARNING UNITS */}
                {activeTab === 'syllabus' && (
                  <div>
                    {/* Activity Real-Time Filter & Search */}
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 p-2 bg-white rounded-3 border">
                      <div className="input-group input-group-sm" style={{ maxWidth: 260 }}>
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          <i className="feather-search" style={{ fontSize: 12 }} />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-light border-start-0"
                          placeholder="Search lessons & topics..."
                          value={activitySearch}
                          onChange={(e) => setActivitySearch(e.target.value)}
                          style={{ fontSize: '0.78rem' }}
                        />
                      </div>

                      <div className="d-flex align-items-center gap-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setActivityTypeFilter('all')}
                          className={`btn btn-sm rounded-pill px-2.5 py-0.5 ${
                            activityTypeFilter === 'all' ? 'btn-dark fw-semibold' : 'btn-light text-muted'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityTypeFilter('page')}
                          className={`btn btn-sm rounded-pill px-2.5 py-0.5 ${
                            activityTypeFilter === 'page' ? 'btn-primary fw-semibold' : 'btn-light text-muted'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          Lectures
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityTypeFilter('quiz')}
                          className={`btn btn-sm rounded-pill px-2.5 py-0.5 ${
                            activityTypeFilter === 'quiz' ? 'btn-danger fw-semibold' : 'btn-light text-muted'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          Quizzes
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityTypeFilter('assign')}
                          className={`btn btn-sm rounded-pill px-2.5 py-0.5 ${
                            activityTypeFilter === 'assign' ? 'btn-warning text-dark fw-semibold' : 'btn-light text-muted'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          Assignments
                        </button>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2.5">
                      {filteredSections.map((sec) => {
                        const isOpen = !!expandedSections[sec.id];
                        return (
                          <div
                            key={sec.id}
                            className="card border-0 shadow-sm rounded-3 overflow-hidden"
                            style={{ border: '1px solid #e2e8f0' }}
                          >
                            <div
                              className="card-header bg-white border-0 p-3 d-flex align-items-center justify-content-between"
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleSection(sec.id)}
                            >
                              <div className="d-flex align-items-center gap-2.5">
                                <span
                                  className="rounded-3 d-inline-flex align-items-center justify-content-center fw-bold"
                                  style={{
                                    width: 32,
                                    height: 32,
                                    background: isOpen ? '#071F38' : '#f1f5f9',
                                    color: isOpen ? '#fbbf24' : '#334155',
                                    fontSize: '0.78rem',
                                  }}
                                >
                                  {sec.section === 0 ? '00' : String(sec.section).padStart(2, '0')}
                                </span>
                                <div>
                                  <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.88rem' }}>
                                    {sec.name}
                                  </h6>
                                  <small className="text-muted" style={{ fontSize: '0.74rem' }}>
                                    {sec.modules.length} {sec.modules.length === 1 ? 'activity' : 'activities'}
                                  </small>
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {isStaff && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light rounded-pill px-2 py-0.5 text-primary"
                                      title="Add Activity"
                                      onClick={() => {
                                        setTargetSectionNum(sec.section);
                                        setModuleForm({ modname: 'page', name: '', intro: '', content: '' });
                                        setShowModuleModal(true);
                                      }}
                                    >
                                      <i className="feather-plus" style={{ fontSize: 12 }} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light rounded-pill px-2 py-0.5 text-secondary"
                                      title="Edit Unit"
                                      onClick={() => {
                                        setEditingSection(sec);
                                        setSectionForm({
                                          name: sec.name,
                                          summary: sec.summary,
                                          visible: sec.visible,
                                        });
                                        setShowSectionModal(true);
                                      }}
                                    >
                                      <i className="feather-edit-2" style={{ fontSize: 12 }} />
                                    </button>
                                    {sec.section > 0 && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-light rounded-pill px-2 py-0.5 text-danger"
                                        title="Remove Unit"
                                        onClick={() => handleDeleteSection(sec)}
                                      >
                                        <i className="feather-trash-2" style={{ fontSize: 12 }} />
                                      </button>
                                    )}
                                  </>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light rounded-circle"
                                  onClick={() => toggleSection(sec.id)}
                                >
                                  <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} small`} />
                                </button>
                              </div>
                            </div>

                            {isOpen && (
                              <div className="card-body pt-0 px-3 pb-3 border-top bg-light bg-opacity-50">
                                {sec.summary && (
                                  <p className="text-muted small mt-2 mb-2.5" style={{ fontSize: '0.8rem' }}>
                                    {sec.summary}
                                  </p>
                                )}

                                {sec.modules.length === 0 ? (
                                  <div className="p-2.5 rounded-3 bg-white border d-flex align-items-center justify-content-between">
                                    <span className="text-muted small" style={{ fontSize: '0.76rem' }}>
                                      Study unit materials and guided readings available in classroom.
                                    </span>
                                    <Link
                                      to={`${routes.courseWatch}?courseId=${course.id}`}
                                      className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-0.5"
                                      style={{ fontSize: '0.72rem' }}
                                    >
                                      Open Classroom
                                    </Link>
                                  </div>
                                ) : (
                                  <div className="d-flex flex-column gap-1.5 mt-2">
                                    {sec.modules.map((mod) => {
                                      const meta = getModuleMeta(mod.modname);
                                      return (
                                        <div
                                          key={mod.id}
                                          className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-white border"
                                        >
                                          <div className="d-flex align-items-center gap-2 overflow-hidden">
                                            <span
                                              className="rounded-2 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                                              style={{
                                                width: 28,
                                                height: 28,
                                                background: meta.bg,
                                                color: meta.color,
                                              }}
                                            >
                                              <i className={`isax ${meta.icon}`} style={{ fontSize: 14 }} />
                                            </span>
                                            <div className="overflow-hidden">
                                              <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.82rem' }}>
                                                {mod.name}
                                              </div>
                                              <span
                                                className="badge rounded-pill"
                                                style={{
                                                  background: meta.bg,
                                                  color: meta.color,
                                                  fontSize: '0.64rem',
                                                  fontWeight: 600,
                                                }}
                                              >
                                                {meta.label}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
                                            <Link
                                              to={`${routes.courseWatch}?courseId=${course.id}&cmid=${mod.id}`}
                                              className="btn btn-sm btn-light text-primary fw-semibold rounded-pill px-2.5 py-0.5"
                                              style={{ fontSize: '0.72rem' }}
                                            >
                                              Study <i className="feather-arrow-right ms-1" style={{ fontSize: 11 }} />
                                            </Link>
                                            {isStaff && (
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteModule(mod.id, mod.name)}
                                                className="btn btn-sm btn-light text-danger rounded-circle p-1"
                                                title="Remove Activity"
                                              >
                                                <i className="feather-trash-2" style={{ fontSize: 12 }} />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: PROGRAMME OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="card border-0 shadow-sm rounded-3 p-4 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>About {course.fullname}</h5>
                    <p className="text-muted mb-3.5" style={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
                      {course.summary ||
                        'This accredited Open University of Tanzania programme equips scholars with rigorous theoretical foundations and applied competencies tailored for East African and global enterprises.'}
                    </p>

                    <h6 className="fw-bold text-dark mb-2.5" style={{ fontSize: '0.92rem' }}>Key Programme Outcomes & Competencies</h6>
                    <div className="row g-2.5 mb-3.5">
                      {course.sections.slice(0, 6).map((sec, idx) => (
                        <div className="col-md-6" key={sec.id}>
                          <div className="d-flex align-items-start gap-2 p-2.5 rounded-2 bg-light h-100">
                            <span
                              className="badge rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 22, height: 22, background: '#071F38', color: '#fbbf24', fontSize: '0.7rem' }}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <div className="fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>
                                {sec.name}
                              </div>
                              <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                                {sec.summary || `Master core concepts and practical exercises in ${sec.name}.`}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="row g-2 pt-2 border-top">
                      <div className="col-sm-4">
                        <div className="p-2.5 rounded-2 bg-light text-center">
                          <div className="fw-bold text-primary" style={{ fontSize: '0.84rem' }}>{course.shortname}</div>
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>Programme Code</small>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="p-2.5 rounded-2 bg-light text-center">
                          <div className="fw-bold text-dark" style={{ fontSize: '0.84rem' }}>Blended & ODL</div>
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>Delivery Mode</small>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="p-2.5 rounded-2 bg-light text-center">
                          <div className="fw-bold text-success" style={{ fontSize: '0.84rem' }}>TCU Accredited</div>
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>Quality Assurance</small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: COURSE LECTURER */}
                {activeTab === 'lecturer' && (
                  <div className="card border-0 shadow-sm rounded-3 p-4 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                    <div className="d-sm-flex align-items-center gap-3 mb-3">
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.fullname}
                        className="rounded-3 border"
                        style={{ width: 72, height: 72, objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                        }}
                      />
                      <div>
                        <span className="badge bg-primary-subtle text-primary rounded-pill mb-1" style={{ fontSize: '0.7rem' }}>
                          {course.instructor.role}
                        </span>
                        <h5 className="fw-bold text-dark mb-0.5" style={{ fontSize: '1rem' }}>{course.instructor.fullname}</h5>
                        <p className="text-muted small mb-0" style={{ fontSize: '0.76rem' }}>
                          {course.instructor.department} • {course.category_name}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted small mb-3" style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
                      {course.instructor.bio}
                    </p>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2.5 border-top">
                      <span className="small text-muted" style={{ fontSize: '0.76rem' }}>
                        <i className="isax isax-sms text-primary me-1" />
                        {course.instructor.email}
                      </span>
                      <Link
                        to={`${routes.instructorDetails}?id=${course.instructor.id}`}
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                        style={{ fontSize: '0.74rem' }}
                      >
                        Academic Profile
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Specifications & Related Programmes */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3" style={{ border: '1px solid #e2e8f0' }}>
                  <img
                    src={course.courseImage}
                    alt={course.fullname}
                    className="w-100 rounded-3 mb-3"
                    style={{ height: 155, objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const ownSlug = (course.shortname || `course-${course.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-');
                      const ownThumbnail = `/assets/img/course/thumbnails/course-${course.id}-${ownSlug}.svg`;
                      if (target.src !== ownThumbnail && !target.src.endsWith(ownThumbnail)) {
                        target.src = ownThumbnail;
                      }
                    }}
                  />
                  <h6 className="fw-bold text-dark mb-2.5" style={{ fontSize: '0.88rem' }}>Specifications</h6>
                  <ul className="list-unstyled mb-3 small d-flex flex-column gap-1.5" style={{ fontSize: '0.76rem' }}>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Code</span>
                      <span className="fw-semibold text-dark">{course.shortname}</span>
                    </li>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Faculty</span>
                      <span className="fw-semibold text-dark text-end text-truncate" style={{ maxWidth: 170 }}>
                        {course.category_name}
                      </span>
                    </li>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Study Units</span>
                      <span className="fw-semibold text-dark">{course.sections.length} Units</span>
                    </li>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Activities</span>
                      <span className="fw-semibold text-dark">{course.modules_count} Modules</span>
                    </li>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Enrolled</span>
                      <span className="fw-semibold text-dark">{course.participants_count} Scholars</span>
                    </li>
                    <li className="d-flex justify-content-between py-1">
                      <span className="text-muted">Assessment</span>
                      <span className="fw-semibold text-success">Continuous + Final</span>
                    </li>
                  </ul>

                  <div className="d-grid gap-1.5">
                    <Link
                      to={`${routes.courseCheckout}?id=${course.id}`}
                      className="btn btn-primary rounded-pill fw-semibold py-1.5"
                      style={{ fontSize: '0.82rem' }}
                    >
                      Enrol in {course.shortname} ({course.priceFormatted})
                    </Link>
                    <Link
                      to={`${routes.courseWatch}?courseId=${course.id}`}
                      className="btn btn-outline-secondary rounded-pill fw-semibold py-1.5"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Open Digital Classroom
                    </Link>
                  </div>
                </div>

                {/* Related Programmes List */}
                {relatedCourses.length > 0 && (
                  <div className="card border-0 shadow-sm rounded-3 p-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                    <h6 className="fw-bold text-dark mb-2.5 px-1" style={{ fontSize: '0.86rem' }}>
                      Related Programmes
                    </h6>
                    <div className="d-flex flex-column gap-2">
                      {relatedCourses.map((rc) => (
                        <div
                          key={rc.id}
                          onClick={() => handleSelectCourse(rc.id)}
                          className="d-flex align-items-center gap-2 p-2 rounded-2 border bg-light bg-opacity-50"
                          style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          <img
                            src={rc.courseImage}
                            alt={rc.fullname}
                            className="rounded-2 flex-shrink-0"
                            style={{ width: 50, height: 42, objectFit: 'cover' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const ownSlug = (rc.shortname || `course-${rc.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-');
                              const ownThumbnail = `/assets/img/course/thumbnails/course-${rc.id}-${ownSlug}.svg`;
                              if (target.src !== ownThumbnail && !target.src.endsWith(ownThumbnail)) {
                                target.src = ownThumbnail;
                              }
                            }}
                          />
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex align-items-center justify-content-between mb-0.5">
                              <span className="badge bg-primary-subtle text-primary" style={{ fontSize: '0.64rem' }}>
                                {rc.shortname}
                              </span>
                              <span className="fw-bold text-dark" style={{ fontSize: '0.72rem' }}>
                                {rc.priceFormatted}
                              </span>
                            </div>
                            <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.78rem' }}>
                              {rc.fullname}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Sticky Bottom Enrollment Action Bar */}
      {course && (
        <div
          className="d-lg-none position-fixed bottom-0 start-0 end-0 bg-white border-top shadow-lg p-2.5 px-3 d-flex align-items-center justify-content-between"
          style={{ zIndex: 1040 }}
        >
          <div>
            <span className="text-muted small d-block" style={{ fontSize: '0.7rem' }}>Total Fee</span>
            <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{course.priceFormatted}</span>
          </div>
          <div className="d-flex gap-1.5">
            <Link
              to={`${routes.courseWatch}?courseId=${course.id}`}
              className="btn btn-outline-primary btn-sm rounded-pill fw-semibold px-2.5"
              style={{ fontSize: '0.74rem' }}
            >
              Classroom
            </Link>
            <Link
              to={`${routes.courseCheckout}?id=${course.id}`}
              className="btn btn-primary btn-sm rounded-pill fw-semibold px-3"
              style={{ fontSize: '0.76rem' }}
            >
              Enrol Now
            </Link>
          </div>
        </div>
      )}

      {/* Staff Add/Edit Unit Modal */}
      {showSectionModal && (
        <div className="modal d-block" style={{ background: 'rgba(15,23,42,0.55)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <form onSubmit={handleSaveSection}>
                <div className="modal-header border-0 pb-0">
                  <h6 className="modal-title fw-bold">
                    {editingSection ? `Edit Unit: ${editingSection.name}` : 'Add New Study Unit'}
                  </h6>
                  <button type="button" className="btn-close" onClick={() => setShowSectionModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Unit Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={sectionForm.name}
                      onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                      placeholder="e.g., Unit 4: Distributed Consensus & Replication"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Unit Summary & Objectives</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      value={sectionForm.summary}
                      onChange={(e) => setSectionForm({ ...sectionForm, summary: e.target.value })}
                      placeholder="Key learning objectives and readings covered in this unit..."
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-sm btn-light rounded-pill" onClick={() => setShowSectionModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-sm btn-primary rounded-pill px-4">
                    {submitting ? 'Saving...' : 'Save Unit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Staff Add Learning Activity Modal */}
      {showModuleModal && (
        <div className="modal d-block" style={{ background: 'rgba(15,23,42,0.55)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <form onSubmit={handleAddModule}>
                <div className="modal-header border-0 pb-0">
                  <h6 className="modal-title fw-bold">Add Activity to Unit {targetSectionNum}</h6>
                  <button type="button" className="btn-close" onClick={() => setShowModuleModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Activity Type</label>
                    <select
                      className="form-select form-select-sm"
                      value={moduleForm.modname}
                      onChange={(e) => setModuleForm({ ...moduleForm, modname: e.target.value })}
                    >
                      <option value="page">Lecture Notes / Reading Page</option>
                      <option value="quiz">Assessment Quiz</option>
                      <option value="assign">Coursework Assignment</option>
                      <option value="forum">Discussion Seminar Forum</option>
                      <option value="url">External Academic Resource Link</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Activity Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={moduleForm.name}
                      onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                      placeholder="e.g., Lecture 4.1: Fault Tolerance & Consensus"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Summary / Study Instructions</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      value={moduleForm.intro}
                      onChange={(e) => setModuleForm({ ...moduleForm, intro: e.target.value, content: e.target.value })}
                      placeholder="Instructions or lecture content..."
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-sm btn-light rounded-pill" onClick={() => setShowModuleModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-sm btn-primary rounded-pill px-4">
                    {submitting ? 'Adding...' : 'Add Activity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
