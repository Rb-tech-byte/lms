import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';
import { courseService, PublicInstructor, PublicCatalogCourse } from '../../../../core/api/courseService';
import { callInternalApi } from '../../../../core/api/apiClient';

const PAGE_SIZE = 6;

const InstructorGrid: React.FC = () => {
  const route = all_routes;
  const [instructors, setInstructors] = useState<PublicInstructor[]>([]);
  const [allCourses, setAllCourses] = useState<PublicCatalogCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Visiting Lecturer Application Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    name: '',
    email: '',
    department: 'Faculty of Science, Technology & Environmental Studies',
    qualification: 'Ph.D. in Computer Science / Related Discipline',
  });
  const [applying, setApplying] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadFaculty = async () => {
      setLoading(true);
      try {
        const [instList, catalog] = await Promise.all([
          courseService.getPublicInstructors(),
          courseService.getPublicCatalog(),
        ]);
        if (!mounted) return;
        setInstructors(instList || []);
        setAllCourses(catalog.courses || []);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadFaculty();
    return () => {
      mounted = false;
    };
  }, []);

  // Reset page when search or department changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedDepartment]);

  const departments = useMemo(() => {
    return Array.from(
      new Set(instructors.map((i) => i.faculty || i.department).filter(Boolean))
    );
  }, [instructors]);

  const filtered = useMemo(() => {
    return instructors.filter((inst) => {
      if (
        selectedDepartment !== 'all' &&
        inst.faculty !== selectedDepartment &&
        inst.department !== selectedDepartment
      ) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        inst.fullname.toLowerCase().includes(q) ||
        inst.department.toLowerCase().includes(q) ||
        inst.role.toLowerCase().includes(q) ||
        inst.email.toLowerCase().includes(q) ||
        (inst.skills || []).some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [instructors, selectedDepartment, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedInstructors = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setApplyFeedback(null);
    try {
      const res = await callInternalApi<any>('submit_instructor_application', applyForm, 'POST');
      setApplyFeedback(res?.message || 'Your academic application has been submitted.');
      setApplyForm({
        name: '',
        email: '',
        department: 'Faculty of Science, Technology & Environmental Studies',
        qualification: 'Ph.D. in Computer Science / Related Discipline',
      });
    } catch (err: any) {
      setApplyFeedback(err?.message || 'Unable to submit application at this time.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '82vh' }}>
      {/* Compact Native Card-First Header Banner */}
      <section
        className="py-4"
        style={{
          background: 'linear-gradient(135deg, #005B97 0%, #0171BB 55%, #0082D6 100%)',
          borderBottom: '3px solid #FFD200',
        }}
      >
        <div className="container">
          <div className="row align-items-center g-3">
            <div className="col-lg-7">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span
                  className="badge rounded-pill px-3 py-1 fw-bold"
                  style={{ background: '#FFD200', color: '#051426', fontSize: '0.72rem' }}
                >
                  ACADEMIC SENATE &amp; LECTURERS
                </span>
                <span className="small" style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>
                  {instructors.length} Senior Faculty Members
                </span>
              </div>
              <h1 className="fw-bold text-white mb-1" style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.8rem)' }}>
                University Lecturers &amp; Course Directors
              </h1>
              <p className="mb-0" style={{ color: '#cbd5e1', fontSize: '0.88rem', maxWidth: 620 }}>
                Connect with professors, senior lecturers, and research supervisors leading accredited degree programmes across our faculties.
              </p>
            </div>

            <div className="col-lg-5">
              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-lg-end gap-2">
                <div className="input-group input-group-sm" style={{ maxWidth: 300 }}>
                  <span className="input-group-text bg-white border-0 text-muted">
                    <i className="feather-search" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search lecturer, skill, or faculty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="btn btn-light border-0"
                      onClick={() => setSearchQuery('')}
                    >
                      <i className="feather-x" />
                    </button>
                  )}
                </div>

                <div className="d-flex align-items-center gap-1">
                  <Link
                    to={route.instructorGrid}
                    className="btn btn-sm btn-warning rounded-pill px-2.5 fw-semibold"
                    title="Grid View"
                  >
                    <i className="feather-grid" />
                  </Link>
                  <Link
                    to={route.instructorList}
                    className="btn btn-sm btn-outline-light rounded-pill px-2.5"
                    title="List View"
                  >
                    <i className="feather-list" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setApplyFeedback(null);
                      setShowApplyModal(true);
                    }}
                    className="btn btn-sm btn-light rounded-pill px-3 fw-semibold ms-1"
                    style={{ fontSize: '0.76rem', color: '#071F38', whiteSpace: 'nowrap' }}
                  >
                    <i className="isax isax-teacher me-1" />
                    Join Faculty
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Faculty Filter Pills */}
          {departments.length > 0 && (
            <div className="d-flex align-items-center gap-1.5 flex-wrap mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                onClick={() => setSelectedDepartment('all')}
                className="btn btn-sm rounded-pill px-3 py-1 fw-semibold"
                style={{
                  fontSize: '0.74rem',
                  background: selectedDepartment === 'all' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                  color: selectedDepartment === 'all' ? '#0f172a' : '#e2e8f0',
                  border: 'none',
                }}
              >
                All Faculties ({instructors.length})
              </button>
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDepartment(dept)}
                  className="btn btn-sm rounded-pill px-3 py-1 fw-medium"
                  style={{
                    fontSize: '0.74rem',
                    background: selectedDepartment === dept ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                    color: selectedDepartment === dept ? '#0f172a' : '#e2e8f0',
                    border: 'none',
                  }}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Lecturers Card Grid */}
      <section className="py-4">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
              <span className="text-muted small">Loading academic faculty directory...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <h6 className="fw-bold text-dark mb-1">No matching lecturers found</h6>
              <p className="text-muted small mb-3">
                Try clearing your search filter or selecting all faculties.
              </p>
              <div>
                <button
                  type="button"
                  className="btn btn-sm btn-primary rounded-pill px-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDepartment('all');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="row g-3">
                {paginatedInstructors.map((inst, index) => {
                  const assignedCourses =
                    inst.courses && inst.courses.length > 0
                      ? inst.courses
                      : allCourses.slice(index % Math.max(1, allCourses.length), (index % Math.max(1, allCourses.length)) + 2);

                  return (
                    <div className="col-xl-4 col-md-6 d-flex" key={inst.id}>
                      <div
                        className="card border-0 shadow-sm rounded-4 w-100 d-flex flex-column justify-content-between bg-white overflow-hidden"
                        style={{ border: '1px solid #e2e8f0' }}
                      >
                        <div className="p-3.5">
                          <div className="p-3 pb-2">
                            {/* Top Profile Row */}
                            <div className="d-flex align-items-center gap-3 mb-2.5">
                              <Link to={`${route.instructorDetails}?id=${inst.id}`} className="flex-shrink-0">
                                <img
                                  src={inst.avatar}
                                  alt={inst.fullname}
                                  className="rounded-3 border"
                                  style={{ width: 64, height: 64, objectFit: 'cover' }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                                  }}
                                />
                              </Link>
                              <div className="overflow-hidden">
                                <span
                                  className="badge rounded-pill mb-1"
                                  style={{
                                    background: '#eff6ff',
                                    color: '#0171BB',
                                    fontSize: '0.67rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  {inst.role}
                                </span>
                                <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '0.95rem' }}>
                                  <Link
                                    to={`${route.instructorDetails}?id=${inst.id}`}
                                    className="text-dark text-decoration-none"
                                  >
                                    {inst.fullname}
                                  </Link>
                                </h6>
                                <small className="text-muted d-block text-truncate" style={{ fontSize: '0.73rem' }}>
                                  {inst.department}
                                </small>
                              </div>
                            </div>

                            {/* Bio */}
                            <p
                              className="text-muted mb-2.5"
                              style={{
                                fontSize: '0.78rem',
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {inst.bio}
                            </p>

                            {/* Skills Pills */}
                            {inst.skills && inst.skills.length > 0 && (
                              <div className="d-flex flex-wrap gap-1 mb-2.5">
                                {inst.skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="badge bg-light text-secondary border"
                                    style={{ fontSize: '0.66rem', fontWeight: 500 }}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Assigned Courses */}
                            {assignedCourses.length > 0 && (
                              <div className="pt-2 border-top">
                                <div className="text-muted mb-1" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                                  COORDINATED PROGRAMMES:
                                </div>
                                <div className="d-flex flex-wrap gap-1">
                                  {assignedCourses.slice(0, 2).map((c) => (
                                    <Link
                                      key={c.id}
                                      to={`${route.courseDetails}?id=${c.id}`}
                                      className="badge rounded-pill text-decoration-none"
                                      style={{
                                        background: '#f8fafc',
                                        color: '#0f172a',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.68rem',
                                      }}
                                    >
                                      <i className="isax isax-book-1 text-primary me-1" />
                                      {c.shortname}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Footer Metrics + Action */}
                        <div className="px-3 py-2.5 bg-light border-top d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2.5 small text-muted" style={{ fontSize: '0.74rem' }}>
                            <span>
                              <strong className="text-dark">{inst.courseCount}</strong> Courses
                            </span>
                            <span>•</span>
                            <span>
                              <strong className="text-dark">{inst.studentCount}</strong> Scholars
                            </span>
                            <span>•</span>
                            <span>
                              <i className="fas fa-star text-warning me-1" />
                              <strong className="text-dark">{inst.rating}</strong>
                            </span>
                          </div>
                          <Link
                            to={`${route.instructorDetails}?id=${inst.id}`}
                            className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-semibold"
                            style={{ fontSize: '0.73rem' }}
                          >
                            Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Numbered Pagination Controls */}
              {totalPages > 1 && (
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-4 pt-3 border-top">
                  <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                    Showing <strong>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> faculty members
                  </div>
                  <ul className="pagination pagination-sm mb-0 gap-1">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <button
                        type="button"
                        className="page-link rounded-2 px-2.5 py-1"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        style={{ fontSize: '0.78rem' }}
                      >
                        Prev
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                        <button
                          type="button"
                          className={`page-link rounded-2 px-3 py-1 fw-semibold ${
                            page === p ? 'bg-primary text-white border-primary' : ''
                          }`}
                          onClick={() => setPage(p)}
                          style={{ fontSize: '0.78rem' }}
                        >
                          {p}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                      <button
                        type="button"
                        className="page-link rounded-2 px-2.5 py-1"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        style={{ fontSize: '0.78rem' }}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Visiting Lecturer Application Modal */}
      {showApplyModal && (
        <div className="modal d-block" style={{ background: 'rgba(15,23,42,0.55)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <form onSubmit={handleApplySubmit}>
                <div className="modal-header border-0 pb-0">
                  <h6 className="modal-title fw-bold">Apply as Associate / Visiting Lecturer</h6>
                  <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)} />
                </div>
                <div className="modal-body">
                  {applyFeedback && (
                    <div className="alert alert-success py-2 px-3 small rounded-3">{applyFeedback}</div>
                  )}
                  <div className="mb-2.5">
                    <label className="form-label small fw-semibold mb-1">Full Academic Name &amp; Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      placeholder="e.g., Dr. Neema Mwakasege"
                      value={applyForm.name}
                      onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-2.5">
                    <label className="form-label small fw-semibold mb-1">Institutional / Academic Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      required
                      placeholder="name@university.ac.tz"
                      value={applyForm.email}
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-2.5">
                    <label className="form-label small fw-semibold mb-1">Target Faculty</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={applyForm.department}
                      onChange={(e) => setApplyForm({ ...applyForm, department: e.target.value })}
                    />
                  </div>
                  <div className="mb-1">
                    <label className="form-label small fw-semibold mb-1">Highest Qualification &amp; Specialization</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={applyForm.qualification}
                      onChange={(e) => setApplyForm({ ...applyForm, qualification: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-sm btn-light rounded-pill"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Close
                  </button>
                  <button type="submit" disabled={applying} className="btn btn-sm btn-primary rounded-pill px-4">
                    {applying ? 'Submitting...' : 'Submit Dossier'}
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

export default InstructorGrid;
