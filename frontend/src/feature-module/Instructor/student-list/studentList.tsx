import React, { useEffect, useState, useMemo } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { instructorService, EnrolledStudentRecord } from '../../../core/api/instructorService';

const PAGE_SIZE = 6;

const StudentList: React.FC = () => {
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
      <Breadcrumb title="Supervised Students Roster" />
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
                      <h4 className="fw-bold text-dark mb-1">Supervised Scholars Roster</h4>
                      <p className="text-muted small mb-0">
                        Academic standings, progression metrics, and registration credentials.
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
                          className="btn btn-sm btn-primary rounded-pill px-2.5"
                          title="List View"
                        >
                          <i className="feather-list" />
                        </Link>
                        <Link
                          to={all_routes.studentsGrid}
                          className="btn btn-sm btn-outline-secondary rounded-pill px-2.5"
                          title="Grid View"
                        >
                          <i className="feather-grid" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="d-flex flex-wrap align-items-center gap-1.5 mb-3">
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
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              <th>Scholar Name &amp; Profile</th>
                              <th>Registration No.</th>
                              <th>Email Contact</th>
                              <th style={{ width: 140 }}>Curriculum Progress</th>
                              <th>Current Standing</th>
                              <th className="text-end">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedStudents.map((s) => (
                              <tr key={s.id}>
                                <td>
                                  <div className="d-flex align-items-center gap-2.5">
                                    <img
                                      src={s.avatar}
                                      alt={s.fullname}
                                      className="rounded-circle border"
                                      style={{ width: 38, height: 38, objectFit: 'cover' }}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                                      }}
                                    />
                                    <div>
                                      <Link to={all_routes.studentsDetails} className="fw-bold text-dark text-decoration-none fs-13 d-block">
                                        {s.fullname}
                                      </Link>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <code className="text-primary fw-semibold">{s.regNumber}</code>
                                </td>
                                <td>
                                  <span className="small text-muted">{s.email}</span>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <div className="progress flex-grow-1" style={{ height: 6 }}>
                                      <div
                                        className={`progress-bar ${
                                          (s.averageProgress ?? 0) >= 80 ? 'bg-success' : 'bg-primary'
                                        }`}
                                        style={{ width: `${s.averageProgress ?? 0}%` }}
                                      />
                                    </div>
                                    <span className="small text-muted" style={{ fontSize: 11 }}>
                                      {s.averageProgress ?? 0}%
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-success-subtle text-success border border-success px-2 py-1">
                                    {s.averageGrade}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <Link
                                    to={all_routes.studentsDetails}
                                    className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold"
                                    style={{ fontSize: '0.78rem' }}
                                  >
                                    Dossier
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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

export default StudentList;
