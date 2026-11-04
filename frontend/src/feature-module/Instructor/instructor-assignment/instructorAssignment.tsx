import React, { useEffect, useState, useMemo } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { instructorService, InstructorAssignmentItem } from '../../../core/api/instructorService';

const PAGE_SIZE = 6;

const InstructorAssignment: React.FC = () => {
  const [assignments, setAssignments] = useState<InstructorAssignmentItem[]>([]);
  const [gradeMap, setGradeMap] = useState<Record<number, number>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    let mounted = true;
    instructorService
      .getInstructorAssignments([2, 3, 4])
      .then((list) => {
        if (mounted) setAssignments(list || []);
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

  const handleQuickGrade = async (item: InstructorAssignmentItem) => {
    const score = gradeMap[item.id] ?? 85;
    setSavingId(item.id);
    setSavedMsg(null);
    try {
      await instructorService.saveSubmissionGrade({
        courseId: item.courseId,
        studentId: 4,
        itemName: item.title,
        grade: score,
        feedback: 'Evaluated by OUT Course Director',
      });
      setSavedMsg(`Grade (${score}%) recorded in Moodle Official Gradebook for "${item.title}".`);
    } catch (err: any) {
      console.error('Grading error:', err);
    } finally {
      setSavingId(null);
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const isGraded = (gradeMap[item.id] !== undefined) || (item.totalSubmissions > 0 && item.id % 2 === 0);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'graded' && isGraded) ||
        (statusFilter === 'pending' && !isGraded);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.courseName.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [assignments, gradeMap, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredAssignments.length / PAGE_SIZE) || 1;
  const paginatedAssignments = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAssignments.slice(start, start + PAGE_SIZE);
  }, [filteredAssignments, page]);

  return (
    <>
      <Breadcrumb title="Coursework Assignments & Grading" />
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
                      <h4 className="fw-bold text-dark mb-1">Continuous Assessment &amp; Grading Queue</h4>
                      <p className="text-muted small mb-0">
                        Evaluate student submissions and record marks directly into Moodle Gradebook.
                      </p>
                    </div>

                    <div className="input-group input-group-sm" style={{ width: 240 }}>
                      <span className="input-group-text bg-white border-end-0">
                        <i className="feather-search text-muted" style={{ fontSize: 13 }} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search assignments..."
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

                  {/* Status Filter Tabs */}
                  <div className="d-flex flex-wrap align-items-center gap-1.5 mb-3">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${
                        statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      All Deliverables ({assignments.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('pending')}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${
                        statusFilter === 'pending' ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      Pending Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('graded')}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${
                        statusFilter === 'graded' ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      Graded
                    </button>
                  </div>

                  {savedMsg && (
                    <div className="alert alert-success py-2 px-3 small rounded-3 mb-3 d-flex align-items-center justify-content-between">
                      <span>
                        <i className="feather-check-circle me-1" /> {savedMsg}
                      </span>
                      <button
                        type="button"
                        className="btn-close"
                        style={{ fontSize: 10 }}
                        onClick={() => setSavedMsg(null)}
                      />
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                      <span className="text-muted small">Loading assignments from Moodle...</span>
                    </div>
                  ) : filteredAssignments.length === 0 ? (
                    <div className="text-center py-5 text-muted small">
                      <i className="feather-file-text fs-32 text-muted mb-2 d-block" />
                      No matching assignments found.
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              <th>Assignment Deliverable</th>
                              <th>Academic Course</th>
                              <th>Due Date</th>
                              <th>Submissions</th>
                              <th style={{ width: 140 }}>Grade (%)</th>
                              <th className="text-end">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedAssignments.map((item) => {
                              const currentScore = gradeMap[item.id] ?? 85;
                              const isSaving = savingId === item.id;

                              return (
                                <tr key={item.id}>
                                  <td>
                                    <div>
                                      <span className="fw-bold text-dark fs-14 d-block">
                                        {item.title}
                                      </span>
                                      <small className="text-muted">Module Continuous Assessment</small>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="badge bg-light text-primary border fw-semibold px-2 py-1">
                                      {item.courseName}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="small text-muted">
                                      <i className="feather-calendar me-1" />
                                      {item.dueDate}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="badge bg-info-subtle text-info border px-2 py-1">
                                      {item.totalSubmissions} Submitted
                                    </span>
                                  </td>
                                  <td>
                                    <div className="input-group input-group-sm">
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        className="form-control text-center fw-bold"
                                        value={currentScore}
                                        onChange={(e) =>
                                          setGradeMap({
                                            ...gradeMap,
                                            [item.id]: Math.min(100, Math.max(0, Number(e.target.value))),
                                          })
                                        }
                                        style={{ maxWidth: 70 }}
                                      />
                                      <span className="input-group-text bg-light text-muted">%</span>
                                    </div>
                                  </td>
                                  <td className="text-end">
                                    <button
                                      type="button"
                                      disabled={isSaving}
                                      onClick={() => handleQuickGrade(item)}
                                      className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-semibold"
                                      style={{ fontSize: '0.78rem' }}
                                    >
                                      {isSaving ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-1" role="status" />
                                          Saving...
                                        </>
                                      ) : (
                                        'Save Grade'
                                      )}
                                    </button>
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
                              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredAssignments.length)}
                            </strong>{' '}
                            of <strong>{filteredAssignments.length}</strong> assignments
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

export default InstructorAssignment;
