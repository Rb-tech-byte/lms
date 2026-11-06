import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';
import { courseService, PublicInstructor, PublicCatalogCourse } from '../../../../core/api/courseService';

const PAGE_SIZE = 6;

const InstructorList: React.FC = () => {
  const route = all_routes;
  const [instructors, setInstructors] = useState<PublicInstructor[]>([]);
  const [allCourses, setAllCourses] = useState<PublicCatalogCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([courseService.getPublicInstructors(), courseService.getPublicCatalog()])
      .then(([list, catalog]) => {
        if (!mounted) return;
        setInstructors(list || []);
        setAllCourses(catalog.courses || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
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
        inst.email.toLowerCase().includes(q)
      );
    });
  }, [instructors, selectedDepartment, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedInstructors = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '82vh' }}>
      <section
        className="py-4"
        style={{
          background: 'linear-gradient(135deg, #013BA6 0%, #013BA6 55%, #228DDD 100%)',
          borderBottom: '3px solid #F4ED2D',
        }}
      >
        <div className="container">
          <div className="row align-items-center g-3">
            <div className="col-lg-7">
              <span
                className="badge rounded-pill px-3 py-1 fw-bold mb-2"
                style={{ background: '#F4ED2D', color: '#051426', fontSize: '0.72rem' }}
              >
                FACULTY DIRECTORY
              </span>
              <h1 className="fw-bold text-white mb-1" style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.8rem)' }}>
                University Lecturers &amp; Supervisors
              </h1>
              <p className="mb-0" style={{ color: '#cbd5e1', fontSize: '0.86rem' }}>
                Showing {filtered.length} academic lecturers and programme coordinators.
              </p>
            </div>
            <div className="col-lg-5">
              <div className="d-flex align-items-center justify-content-lg-end gap-2">
                <div className="input-group input-group-sm" style={{ maxWidth: 280 }}>
                  <span className="input-group-text bg-white border-0 text-muted">
                    <i className="feather-search" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search lecturer or faculty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                <Link to={route.instructorGrid} className="btn btn-sm btn-outline-light rounded-pill px-2.5">
                  <i className="feather-grid" />
                </Link>
                <Link to={route.instructorList} className="btn btn-sm btn-warning rounded-pill px-2.5">
                  <i className="feather-list" />
                </Link>
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

      <section className="py-4">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
              <span className="text-muted small">Loading faculty profiles...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <h6 className="fw-bold text-dark mb-1">No matching lecturers found</h6>
              <p className="text-muted small mb-3">
                Try clearing your search query or selecting all faculties.
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
                {paginatedInstructors.map((inst, idx) => {
                  const courses =
                    inst.courses && inst.courses.length > 0
                      ? inst.courses
                      : allCourses.slice(idx % Math.max(1, allCourses.length), (idx % Math.max(1, allCourses.length)) + 2);
                  return (
                    <div className="col-12" key={inst.id}>
                      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                        <div className="row align-items-center g-3">
                          <div className="col-md-8 d-flex align-items-center gap-3">
                            <img
                              src={inst.avatar}
                              alt={inst.fullname}
                              className="rounded-3 border flex-shrink-0"
                              style={{ width: 76, height: 76, objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                              }}
                            />
                            <div>
                              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                <span className="badge bg-primary-subtle text-primary rounded-pill" style={{ fontSize: '0.7rem' }}>
                                  {inst.role}
                                </span>
                                <span className="text-muted small">{inst.department}</span>
                              </div>
                              <h5 className="fw-bold mb-1" style={{ fontSize: '1.05rem' }}>
                                <Link to={`${route.instructorDetails}?id=${inst.id}`} className="text-dark text-decoration-none">
                                  {inst.fullname}
                                </Link>
                              </h5>
                              <p className="text-muted small mb-2">{inst.bio}</p>
                              <div className="d-flex flex-wrap gap-1.5">
                                {courses.map((c) => (
                                  <Link
                                    key={c.id}
                                    to={`${route.courseDetails}?id=${c.id}`}
                                    className="badge bg-light text-dark border text-decoration-none me-1"
                                    style={{ fontSize: '0.72rem' }}
                                  >
                                    <i className="isax isax-book-1 text-primary me-1" />
                                    {c.shortname}: {c.fullname}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 text-md-end">
                            <div className="mb-2 small text-muted">
                              <strong className="text-dark">{inst.courseCount}</strong> Courses •{' '}
                              <strong className="text-dark">{inst.studentCount}</strong> Scholars •{' '}
                              <i className="fas fa-star text-warning" /> <strong className="text-dark">{inst.rating}</strong>
                            </div>
                            <Link
                              to={`${route.instructorDetails}?id=${inst.id}`}
                              className="btn btn-primary btn-sm rounded-pill px-4"
                            >
                              View Profile
                            </Link>
                          </div>
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
    </div>
  );
};

export default InstructorList;
