import React, { useEffect, useState, useMemo } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { instructorService, EnrolledStudentRecord } from '../../../core/api/instructorService';

const PAGE_SIZE = 6;

const StudentGrid: React.FC = () => {
  const [students, setStudents] = useState<EnrolledStudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'high' | 'in_progress'>('all');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    let mounted = true;
    instructorService
      .getInstructorStudents([2, 3, 4])
      .then((list) => {
        if (mounted) setStudents(list || []);
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
  }, [searchQuery, performanceFilter]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const progress = s.averageProgress ?? 0;
      const matchesPerformance =
        performanceFilter === 'all' ||
        (performanceFilter === 'high' && progress >= 80) ||
        (performanceFilter === 'in_progress' && progress < 80);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.fullname.toLowerCase().includes(q) ||
        s.regNumber.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);

      return matchesPerformance && matchesSearch;
    });
  }, [students, performanceFilter, searchQuery]);

  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, page]);

  return (
    <>
      <Breadcrumb title="Supervised Students Grid" />
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
                      <h4 className="fw-bold text-dark mb-1">Supervised Scholars Directory</h4>
                      <p className="text-muted small mb-0">
                        Roster of all registered students in your academic modules and degree tracks.
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
                          placeholder="Search scholars..."
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
                          to={all_routes.studentsList}
                          className="btn btn-sm btn-outline-secondary rounded-pill px-2.5"
                          title="List View"
                        >
                          <i className="feather-list" />
                        </Link>
                        <Link
                          to={all_routes.studentsGrid}
                          className="btn btn-sm btn-primary rounded-pill px-2.5"
                          title="Grid View"
                        >
                          <i className="feather-grid" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="d-flex flex-wrap align-items-center gap-1.5 mb-4">
                    <button
                      type="button"
                      onClick={() => setPerformanceFilter('all')}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${
                        performanceFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      All Scholars ({students.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerformanceFilter('high')}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${
                        performanceFilter === 'high' ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      High Achievers ≥80% ({students.filter((s) => (s.averageProgress ?? 0) >= 80).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerformanceFilter('in_progress')}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${
                        performanceFilter === 'in_progress' ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      In Progress ({students.filter((s) => (s.averageProgress ?? 0) < 80).length})
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                      <span className="text-muted small">Loading scholars from Moodle...</span>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-5 text-muted small">
                      <i className="feather-users fs-32 text-muted mb-2 d-block" />
                      No matching scholars found.
                    </div>
                  ) : (
                    <>
                      <div className="row g-3">
                        {paginatedStudents.map((s) => (
                          <div className="col-xl-4 col-md-6 d-flex" key={s.id}>
                            <div className="card border shadow-sm rounded-3 p-3.5 w-100 d-flex flex-column justify-content-between">
                              <div className="text-center pb-2">
                                <img
                                  src={s.avatar}
                                  alt={s.fullname}
                                  className="rounded-circle mx-auto mb-2.5 border"
                                  style={{ width: 62, height: 62, objectFit: 'cover' }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                                  }}
                                />
                                <h6 className="fw-bold mb-0 text-dark fs-14">
                                  <Link to={all_routes.studentsDetails} className="text-dark text-decoration-none">
                                    {s.fullname}
                                  </Link>
                                </h6>
                                <code className="text-primary small d-block mb-1">{s.regNumber}</code>
                                <small className="text-muted d-block text-truncate mb-2.5">{s.email}</small>

                                {/* Progress bar */}
                                <div className="mb-2">
                                  <div className="d-flex justify-content-between small text-muted mb-1" style={{ fontSize: 11 }}>
                                    <span>Curriculum Progress</span>
                                    <strong>{s.averageProgress ?? 0}%</strong>
                                  </div>
                                  <div className="progress" style={{ height: 6 }}>
                                    <div
                                      className={`progress-bar ${
                                        (s.averageProgress ?? 0) >= 80 ? 'bg-success' : 'bg-primary'
                                      }`}
                                      style={{ width: `${s.averageProgress ?? 0}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2 border-top d-flex align-items-center justify-content-between">
                                <span className="badge bg-success-subtle text-success border border-success px-2 py-1">
                                  {s.averageGrade}
                                </span>
                                <Link
                                  to={all_routes.studentsDetails}
                                  className="btn btn-sm btn-outline-primary rounded-pill px-3 py-0.5 fw-semibold"
                                  style={{ fontSize: '0.76rem' }}
                                >
                                  View Dossier
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
                              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredStudents.length)}
                            </strong>{' '}
                            of <strong>{filteredStudents.length}</strong> scholars
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentGrid;
