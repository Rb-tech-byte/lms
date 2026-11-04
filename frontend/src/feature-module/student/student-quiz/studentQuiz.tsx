import React, { useEffect, useState, useMemo } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import StudentSidebar from '../common/studentSidebar';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { useAuth } from '../../../core/auth/authContext';
import { getMoodleUserId } from '../../../core/api/courseService';
import { quizService, MoodleQuiz } from '../../../core/api/quizService';

const PAGE_SIZE = 6;

const COURSE_LABELS: Record<number, { code: string; name: string }> = {
  2: { code: 'CS101', name: 'Python & Algorithms' },
  3: { code: 'CS202', name: 'Cloud Computing' },
  4: { code: 'BBA301', name: 'Financial Governance' },
};

const StudentQuiz: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<MoodleQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<number | 'all'>('all');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    let mounted = true;
    const uid = getMoodleUserId(user);
    quizService
      .getQuizzesByCourses([2, 3, 4], uid)
      .then((list) => {
        if (mounted) setQuizzes(list || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCourse]);

  // Unique course IDs in quizzes
  const courseIds = useMemo(() => {
    const ids = new Set<number>();
    quizzes.forEach((q) => {
      if (q.course) ids.add(q.course);
    });
    return Array.from(ids);
  }, [quizzes]);

  // Filtered quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchesCourse = selectedCourse === 'all' || q.course === selectedCourse;
      const matchesSearch =
        !searchQuery.trim() ||
        q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.intro && q.intro.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (COURSE_LABELS[q.course]?.code &&
          COURSE_LABELS[q.course].code.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCourse && matchesSearch;
    });
  }, [quizzes, selectedCourse, searchQuery]);

  // Paginated quizzes
  const totalPages = Math.ceil(filteredQuizzes.length / PAGE_SIZE) || 1;
  const paginatedQuizzes = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredQuizzes.slice(start, start + PAGE_SIZE);
  }, [filteredQuizzes, page]);

  return (
    <>
      <Breadcrumb title="My Quiz Attempts & Assessments" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              {/* Header Bar with Search */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                    <div>
                      <h4 className="fw-bold text-dark mb-1">Moodle Academic Assessments &amp; Quizzes</h4>
                      <p className="text-muted small mb-0">
                        Official continuous assessment quizzes recorded directly in your OUT academic gradebook.
                      </p>
                    </div>

                    <div className="input-group input-group-sm" style={{ width: 240 }}>
                      <span className="input-group-text bg-white border-end-0">
                        <i className="feather-search text-muted" style={{ fontSize: 13 }} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search quizzes..."
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
                  </div>

                  {/* Course Filter Pills */}
                  <div className="d-flex flex-wrap align-items-center gap-1.5 mb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedCourse('all')}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${
                        selectedCourse === 'all' ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      All Assessments ({quizzes.length})
                    </button>
                    {courseIds.map((cid) => {
                      const label = COURSE_LABELS[cid] || { code: `Course ${cid}`, name: '' };
                      const count = quizzes.filter((q) => q.course === cid).length;
                      return (
                        <button
                          key={cid}
                          type="button"
                          onClick={() => setSelectedCourse(cid)}
                          className={`btn btn-sm rounded-pill px-3 py-1 ${
                            selectedCourse === cid ? 'btn-primary' : 'btn-outline-secondary'
                          }`}
                          style={{ fontSize: '0.78rem' }}
                        >
                          {label.code} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                      <span className="text-muted small">Loading assessments from Moodle...</span>
                    </div>
                  ) : filteredQuizzes.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="text-muted mb-2">
                        <i className="feather-help-circle fs-36 text-muted" />
                      </div>
                      <h6 className="fw-semibold text-dark">No matching assessments found</h6>
                      <p className="text-muted small mb-0">Try clearing your search query or selecting all courses.</p>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              <th>Assessment Activity</th>
                              <th>Academic Course</th>
                              <th>Questions</th>
                              <th>Duration</th>
                              <th>Grade Target</th>
                              <th className="text-end">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedQuizzes.map((q) => {
                              const courseInfo = COURSE_LABELS[q.course] || {
                                code: `Course ${q.course}`,
                                name: '',
                              };
                              const durationMinutes = Math.round((q.timelimit || 600) / 60);

                              return (
                                <tr key={q.id}>
                                  <td>
                                    <div>
                                      <Link
                                        to={`${all_routes.studentQuizQuestion}?quizId=${q.id}`}
                                        className="fw-bold text-dark text-decoration-none d-block fs-14"
                                      >
                                        {q.name}
                                      </Link>
                                      {q.intro && (
                                        <span
                                          className="text-muted small d-block text-truncate"
                                          style={{ maxWidth: 360, fontSize: 12 }}
                                        >
                                          {q.intro.replace(/<[^>]+>/g, '')}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <span className="badge bg-light text-primary border fw-semibold px-2.5 py-1">
                                      {courseInfo.code}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="text-dark fw-medium small">
                                      {q.questionsCount || 5} Questions
                                    </span>
                                  </td>
                                  <td>
                                    <span className="badge bg-secondary-subtle text-secondary border px-2 py-1 small">
                                      <i className="feather-clock me-1" />
                                      {durationMinutes > 0 ? `${durationMinutes} Mins` : 'Untimed'}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="fw-bold text-success fs-13">
                                      {q.grade || 100}%
                                    </span>
                                  </td>
                                  <td className="text-end">
                                    <Link
                                      to={`${all_routes.studentQuizQuestion}?quizId=${q.id}`}
                                      className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-semibold"
                                      style={{ fontSize: '0.78rem' }}
                                    >
                                      Attempt Assessment
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-4 pt-3 border-top">
                          <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                            Showing{' '}
                            <strong>
                              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredQuizzes.length)}
                            </strong>{' '}
                            of <strong>{filteredQuizzes.length}</strong> assessments
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

export default StudentQuiz;
