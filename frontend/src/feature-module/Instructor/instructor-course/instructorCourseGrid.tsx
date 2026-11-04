import React, { useEffect, useState, useMemo } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { instructorService, InstructorCourseSummary } from '../../../core/api/instructorService';

const PAGE_SIZE = 6;

const InstructorCourseGrid: React.FC = () => {
  const [courses, setCourses] = useState<InstructorCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    let mounted = true;
    instructorService
      .getInstructorDashboardStats()
      .then((res) => {
        if (mounted) setCourses(res.courses || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesStatus =
        statusFilter === 'all' ||
        c.status.toLowerCase() === statusFilter.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.fullname.toLowerCase().includes(q) ||
        c.shortname.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [courses, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [filteredCourses, page]);

  return (
    <>
      <Breadcrumb title="Managed Courses Grid" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                    <div>
                      <h4 className="fw-bold text-dark mb-1">Managed Courses Portfolio</h4>
                      <p className="text-muted small mb-0">
                        Visual overview of all directed modules and active enrolments.
                      </p>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <div className="input-group input-group-sm" style={{ width: 220 }}>
                        <span className="input-group-text bg-white border-end-0">
                          <i className="feather-search text-muted" style={{ fontSize: 13 }} />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Search courses..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ fontSize: 13 }}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            className="btn btn-sm btn-white border border-start-0"
                            onClick={() => setSearchQuery('')}
                          >
                            <i className="feather-x" style={{ fontSize: 12 }} />
                          </button>
                        )}
                      </div>

                      <div className="d-flex align-items-center gap-1">
                        <Link
                          to={all_routes.instructorCourse}
                          className="btn btn-sm btn-outline-secondary rounded-pill px-2.5"
                          title="List View"
                        >
                          <i className="feather-list" />
                        </Link>
                        <Link
                          to={all_routes.instructorCourseGrid}
                          className="btn btn-sm btn-primary rounded-pill px-2.5"
                          title="Grid View"
                        >
                          <i className="feather-grid" />
                        </Link>
                      </div>

                      <Link to={all_routes.addNewCourse} className="btn btn-primary btn-sm rounded-pill px-3 ms-1">
                        + New Course
                      </Link>
                    </div>
                  </div>

                  {/* Status Filter Tabs */}
                  <div className="d-flex flex-wrap align-items-center gap-1.5 mb-4">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'
                        }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      All Courses ({courses.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('published')}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${statusFilter === 'published' ? 'btn-primary' : 'btn-outline-secondary'
                        }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      Published ({courses.filter((c) => c.status.toLowerCase() === 'published').length})
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                      <span className="text-muted small">Loading course roster from Moodle...</span>
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-5 text-muted small">
                      <i className="feather-book-open fs-32 text-muted mb-2 d-block" />
                      No matching courses found.
                    </div>
                  ) : (
                    <>
                      <div className="row g-3">
                        {paginatedCourses.map((c) => (
                          <div className="col-xl-4 col-md-6 d-flex" key={c.id}>
                            <div className="card border shadow-sm rounded-3 overflow-hidden w-100 d-flex flex-column justify-content-between">
                              <div>
                                <div className="position-relative">
                                  <img
                                    src={c.image}
                                    alt={c.fullname}
                                    className="w-100"
                                    style={{ height: 140, objectFit: 'cover' }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      const ownSlug = (c.shortname || `course-${c.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-');
                                      const ownThumbnail = `/assets/img/course/thumbnails/course-${c.id}-${ownSlug}.svg`;
                                      if (target.src !== ownThumbnail && !target.src.endsWith(ownThumbnail)) {
                                        target.src = ownThumbnail;
                                      }
                                    }}
                                  />
                                  <span
                                    className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 text-white"
                                    style={{ fontSize: 11 }}
                                  >
                                    {c.status}
                                  </span>
                                </div>

                                <div className="p-3">
                                  <span className="badge bg-light text-primary border mb-1.5" style={{ fontSize: 11 }}>
                                    {c.shortname}
                                  </span>
                                  <h6 className="fw-bold mb-1 fs-14 text-truncate">
                                    <Link to={`${all_routes.courseDetails}?id=${c.id}`} className="text-dark text-decoration-none">
                                      {c.fullname}
                                    </Link>
                                  </h6>
                                  <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: 12 }}>
                                    <span>
                                      <i className="feather-users me-1" />
                                      {c.enrolledCount} Scholars
                                    </span>
                                    <span>•</span>
                                    <span>{c.lessonsCount} Modules</span>
                                  </div>
                                </div>
                              </div>

                              <div className="px-3 py-2 bg-light border-top d-flex align-items-center justify-content-between">
                                <span className="small text-muted" style={{ fontSize: 12 }}>
                                  <i className="fa-solid fa-star text-warning me-1" />
                                  <strong className="text-dark">{c.rating}</strong> / 5.0
                                </span>
                                <Link
                                  to={`/course/course-watch?courseId=${c.id}`}
                                  className="btn btn-sm btn-primary rounded-pill px-3 py-0.5 fw-semibold"
                                  style={{ fontSize: '0.76rem' }}
                                >
                                  Classroom
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-4 pt-3 border-top">
                          <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                            Showing{' '}
                            <strong>
                              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCourses.length)}
                            </strong>{' '}
                            of <strong>{filteredCourses.length}</strong> courses
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
                                  className={`page-link rounded-2 px-3 py-1 fw-semibold ${page === p ? 'bg-primary text-white border-primary' : ''
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorCourseGrid;
