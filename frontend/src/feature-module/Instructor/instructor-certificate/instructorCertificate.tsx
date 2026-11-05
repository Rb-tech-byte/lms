import React, { useEffect, useMemo, useState } from 'react';
import { instructorService, InstructorCertificateItem } from '../../../core/api/instructorService';
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

const InstructorCertificate: React.FC = () => {
  const shell = useInstructorShell();
  const [certificates, setCertificates] = useState<InstructorCertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [issueOpen, setIssueOpen] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<InstructorCertificateItem | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<InstructorCertificateItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formStudent, setFormStudent] = useState('Baraka Mkwawa');
  const [formStudentId] = useState(3);
  const [formCourseId, setFormCourseId] = useState(2);
  const [formGrade, setFormGrade] = useState('85.0% (Grade B+)');
  const [formHonors, setFormHonors] = useState('First Class Distinction');

  const notify = shell?.notify ?? ((m: string) => window.alert(m));

  const loadCerts = async () => {
    setLoading(true);
    try {
      const list = await instructorService.fetchCertificates();
      setCertificates(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCerts();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return certificates.filter((c) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'verified' && c.status === 'Verified') ||
        (statusFilter === 'revoked' && c.status === 'Revoked');
      const matchSearch =
        !q ||
        c.studentName.toLowerCase().includes(q) ||
        c.certificateCode.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q) ||
        c.courseCode.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [certificates, searchQuery, statusFilter]);

  const pager = usePaged(filtered, PAGE_SIZE, [searchQuery, statusFilter]);

  const handleExport = () => {
    exportToCsv(
      'OUT_Issued_Certificates',
      filtered.map((c) => ({
        Certificate_Code: c.certificateCode,
        Scholar: c.studentName,
        Course: c.courseName,
        Grade: c.grade,
        Honors: c.honors,
        Issued_Date: c.issuedAt,
        Status: c.status,
      }))
    );
  };

  const handleIssue = async () => {
    setSubmitting(true);
    try {
      const courseMap: Record<number, { code: string; name: string }> = {
        2: { code: 'CS101', name: 'Data Structures & Algorithms in Python' },
        3: { code: 'CS202', name: 'Cloud Computing & Distributed Systems' },
        4: { code: 'BBA301', name: 'Financial Management & Strategic Planning' },
      };
      const info = courseMap[formCourseId] || courseMap[2];
      const res = await instructorService.issueCertificate({
        studentId: formStudentId,
        studentName: formStudent,
        courseId: formCourseId,
        courseCode: info.code,
        courseName: info.name,
        grade: formGrade,
        honors: formHonors,
      });
      if (res.success) {
        notify('Certificate conferred and registered with OUT Verification Portal.');
        setIssueOpen(false);
        await loadCerts();
      } else {
        notify(res.message || 'Failed to issue certificate.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setSubmitting(true);
    try {
      const res = await instructorService.revokeCertificate(revokeTarget.id);
      if (res.success) {
        notify('Certificate revoked.');
        setRevokeTarget(null);
        await loadCerts();
      } else {
        notify(res.message || 'Failed to revoke certificate.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const verifiedCount = certificates.filter((c) => c.status === 'Verified').length;

  return (
    <div className="ins-page">
      {/* KPI Overview */}
      <KpiGrid>
        <KpiCard
          label="Conferred Certificates"
          value={certificates.length}
          unit="Diplomas"
          hint="TCU accredited qualifications"
          icon="isax isax-award5"
          tone="primary"
        />
        <KpiCard
          label="Verified Status"
          value={verifiedCount}
          unit="Active"
          hint="Public cryptographic validation"
          icon="isax isax-tick-circle5"
          tone="success"
        />
        <KpiCard
          label="Honors Distinction"
          value={certificates.filter((c) => c.honors.includes('Distinction') || c.honors.includes('Dean')).length}
          unit="Scholars"
          hint="First Class / Dean's List"
          icon="isax isax-medal-star5"
          tone="warning"
        />
        <KpiCard
          label="QR Verification Portal"
          value="Online"
          hint="Instant employer verification"
          icon="isax isax-scan-barcode5"
          tone="info"
        />
      </KpiGrid>

      {/* Main Table Card */}
      <SectionCard
        title="Official Academic Certificates Registry"
        subtitle="Issue, cryptographically verify, and audit Open University of Tanzania degree & modular course awards"
        actions={
          <div className="d-flex align-items-center gap-2">
            <button type="button" className="ins-btn ins-btn-ghost" onClick={handleExport}>
              <i className="feather-download" /> Export CSV
            </button>
            <button
              type="button"
              className="ins-btn ins-btn-primary"
              onClick={() => setIssueOpen(true)}
            >
              <i className="feather-plus" /> Issue Certificate
            </button>
          </div>
        }
      >
        {/* Search & Filters */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by certificate code, scholar name, or course..."
          />
          <FilterPills
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Certificates', count: certificates.length },
              { value: 'verified', label: 'Verified', count: verifiedCount },
              { value: 'revoked', label: 'Revoked' },
            ]}
          />
        </div>

        {loading ? (
          <LoadingState text="Loading certificate registry..." />
        ) : filtered.length === 0 ? (
          <EmptyState text="No certificates match your search query." />
        ) : (
          <div className="table-responsive">
            <table className="table ins-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Certificate Identifier</th>
                  <th>Conferred Scholar</th>
                  <th>Accredited Programme</th>
                  <th>Grade Achieved</th>
                  <th>Honors Level</th>
                  <th>Date Issued</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pager.slice.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="badge bg-light text-primary font-monospace fw-bold px-2 py-1" style={{ fontSize: 12 }}>
                        {c.certificateCode}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark" style={{ fontSize: 13.5 }}>
                        {c.studentName}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary fw-bold me-1">
                        {c.courseCode}
                      </span>
                      <span className="text-muted" style={{ fontSize: 12.5 }}>
                        {c.courseName}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark" style={{ fontSize: 12.5 }}>
                        {c.grade}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-warning-subtle text-warning fw-bold px-2 py-0.5" style={{ fontSize: 11 }}>
                        <i className="feather-award me-1" />
                        {c.honors}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        {c.issuedAt}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          c.status === 'Verified'
                            ? 'bg-success-subtle text-success'
                            : 'bg-danger-subtle text-danger'
                        } fw-bold px-2 py-1`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          type="button"
                          className="ins-btn ins-btn-ghost px-2 py-1"
                          onClick={() => setPreviewTarget(c)}
                          title="Preview Certificate"
                        >
                          <i className="feather-eye me-1" /> View
                        </button>
                        {c.status === 'Verified' && (
                          <button
                            type="button"
                            className="ins-btn ins-btn-ghost text-danger px-2 py-1"
                            onClick={() => setRevokeTarget(c)}
                            title="Revoke Certificate"
                          >
                            <i className="feather-slash" />
                          </button>
                        )}
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
            noun="certificates"
          />
        </div>
      </SectionCard>

      {/* Modal: Preview Certificate */}
      <Modal
        open={!!previewTarget}
        title="Official Academic Certificate Preview"
        subtitle={`Verification Identifier: ${previewTarget?.certificateCode}`}
        onClose={() => setPreviewTarget(null)}
        submitLabel="Print / Download PDF"
        onSubmit={() => window.print()}
      >
        <div
          className="p-4 rounded-3 border text-center bg-white shadow-sm"
          style={{
            border: '3px double #0171bb',
            position: 'relative',
            background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)',
          }}
        >
          <div className="mb-3">
            <img
              src="/assets/img/logo.svg"
              alt="Open University of Tanzania"
              style={{ height: 56, objectFit: 'contain' }}
            />
          </div>
          <h4 className="fw-bold text-primary mb-1 text-uppercase" style={{ letterSpacing: 1.5, fontSize: 16 }}>
            The Open University of Tanzania
          </h4>
          <p className="text-muted small mb-3">Directoriate of Academic Affairs &amp; Examinations</p>
          <p className="text-muted small mb-2">This is to certify that</p>
          <h3 className="fw-bold text-dark mb-2" style={{ fontFamily: 'serif', fontSize: 22 }}>
            {previewTarget?.studentName}
          </h3>
          <p className="text-muted small mb-2">has successfully completed the prescribed curriculum for</p>
          <h5 className="fw-bold text-primary mb-2" style={{ fontSize: 16 }}>
            {previewTarget?.courseName} ({previewTarget?.courseCode})
          </h5>
          <p className="text-dark fw-bold mb-3" style={{ fontSize: 13 }}>
            Passed with {previewTarget?.grade} • Awarded {previewTarget?.honors}
          </p>
          <div className="d-flex justify-content-between align-items-end pt-3 border-top mt-4 text-start">
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: 12 }}>
                Dr. Amina Kilindo
              </div>
              <small className="text-muted">Course Director &amp; Examiner</small>
            </div>
            <div className="text-center">
              <span className="badge bg-success-subtle text-success fw-bold px-2 py-1">
                ✓ Cryptographically Verified
              </span>
              <div className="text-muted font-monospace mt-1" style={{ fontSize: 10 }}>
                {previewTarget?.certificateCode}
              </div>
            </div>
            <div className="text-end">
              <div className="fw-bold text-dark" style={{ fontSize: 12 }}>
                Prof. E. Mushi
              </div>
              <small className="text-muted">Dean of Faculty</small>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Issue Certificate */}
      <Modal
        open={issueOpen}
        title="Confer Official Academic Certificate"
        subtitle="Open University of Tanzania Examination Senate Registry"
        onClose={() => setIssueOpen(false)}
        onSubmit={handleIssue}
        submitLabel="Confer Certificate"
        submitting={submitting}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Scholar Name *
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formStudent}
              onChange={(e) => setFormStudent(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Target Academic Course *
            </label>
            <select
              className="form-select form-select-sm"
              value={formCourseId}
              onChange={(e) => setFormCourseId(Number(e.target.value))}
            >
              <option value={2}>CS101: Data Structures & Algorithms in Python</option>
              <option value={3}>CS202: Cloud Computing & Distributed Systems</option>
              <option value={4}>BBA301: Financial Management & Strategic Planning</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Final Recorded Grade *
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formGrade}
              placeholder="e.g. 88.5% (Grade A)"
              onChange={(e) => setFormGrade(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Academic Honors Distinction
            </label>
            <select
              className="form-select form-select-sm"
              value={formHonors}
              onChange={(e) => setFormHonors(e.target.value)}
            >
              <option value="First Class Distinction">First Class Distinction (≥80%)</option>
              <option value="Dean's List of Academic Excellence">Dean's List of Academic Excellence</option>
              <option value="Merit Distinction">Merit Distinction (70% - 79%)</option>
              <option value="Standard Pass">Standard Pass</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Modal: Revoke */}
      <Modal
        open={!!revokeTarget}
        title="Revoke Certificate Award"
        subtitle="This action will invalidate the certificate in the public verification register"
        onClose={() => setRevokeTarget(null)}
        onSubmit={handleRevoke}
        submitLabel="Revoke Certificate"
        submitting={submitting}
      >
        <p className="text-muted mb-0" style={{ fontSize: 13 }}>
          Are you sure you want to revoke certificate <strong>{revokeTarget?.certificateCode}</strong> issued to{' '}
          <strong>{revokeTarget?.studentName}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default InstructorCertificate;
