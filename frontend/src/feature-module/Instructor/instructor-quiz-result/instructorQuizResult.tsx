import React, { useEffect, useMemo, useState } from 'react';
import { instructorService, InstructorQuizResultItem } from '../../../core/api/instructorService';
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

const InstructorQuizResult: React.FC = () => {
  const shell = useInstructorShell();
  const [results, setResults] = useState<InstructorQuizResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Adjust mark modal
  const [adjustTarget, setAdjustTarget] = useState<InstructorQuizResultItem | null>(null);
  const [adjustScore, setAdjustScore] = useState(75);
  const [adjustRemarks, setAdjustRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const notify = shell?.notify ?? ((m: string) => window.alert(m));

  const loadResults = async () => {
    setLoading(true);
    try {
      const list = await instructorService.fetchQuizResults();
      setResults(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return results.filter((r) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'passed' && r.status === 'Passed') ||
        (statusFilter === 'failed' && r.status === 'Failed');
      const matchSearch =
        !q ||
        r.studentName.toLowerCase().includes(q) ||
        r.regNumber.toLowerCase().includes(q) ||
        r.quizTitle.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [results, searchQuery, statusFilter]);

  const pager = usePaged(filtered, PAGE_SIZE, [searchQuery, statusFilter]);

  const passedCount = results.filter((r) => r.status === 'Passed').length;
  const failedCount = results.filter((r) => r.status === 'Failed').length;
  const avgScore = results.length
    ? Math.round(results.reduce((acc, r) => acc + (r.score || 0), 0) / results.length)
    : 72;

  const handleExport = () => {
    exportToCsv(
      'OUT_Quiz_Results',
      filtered.map((r) => ({
        Attempt_ID: r.id,
        Scholar: r.studentName,
        Registration_No: r.regNumber,
        Quiz: r.quizTitle,
        Score: `${r.score}%`,
        Status: r.status,
        Attempt_Date: r.attemptDate,
        Remarks: r.remarks,
      }))
    );
  };

  const handleOpenAdjust = (r: InstructorQuizResultItem) => {
    setAdjustTarget(r);
    setAdjustScore(r.score);
    setAdjustRemarks(r.remarks || 'Score updated following post-exam verification.');
  };

  const handleSaveAdjust = async () => {
    if (!adjustTarget) return;
    setSubmitting(true);
    try {
      const res = await instructorService.adjustQuizMark(
        adjustTarget.id,
        adjustScore,
        adjustRemarks
      );
      if (res.success) {
        notify(`Mark updated to ${adjustScore}% for ${adjustTarget.studentName}.`);
        setAdjustTarget(null);
        await loadResults();
      } else {
        notify(res.message || 'Failed to adjust mark.');
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
          label="Total Attempts Logged"
          value={results.length}
          unit="Attempts"
          hint="Automated grading records"
          icon="isax isax-clipboard-text5"
          tone="primary"
        />
        <KpiCard
          label="Mean Cohort Score"
          value={`${avgScore}%`}
          unit="Average"
          hint="Across all academic tests"
          icon="isax isax-medal-star5"
          tone="info"
        />
        <KpiCard
          label="Pass Rate"
          value={results.length ? `${Math.round((passedCount / results.length) * 100)}%` : '80%'}
          unit="Passed"
          hint={`${passedCount} scholars passed threshold`}
          icon="isax isax-award5"
          tone="success"
        />
        <KpiCard
          label="Retake Required"
          value={failedCount}
          unit="Scholars"
          hint="Score below 70% threshold"
          icon="isax isax-danger5"
          tone="warning"
        />
      </KpiGrid>

      {/* Main Table Card */}
      <SectionCard
        title="Scholar Quiz Attempts & Assessment Records"
        subtitle="Review automated test submissions, analyze question outcomes, and adjust marks for official grade audit"
        actions={
          <button type="button" className="ins-btn ins-btn-ghost" onClick={handleExport}>
            <i className="feather-download" /> Export CSV
          </button>
        }
      >
        {/* Search & Filters */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search attempts by scholar name, reg #, or quiz title..."
          />
          <FilterPills
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Attempts', count: results.length },
              { value: 'passed', label: 'Passed', count: passedCount },
              { value: 'failed', label: 'Failed / Retake', count: failedCount },
            ]}
          />
        </div>

        {loading ? (
          <LoadingState text="Loading scholar quiz logs..." />
        ) : filtered.length === 0 ? (
          <EmptyState text="No quiz attempts match your criteria." />
        ) : (
          <div className="table-responsive">
            <table className="table ins-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Scholar</th>
                  <th>Registration No</th>
                  <th>Quiz Assessment</th>
                  <th>Recorded Mark</th>
                  <th>Attempt Timestamp</th>
                  <th>Examiner Remarks</th>
                  <th>Outcome</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {pager.slice.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="fw-bold text-dark" style={{ fontSize: 13.5 }}>
                        {r.studentName}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark fw-bold" style={{ fontSize: 11.5 }}>
                        {r.regNumber}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark" style={{ fontSize: 12.5 }}>
                        {r.quizTitle}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === 'Passed'
                            ? 'bg-success-subtle text-success'
                            : 'bg-danger-subtle text-danger'
                        } fw-bold px-2 py-1`}
                        style={{ fontSize: 13 }}
                      >
                        {r.score}%
                      </span>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        {r.attemptDate}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <span className="text-muted text-truncate d-inline-block" style={{ fontSize: 12, maxWidth: 200 }} title={r.remarks}>
                        {r.remarks || 'Standard automated grading.'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === 'Passed'
                            ? 'bg-success-subtle text-success'
                            : 'bg-danger-subtle text-danger'
                        } fw-bold px-2 py-1`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="ins-btn ins-btn-ghost px-2.5 py-1"
                        onClick={() => handleOpenAdjust(r)}
                      >
                        <i className="feather-edit me-1" /> Remark
                      </button>
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
            noun="attempts"
          />
        </div>
      </SectionCard>

      {/* Modal: Remark / Adjust Mark */}
      <Modal
        open={!!adjustTarget}
        title={`Remark Quiz Attempt: ${adjustTarget?.studentName || ''}`}
        subtitle={`Assessment: ${adjustTarget?.quizTitle} • Current: ${adjustTarget?.score}%`}
        onClose={() => setAdjustTarget(null)}
        onSubmit={handleSaveAdjust}
        submitLabel="Commit Adjusted Mark"
        submitting={submitting}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Adjusted Score (0 - 100) *
            </label>
            <div className="input-group input-group-sm">
              <input
                type="number"
                min={0}
                max={100}
                className="form-control"
                value={adjustScore}
                onChange={(e) => setAdjustScore(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                required
              />
              <span className="input-group-text">%</span>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Updated Result
            </label>
            <div className="p-2 rounded bg-light border text-center fw-bold" style={{ fontSize: 13 }}>
              {adjustScore >= 70 ? (
                <span className="text-success">Passed Threshold (≥70%)</span>
              ) : (
                <span className="text-danger">Failed Threshold (&lt;70%)</span>
              )}
            </div>
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Examiner Adjustment Remarks *
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={3}
              value={adjustRemarks}
              placeholder="State the academic justification for the remark (e.g. verified question ambiguity)..."
              onChange={(e) => setAdjustRemarks(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InstructorQuizResult;
