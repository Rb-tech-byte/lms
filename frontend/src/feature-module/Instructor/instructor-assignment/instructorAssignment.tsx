import React, { useEffect, useMemo, useState } from 'react';
import {
  instructorService,
  InstructorAssignmentItem,
  RecentSubmissionItem,
} from '../../../core/api/instructorService';
import { useInstructorShell } from '../common/instructorLayout';
import {
  KpiCard,
  KpiGrid,
  SectionCard,
  SearchInput,
  FilterPills,
  Pagination,
  EmptyState,
  LoadingState,
  Modal,
  exportToCsv,
  usePaged,
} from '../common/instructorUi';

const PAGE_SIZE = 6;

const InstructorAssignment: React.FC = () => {
  const shell = useInstructorShell();
  const [assignments, setAssignments] = useState<InstructorAssignmentItem[]>([]);
  const [submissions, setSubmissions] = useState<RecentSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'submissions' | 'assignments'>('submissions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [gradeTarget, setGradeTarget] = useState<RecentSubmissionItem | null>(null);
  const [gradeScore, setGradeScore] = useState(85);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New assignment form
  const [formCourseId, setFormCourseId] = useState(2);
  const [formTitle, setFormTitle] = useState('');
  const [formDueDate, setFormDueDate] = useState('2025-05-25');
  const [formMaxGrade, setFormMaxGrade] = useState(100);

  const notify = shell?.notify ?? ((m: string) => window.alert(m));

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await instructorService.fetchAssignmentsAndSubmissions();
      setAssignments(data.assignments);
      setSubmissions(data.submissions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingCount = submissions.filter((s) => s.status === 'Pending Review').length;
  const gradedCount = submissions.filter((s) => s.status === 'Graded').length;

  // Filtered submissions
  const filteredSubs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return submissions.filter((s) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && s.status === 'Pending Review') ||
        (statusFilter === 'graded' && s.status === 'Graded');
      const matchSearch =
        !q ||
        s.studentName.toLowerCase().includes(q) ||
        s.assessmentName.toLowerCase().includes(q) ||
        s.courseCode.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [submissions, searchQuery, statusFilter]);

  // Filtered assignments
  const filteredAssigns = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return assignments.filter((a) => {
      return (
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.courseCode.toLowerCase().includes(q) ||
        a.courseName.toLowerCase().includes(q)
      );
    });
  }, [assignments, searchQuery]);

  const subPager = usePaged(filteredSubs, PAGE_SIZE, [searchQuery, statusFilter]);
  const assignPager = usePaged(filteredAssigns, PAGE_SIZE, [searchQuery]);

  const handleExport = () => {
    if (tab === 'submissions') {
      exportToCsv(
        'OUT_Assignment_Submissions',
        filteredSubs.map((s) => ({
          ID: s.id,
          Scholar: s.studentName,
          Course: s.courseCode,
          Task: s.assessmentName,
          Score: s.score,
          Status: s.status,
          Submitted: s.submittedAt,
          Feedback: s.feedback,
        }))
      );
    } else {
      exportToCsv(
        'OUT_Faculty_Assignments',
        filteredAssigns.map((a) => ({
          ID: a.id,
          Course_Code: a.courseCode,
          Course_Title: a.courseName,
          Assignment_Title: a.title,
          Due_Date: a.dueDate,
          Submissions: a.totalSubmissions,
        }))
      );
    }
  };

  const handleOpenGrade = (s: RecentSubmissionItem) => {
    setGradeTarget(s);
    setGradeScore(s.score || 85);
    setGradeFeedback(s.feedback || 'Commendable implementation demonstrated in submitted laboratory code.');
  };

  const handleSaveGrade = async () => {
    if (!gradeTarget) return;
    setSubmitting(true);
    try {
      const res = await instructorService.gradeAssignmentSubmission(
        gradeTarget.id,
        gradeScore,
        gradeFeedback
      );
      if (res.success) {
        notify(`Grade (${gradeScore}%) recorded in Moodle Gradebook for ${gradeTarget.studentName}.`);
        setGradeTarget(null);
        await loadData();
        shell?.reload();
      } else {
        notify(res.message || 'Failed to submit grade.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!formTitle.trim()) {
      notify('Please provide an assignment title.');
      return;
    }
    setSubmitting(true);
    try {
      const courseMap: Record<number, { code: string; name: string }> = {
        2: { code: 'CS101', name: 'Data Structures & Algorithms in Python' },
        3: { code: 'CS202', name: 'Cloud Computing & Distributed Systems' },
        4: { code: 'BBA301', name: 'Financial Management & Strategic Planning' },
      };
      const info = courseMap[formCourseId] || courseMap[2];
      const res = await instructorService.createAssignment({
        courseId: formCourseId,
        courseCode: info.code,
        courseName: info.name,
        title: formTitle.trim(),
        dueDate: formDueDate,
        maxGrade: formMaxGrade,
      });
      if (res.success) {
        notify('New assignment task published.');
        setCreateOpen(false);
        setFormTitle('');
        await loadData();
      } else {
        notify(res.message || 'Failed to create assignment.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ins-page">
      {/* KPI Overview */}
      <KpiGrid>
        <KpiCard
          label="Active Assessments"
          value={assignments.length}
          unit="Tasks"
          hint="Continuous Assessment (CA)"
          icon="isax isax-clipboard-text5"
          tone="primary"
        />
        <KpiCard
          label="Pending Review"
          value={pendingCount}
          unit="New"
          hint="Awaiting faculty grading"
          icon="isax isax-clock5"
          tone="warning"
        />
        <KpiCard
          label="Graded Submissions"
          value={gradedCount}
          unit="Recorded"
          hint="Synchronized with Moodle"
          icon="isax isax-medal-star5"
          tone="success"
        />
        <KpiCard
          label="Turnaround Time"
          value="< 24 Hrs"
          hint="Fast scholar feedback"
          icon="isax isax-timer5"
          tone="info"
        />
      </KpiGrid>

      {/* Main Card */}
      <SectionCard
        title="Scholar Assignment & Evaluation Hub"
        subtitle="Review, rubric-grade, and record marks directly into the Moodle Gradebook"
        actions={
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className={`ins-btn ${tab === 'submissions' ? 'ins-btn-primary' : 'ins-btn-ghost'}`}
              onClick={() => setTab('submissions')}
            >
              <i className="feather-inbox" /> Submissions ({submissions.length})
            </button>
            <button
              type="button"
              className={`ins-btn ${tab === 'assignments' ? 'ins-btn-primary' : 'ins-btn-ghost'}`}
              onClick={() => setTab('assignments')}
            >
              <i className="feather-layers" /> Assignment Tasks ({assignments.length})
            </button>
            <button type="button" className="ins-btn ins-btn-ghost" onClick={handleExport}>
              <i className="feather-download" /> Export CSV
            </button>
            <button
              type="button"
              className="ins-btn ins-btn-primary"
              onClick={() => setCreateOpen(true)}
            >
              <i className="feather-plus" /> Create Assignment
            </button>
          </div>
        }
      >
        {/* Search & Filters */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={
              tab === 'submissions'
                ? 'Search submissions by scholar name, assessment, course code...'
                : 'Search assignments by title or course code...'
            }
          />
          {tab === 'submissions' && (
            <FilterPills
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Submissions', count: submissions.length },
                { value: 'pending', label: 'Pending Review', count: pendingCount },
                { value: 'graded', label: 'Graded', count: gradedCount },
              ]}
            />
          )}
        </div>

        {loading ? (
          <LoadingState text="Loading assessment data..." />
        ) : tab === 'submissions' ? (
          filteredSubs.length === 0 ? (
            <EmptyState text="No scholar submissions found for this filter." />
          ) : (
            <div className="table-responsive">
              <table className="table ins-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Scholar</th>
                    <th>Assessment Task</th>
                    <th>Course</th>
                    <th>Submission Time</th>
                    <th>Score / Grade</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subPager.slice.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          <img
                            src={s.studentAvatar || '/assets/img/user/user-02.jpg'}
                            alt={s.studentName}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                          <div>
                            <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>
                              {s.studentName}
                            </div>
                            <small className="text-muted" style={{ fontSize: 11.5 }}>
                              ID: {s.id}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark" style={{ fontSize: 13 }}>
                          {s.assessmentName}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary fw-semibold">
                          {s.courseCode}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted" style={{ fontSize: 12 }}>
                          {s.submittedAt}
                        </span>
                      </td>
                      <td>
                        {s.status === 'Graded' ? (
                          <span className="badge bg-success-subtle text-success fw-bold px-2 py-1">
                            {s.score}% (Grade {s.score >= 80 ? 'A' : 'B'})
                          </span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: 12.5 }}>
                            Not graded yet
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${s.status === 'Graded'
                            ? 'bg-success-subtle text-success'
                            : 'bg-warning-subtle text-warning'
                            } fw-bold px-2 py-1`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className={`ins-btn ${s.status === 'Pending Review' ? 'ins-btn-primary' : 'ins-btn-ghost'
                            } px-2.5 py-1`}
                          onClick={() => handleOpenGrade(s)}
                        >
                          <i className="feather-check-square me-1" />
                          {s.status === 'Pending Review' ? 'Grade Now' : 'Edit Mark'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Assignments list */
          filteredAssigns.length === 0 ? (
            <EmptyState text="No assignment tasks found." />
          ) : (
            <div className="table-responsive">
              <table className="table ins-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Assignment Title</th>
                    <th>Due Date</th>
                    <th>Submissions</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignPager.slice.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <span className="badge bg-primary-subtle text-primary fw-bold me-2">
                          {a.courseCode}
                        </span>
                        <span className="text-muted" style={{ fontSize: 12.5 }}>
                          {a.courseName}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold text-dark" style={{ fontSize: 13.5 }}>
                          {a.title}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted" style={{ fontSize: 12.5 }}>
                          <i className="feather-calendar me-1" />
                          {a.dueDate}
                        </span>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark">
                          {a.totalSubmissions} turned in
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-success-subtle text-success fw-semibold">
                          Active
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="ins-btn ins-btn-ghost px-2 py-1"
                          onClick={() => {
                            setSearchQuery(a.courseCode);
                            setTab('submissions');
                          }}
                        >
                          View Submissions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Pagination */}
        <div className="mt-4">
          <Pagination
            page={tab === 'submissions' ? subPager.page : assignPager.page}
            pageSize={PAGE_SIZE}
            total={tab === 'submissions' ? filteredSubs.length : filteredAssigns.length}
            onChange={tab === 'submissions' ? subPager.setPage : assignPager.setPage}
            noun={tab === 'submissions' ? 'submissions' : 'assignments'}
          />
        </div>
      </SectionCard>

      {/* Modal: Grade Submission */}
      <Modal
        open={!!gradeTarget}
        title={`Grade Assessment: ${gradeTarget?.studentName || ''}`}
        subtitle={`Course: ${gradeTarget?.courseCode} • Task: ${gradeTarget?.assessmentName}`}
        onClose={() => setGradeTarget(null)}
        onSubmit={handleSaveGrade}
        submitLabel="Commit Grade to Moodle"
        submitting={submitting}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Score / Percentage (0 - 100) *
            </label>
            <div className="input-group input-group-sm">
              <input
                type="number"
                min={0}
                max={100}
                className="form-control"
                value={gradeScore}
                onChange={(e) => setGradeScore(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                required
              />
              <span className="input-group-text">%</span>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Equivalent Academic Standing
            </label>
            <div className="p-2 rounded bg-light border text-center fw-bold" style={{ fontSize: 13 }}>
              {gradeScore >= 80
                ? 'Grade A (First Class Honours)'
                : gradeScore >= 70
                  ? 'Grade B+ (Upper Second)'
                  : gradeScore >= 60
                    ? 'Grade B (Pass)'
                    : gradeScore >= 50
                      ? 'Grade C (Marginal)'
                      : 'Grade F (Fail / Remedial)'}
            </div>
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Examiner Feedback & Rubric Remarks *
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={4}
              value={gradeFeedback}
              placeholder="Provide constructive feedback on algorithmic rigor, code quality, and formatting..."
              onChange={(e) => setGradeFeedback(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Create Assignment */}
      <Modal
        open={createOpen}
        title="Publish New Assignment Task"
        subtitle="Open University of Tanzania Continuous Assessment (CA) System"
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateAssignment}
        submitLabel="Publish Task"
        submitting={submitting}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Academic Course *
            </label>
            <select
              className="form-select form-select-sm"
              value={formCourseId}
              onChange={(e) => setFormCourseId(Number(e.target.value))}
            >
              <option value={2}>CS101: Data Structures & Algorithms</option>
              <option value={3}>CS202: Cloud Computing & Distributed Systems</option>
              <option value={4}>BBA301: Financial Management & Strategic Planning</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Due Date *
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Assignment Title *
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Distributed Consensus Algorithms Lab Assessment"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Maximum Marks
            </label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={formMaxGrade}
              onChange={(e) => setFormMaxGrade(Number(e.target.value) || 100)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InstructorAssignment;
