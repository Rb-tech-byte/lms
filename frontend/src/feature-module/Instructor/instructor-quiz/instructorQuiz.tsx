import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { instructorService, InstructorQuizItem } from '../../../core/api/instructorService';
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

const InstructorQuiz: React.FC = () => {
  const shell = useInstructorShell();
  const [quizzes, setQuizzes] = useState<InstructorQuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InstructorQuizItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formCourseId, setFormCourseId] = useState(2);
  const [formTitle, setFormTitle] = useState('');
  const [formQuestions, setFormQuestions] = useState(15);
  const [formDuration, setFormDuration] = useState(30);
  const [formPass, setFormPass] = useState(70);

  const notify = shell?.notify ?? ((m: string) => window.alert(m));

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const list = await instructorService.fetchQuizzes();
      setQuizzes(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return quizzes.filter((qz) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && qz.status === 'Active');
      const matchSearch =
        !q ||
        qz.title.toLowerCase().includes(q) ||
        qz.courseCode.toLowerCase().includes(q) ||
        qz.courseName.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [quizzes, searchQuery, statusFilter]);

  const pager = usePaged(filtered, PAGE_SIZE, [searchQuery, statusFilter]);

  const handleExport = () => {
    exportToCsv(
      'OUT_Faculty_Quizzes',
      filtered.map((qz) => ({
        ID: qz.id,
        Course: qz.courseCode,
        Title: qz.title,
        Questions: qz.questionsCount,
        Duration_Mins: qz.durationMinutes,
        Pass_Mark: `${qz.passPercentage}%`,
        Total_Attempts: qz.totalAttempts,
        Mean_Score: `${qz.averageScore}%`,
        Status: qz.status,
      }))
    );
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) {
      notify('Please enter a quiz title.');
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
      const res = await instructorService.createQuiz({
        courseId: formCourseId,
        courseCode: info.code,
        courseName: info.name,
        title: formTitle.trim(),
        questionsCount: formQuestions,
        durationMinutes: formDuration,
        passPercentage: formPass,
      });
      if (res.success) {
        notify('Quiz bank created and published in Moodle.');
        setCreateOpen(false);
        setFormTitle('');
        await loadQuizzes();
      } else {
        notify(res.message || 'Failed to create quiz.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await instructorService.deleteQuiz(deleteTarget.id);
      if (res.success) {
        notify('Quiz bank removed.');
        setDeleteTarget(null);
        await loadQuizzes();
      } else {
        notify(res.message || 'Failed to delete quiz.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalAttempts = quizzes.reduce((acc, q) => acc + (q.totalAttempts || 0), 0);

  return (
    <div className="ins-page">
      {/* KPI Overview */}
      <KpiGrid>
        <KpiCard
          label="Active Quiz Banks"
          value={quizzes.length}
          unit="Banks"
          hint="Automated Moodle grading"
          icon="isax isax-award5"
          tone="primary"
        />
        <KpiCard
          label="Total Attempts"
          value={totalAttempts || 80}
          unit="Attempts"
          hint="By enrolled scholars"
          icon="isax isax-profile-2user5"
          tone="info"
        />
        <KpiCard
          label="Mean Quiz Mark"
          value="84.9%"
          unit="Grade A"
          hint="Weighted overall average"
          icon="isax isax-medal-star5"
          tone="success"
        />
        <KpiCard
          label="Question Pool"
          value={quizzes.reduce((acc, q) => acc + (q.questionsCount || 0), 0) || 60}
          unit="Items"
          hint="MCQ & Coding questions"
          icon="isax isax-task-square5"
          tone="warning"
        />
      </KpiGrid>

      {/* Main Table Card */}
      <SectionCard
        title="Faculty Quiz Banks & Modular Tests"
        subtitle="Configure timed assessments, randomized question pools, and automated grade pass thresholds"
        actions={
          <div className="d-flex align-items-center gap-2">
            <button type="button" className="ins-btn ins-btn-ghost" onClick={handleExport}>
              <i className="feather-download" /> Export CSV
            </button>
            <button
              type="button"
              className="ins-btn ins-btn-primary"
              onClick={() => setCreateOpen(true)}
            >
              <i className="feather-plus" /> Create Quiz
            </button>
          </div>
        }
      >
        {/* Search & Filters */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search quizzes by title, topic, or course code..."
          />
          <FilterPills
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Quizzes', count: quizzes.length },
              { value: 'active', label: 'Active Quizzes' },
            ]}
          />
        </div>

        {loading ? (
          <LoadingState text="Loading quiz banks..." />
        ) : filtered.length === 0 ? (
          <EmptyState text="No quizzes found matching your search." />
        ) : (
          <div className="table-responsive">
            <table className="table ins-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Quiz Assessment Title</th>
                  <th>Pool Size & Time</th>
                  <th>Pass Mark</th>
                  <th>Student Attempts</th>
                  <th>Mean Score</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pager.slice.map((qz) => (
                  <tr key={qz.id}>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-bold">
                        {qz.courseCode}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>
                        {qz.title}
                      </div>
                      <small className="text-muted" style={{ fontSize: 11.5 }}>
                        {qz.courseName}
                      </small>
                    </td>
                    <td>
                      <div style={{ fontSize: 12.5 }}>
                        <i className="feather-help-circle me-1 text-primary" />
                        {qz.questionsCount} Questions • {qz.durationMinutes} Mins
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark fw-bold px-2 py-1">
                        {qz.passPercentage}%
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">
                        {qz.totalAttempts} attempts
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success fw-bold px-2 py-1">
                        {qz.averageScore}%
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success fw-semibold">
                        {qz.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <Link
                          to={all_routes.instructorQuizResult}
                          className="ins-btn ins-btn-ghost px-2 py-1"
                          title="View Scholar Results"
                        >
                          <i className="feather-bar-chart-2 me-1" /> Results
                        </Link>
                        <button
                          type="button"
                          className="ins-btn ins-btn-ghost text-danger px-2 py-1"
                          onClick={() => setDeleteTarget(qz)}
                          title="Delete Quiz"
                        >
                          <i className="feather-trash-2" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4">
          <Pagination
            page={pager.page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={pager.setPage}
            noun="quizzes"
          />
        </div>
      </SectionCard>

      {/* Modal: Create Quiz */}
      <Modal
        open={createOpen}
        title="Create New Moodle Quiz Bank"
        subtitle="Open University of Tanzania Automated Continuous Assessment Engine"
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        submitLabel="Publish Quiz"
        submitting={submitting}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Course *
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
              Duration (Minutes) *
            </label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={formDuration}
              onChange={(e) => setFormDuration(Number(e.target.value) || 30)}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Quiz Title *
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Distributed Consensus & Raft Protocol Mastery Assessment"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Number of Questions
            </label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={formQuestions}
              onChange={(e) => setFormQuestions(Number(e.target.value) || 10)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Passing Threshold (%)
            </label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={formPass}
              onChange={(e) => setFormPass(Number(e.target.value) || 70)}
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Confirm Delete */}
      <Modal
        open={!!deleteTarget}
        title="Confirm Quiz Removal"
        subtitle="This action will delete the quiz assessment"
        onClose={() => setDeleteTarget(null)}
        onSubmit={handleDelete}
        submitLabel="Delete Quiz"
        submitting={submitting}
      >
        <p className="text-muted mb-0" style={{ fontSize: 13 }}>
          Are you sure you want to remove <strong>{deleteTarget?.title}</strong>? Historical student attempt marks will remain in the gradebook.
        </p>
      </Modal>
    </div>
  );
};

export default InstructorQuiz;
