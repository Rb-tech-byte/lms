import React, { useEffect, useMemo, useState } from 'react';
import { instructorService, EnrolledStudentItem } from '../../../core/api/instructorService';
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

const StudentList: React.FC = () => {
  const shell = useInstructorShell();
  const [students, setStudents] = useState<EnrolledStudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [enrolOpen, setEnrolOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EnrolledStudentItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrolledStudentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Enrol form
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formReg, setFormReg] = useState('');
  const [formCourseId, setFormCourseId] = useState(2);
  const [formCity, setFormCity] = useState('Dar es Salaam');

  // Edit status form
  const [editStatus, setEditStatus] = useState<'Active' | 'Completed' | 'At Risk'>('Active');
  const [editGrade, setEditGrade] = useState('');
  const [editProgress, setEditProgress] = useState(75);

  const notify = shell?.notify ?? ((m: string) => window.alert(m));

  const loadStudents = async () => {
    setLoading(true);
    try {
      const list = await instructorService.fetchEnrolledStudents();
      setStudents(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return students.filter((s) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && s.status === 'Active') ||
        (statusFilter === 'completed' && s.status === 'Completed') ||
        (statusFilter === 'at_risk' && s.status === 'At Risk');
      const matchSearch =
        !q ||
        s.fullname.toLowerCase().includes(q) ||
        s.regNumber.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.courseName || '').toLowerCase().includes(q) ||
        (s.city || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [students, searchQuery, statusFilter]);

  const pager = usePaged(filtered, PAGE_SIZE, [searchQuery, statusFilter]);

  const handleExport = () => {
    exportToCsv(
      'OUT_Enrolled_Scholars',
      filtered.map((s) => ({
        ID: s.id,
        Scholar_Name: s.fullname,
        Registration_No: s.regNumber,
        Email: s.email,
        Course: s.courseName,
        Progress: `${s.progressPercent}%`,
        Grade: s.grade,
        Regional_Center: s.city || 'Dar es Salaam',
        Standing: s.status,
      }))
    );
  };

  const handleEnrol = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      notify('Please provide both scholar full name and institutional email.');
      return;
    }
    setSubmitting(true);
    try {
      const courseMap: Record<number, { code: string; name: string }> = {
        2: { code: 'CS101', name: 'Data Structures & Algorithms in Python' },
        3: { code: 'CS202', name: 'Cloud Computing & Distributed Systems' },
        4: { code: 'BBA301', name: 'Financial Management & Strategic Planning' },
      };
      const c = courseMap[formCourseId] || courseMap[2];
      const res = await instructorService.enrolStudent({
        fullname: formName.trim(),
        email: formEmail.trim(),
        regNumber: formReg.trim() || `OUT/2024/0${Math.floor(4800 + Math.random() * 99)}`,
        courseId: formCourseId,
        courseCode: c.code,
        courseName: c.name,
        city: formCity,
      });
      if (res.success) {
        notify('Scholar registered and enrolled in Moodle cohort.');
        setEnrolOpen(false);
        setFormName('');
        setFormEmail('');
        setFormReg('');
        await loadStudents();
      } else {
        notify(res.message || 'Failed to enrol scholar.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      const res = await instructorService.updateStudentStatus(
        editTarget.id,
        editStatus,
        editGrade,
        editProgress
      );
      if (res.success) {
        notify('Scholar academic standing updated.');
        setEditTarget(null);
        await loadStudents();
      } else {
        notify(res.message || 'Failed to update standing.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnenrol = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await instructorService.unenrolStudent(deleteTarget.id);
      if (res.success) {
        notify('Scholar unenrolled from course.');
        setDeleteTarget(null);
        await loadStudents();
      } else {
        notify(res.message || 'Failed to unenrol scholar.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (s: EnrolledStudentItem) => {
    setEditTarget(s);
    setEditStatus(s.status);
    setEditGrade(s.grade);
    setEditProgress(s.progressPercent || 75);
  };

  const activeCount = students.filter((s) => s.status === 'Active').length;
  const completedCount = students.filter((s) => s.status === 'Completed').length;
  const atRiskCount = students.filter((s) => s.status === 'At Risk').length;

  return (
    <div className="ins-page">
      {/* KPI Overview */}
      <KpiGrid>
        <KpiCard
          label="Total Scholars"
          value={students.length}
          unit="Enrolled"
          hint="Undergraduate & Postgraduate"
          icon="isax isax-profile-2user5"
          tone="primary"
        />
        <KpiCard
          label="Distinction Completed"
          value={completedCount}
          unit="Graduated"
          hint="Completed all modular units"
          icon="isax isax-award5"
          tone="success"
        />
        <KpiCard
          label="Active In Study"
          value={activeCount}
          unit="Current"
          hint="Attending live lectures & labs"
          icon="isax isax-book-saved5"
          tone="info"
        />
        <KpiCard
          label="Scholars At Risk"
          value={atRiskCount}
          unit="Alert"
          hint="Progress < 50% or Grade < 60%"
          icon="isax isax-danger5"
          tone="warning"
        />
      </KpiGrid>

      {/* Main Table Card */}
      <SectionCard
        title="Supervised Scholars Directory"
        subtitle="Manage academic progress, attendance tracking, and modular grade submissions across regions"
        actions={
          <div className="d-flex align-items-center gap-2">
            <button type="button" className="ins-btn ins-btn-ghost" onClick={handleExport}>
              <i className="feather-download" /> Export CSV
            </button>
            <button
              type="button"
              className="ins-btn ins-btn-primary"
              onClick={() => setEnrolOpen(true)}
            >
              <i className="feather-user-plus" /> Enrol Scholar
            </button>
          </div>
        }
      >
        {/* Search & Filters */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by scholar name, registration #, email, or city..."
          />
          <FilterPills
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Scholars', count: students.length },
              { value: 'active', label: 'Active', count: activeCount },
              { value: 'completed', label: 'Completed', count: completedCount },
              { value: 'at_risk', label: 'At Risk', count: atRiskCount },
            ]}
          />
        </div>

        {loading ? (
          <LoadingState text="Loading enrolled scholar roster..." />
        ) : filtered.length === 0 ? (
          <EmptyState text="No scholars match your search criteria." />
        ) : (
          <div className="table-responsive">
            <table className="table ins-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Scholar Identity</th>
                  <th>Registration No</th>
                  <th>Enrolled Programme</th>
                  <th>Regional Center</th>
                  <th>Progress</th>
                  <th>Grade Standing</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pager.slice.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2.5">
                        <img
                          src={s.avatar || '/assets/img/user/user-02.jpg'}
                          alt={s.fullname}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1.5px solid #0171bb',
                          }}
                        />
                        <div>
                          <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>
                            {s.fullname}
                          </div>
                          <small className="text-muted" style={{ fontSize: 11.5 }}>
                            {s.email}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark fw-bold" style={{ fontSize: 11.5 }}>
                        {s.regNumber}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark" style={{ fontSize: 12.5 }}>
                        {s.courseName}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        <i className="feather-map-pin me-1 text-primary" />
                        {s.city || 'Dar es Salaam'}
                      </span>
                    </td>
                    <td style={{ minWidth: 120 }}>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="progress flex-grow-1"
                          style={{ height: 6, borderRadius: 3 }}
                        >
                          <div
                            className={`progress-bar ${
                              s.progressPercent >= 80
                                ? 'bg-success'
                                : s.progressPercent >= 50
                                ? 'bg-primary'
                                : 'bg-danger'
                            }`}
                            style={{ width: `${s.progressPercent}%` }}
                          />
                        </div>
                        <span className="fw-bold" style={{ fontSize: 11.5 }}>
                          {s.progressPercent}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          s.grade.includes('Grade A') || s.grade.includes('Grade B+')
                            ? 'bg-success-subtle text-success'
                            : s.grade.includes('Grade B')
                            ? 'bg-primary-subtle text-primary'
                            : 'bg-danger-subtle text-danger'
                        } fw-bold px-2 py-1`}
                      >
                        {s.grade}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          s.status === 'Completed'
                            ? 'bg-success-subtle text-success'
                            : s.status === 'Active'
                            ? 'bg-primary-subtle text-primary'
                            : 'bg-danger-subtle text-danger'
                        } fw-bold px-2 py-1`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          type="button"
                          className="ins-btn ins-btn-ghost px-2 py-1"
                          onClick={() => openEdit(s)}
                          title="Update Standing"
                        >
                          <i className="feather-edit-2" />
                        </button>
                        <button
                          type="button"
                          className="ins-btn ins-btn-ghost text-danger px-2 py-1"
                          onClick={() => setDeleteTarget(s)}
                          title="Unenrol Scholar"
                        >
                          <i className="feather-user-x" />
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
            noun="scholars"
          />
        </div>
      </SectionCard>

      {/* Modal: Enrol Scholar */}
      <Modal
        open={enrolOpen}
        title="Enrol Scholar into Faculty Course"
        subtitle="Open University of Tanzania Directorate of Academic Affairs"
        onClose={() => setEnrolOpen(false)}
        onSubmit={handleEnrol}
        submitLabel="Register Scholar"
        submitting={submitting}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Scholar Full Name *
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Happiness Mtweve"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Email Address *
            </label>
            <input
              type="email"
              className="form-control form-control-sm"
              placeholder="e.g. happiness.mtweve@out.ac.tz"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Registration Number
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. OUT/2024/04888"
              value={formReg}
              onChange={(e) => setFormReg(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Regional Center
            </label>
            <select
              className="form-select form-select-sm"
              value={formCity}
              onChange={(e) => setFormCity(e.target.value)}
            >
              <option value="Dar es Salaam">Dar es Salaam (Kinondoni Center)</option>
              <option value="Arusha">Arusha Regional Center</option>
              <option value="Mwanza">Mwanza Regional Center</option>
              <option value="Dodoma">Dodoma Capital Center</option>
              <option value="Zanzibar">Zanzibar Regional Center</option>
              <option value="Moshi">Moshi Regional Center</option>
            </select>
          </div>
          <div className="col-12">
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
        </div>
      </Modal>

      {/* Modal: Update Standing */}
      <Modal
        open={!!editTarget}
        title={`Update Academic Standing: ${editTarget?.fullname || ''}`}
        subtitle={`Registration: ${editTarget?.regNumber} • Course: ${editTarget?.courseName}`}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdateStatus}
        submitLabel="Commit Academic Update"
        submitting={submitting}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Enrollment Status
            </label>
            <select
              className="form-select form-select-sm"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as any)}
            >
              <option value="Active">Active — Attending Classes</option>
              <option value="Completed">Completed — Graduated / Certified</option>
              <option value="At Risk">At Risk — Needs Intervention</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Curriculum Progress ({editProgress}%)
            </label>
            <input
              type="range"
              className="form-range"
              min={0}
              max={100}
              value={editProgress}
              onChange={(e) => setEditProgress(Number(e.target.value))}
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Recorded Grade & Academic Standing
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={editGrade}
              placeholder="e.g. 88.0% (Grade A-)"
              onChange={(e) => setEditGrade(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Unenrol Scholar */}
      <Modal
        open={!!deleteTarget}
        title="Confirm Scholar Unenrollment"
        subtitle="This action will remove the scholar from the course roster"
        onClose={() => setDeleteTarget(null)}
        onSubmit={handleUnenrol}
        submitLabel="Unenrol Scholar"
        submitting={submitting}
      >
        <p className="text-muted mb-0" style={{ fontSize: 13 }}>
          Are you sure you want to unenrol <strong>{deleteTarget?.fullname}</strong> ({deleteTarget?.regNumber}) from{' '}
          <strong>{deleteTarget?.courseName}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default StudentList;
