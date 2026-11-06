import React, { useEffect, useMemo, useState } from 'react';
import { instructorService, InstructorAnnouncementItem } from '../../../core/api/instructorService';
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

const PAGE_SIZE = 5;

const InstructorAnnouncements: React.FC = () => {
  const shell = useInstructorShell();
  const [announcements, setAnnouncements] = useState<InstructorAnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Broadcast modal state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InstructorAnnouncementItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formCourseId, setFormCourseId] = useState(2);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPriority, setFormPriority] = useState<'Normal' | 'High'>('Normal');

  const notify = shell?.notify ?? ((m: string) => window.alert(m));

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const list = await instructorService.fetchAnnouncements();
      setAnnouncements(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return announcements.filter((a) => {
      const matchPriority =
        priorityFilter === 'all' ||
        (priorityFilter === 'high' && a.priority === 'High') ||
        (priorityFilter === 'normal' && a.priority === 'Normal');
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.courseName.toLowerCase().includes(q);
      return matchPriority && matchSearch;
    });
  }, [announcements, searchQuery, priorityFilter]);

  const pager = usePaged(filtered, PAGE_SIZE, [searchQuery, priorityFilter]);

  const handleExport = () => {
    exportToCsv(
      'OUT_Faculty_Announcements',
      filtered.map((a) => ({
        ID: a.id,
        Course: a.courseName,
        Subject: a.title,
        Priority: a.priority,
        Date_Published: a.date,
        Message: a.content,
      }))
    );
  };

  const handleBroadcast = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      notify('Please provide both announcement subject and message content.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await instructorService.createAnnouncement({
        courseId: Number(formCourseId),
        title: formTitle.trim(),
        content: formContent.trim(),
        priority: formPriority,
      });
      if (res.success) {
        notify('Announcement broadcasted successfully to all enrolled scholars.');
        setBroadcastOpen(false);
        setFormTitle('');
        setFormContent('');
        setFormPriority('Normal');
        await loadAnnouncements();
      } else {
        notify(res.message || 'Failed to broadcast announcement.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await instructorService.deleteAnnouncement(deleteTarget.id);
      if (res.success) {
        notify('Announcement removed.');
        setDeleteTarget(null);
        await loadAnnouncements();
      } else {
        notify(res.message || 'Failed to remove announcement.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const highPriorityCount = announcements.filter((a) => a.priority === 'High').length;

  return (
    <div className="ins-page">
      {/* KPI Overview */}
      <KpiGrid>
        <KpiCard
          label="Total Broadcasts"
          value={announcements.length}
          unit="Notices"
          hint="Published across modules"
          icon="isax isax-volume-high5"
          tone="primary"
        />
        <KpiCard
          label="High Priority"
          value={highPriorityCount}
          unit="Alerts"
          hint="Flagged for immediate review"
          icon="isax isax-danger5"
          tone="warning"
        />
        <KpiCard
          label="Target Audience"
          value="9 Scholars"
          hint="Undergraduate & Postgraduate"
          icon="isax isax-profile-2user5"
          tone="success"
        />
        <KpiCard
          label="Dispatch Channel"
          value="Moodle + SMS"
          hint="Synchronized delivery"
          icon="isax isax-messages-35"
          tone="info"
        />
      </KpiGrid>

      {/* Main Announcements Card */}
      <SectionCard
        title="Faculty Announcements & Circulars"
        subtitle="Broadcast urgent exam schedules, laboratory guidelines, and video seminar invites"
        actions={
          <div className="d-flex align-items-center gap-2">
            <button type="button" className="ins-btn ins-btn-ghost" onClick={handleExport}>
              <i className="feather-download" /> Export CSV
            </button>
            <button
              type="button"
              className="ins-btn ins-btn-primary"
              onClick={() => setBroadcastOpen(true)}
            >
              <i className="feather-send" /> Broadcast Notice
            </button>
          </div>
        }
      >
        {/* Search & Filters */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search circulars by subject, keyword, or course..."
          />
          <FilterPills
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'all', label: 'All Notices', count: announcements.length },
              { value: 'high', label: 'High Priority', count: highPriorityCount },
              { value: 'normal', label: 'Normal Priority' },
            ]}
          />
        </div>

        {loading ? (
          <LoadingState text="Fetching faculty circulars..." />
        ) : filtered.length === 0 ? (
          <EmptyState text="No announcements match your search or priority filter." />
        ) : (
          <div className="d-flex flex-column gap-3">
            {pager.slice.map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 rounded-3 border bg-white shadow-sm transition"
                style={{
                  borderLeft:
                    ann.priority === 'High'
                      ? '4px solid #ef4444'
                      : '4px solid #013ba6',
                }}
              >
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span
                        className={`badge ${
                          ann.priority === 'High'
                            ? 'bg-danger-subtle text-danger'
                            : 'bg-primary-subtle text-primary'
                        } fw-bold px-2 py-0.5`}
                        style={{ fontSize: 11 }}
                      >
                        {ann.priority === 'High' ? 'HIGH PRIORITY' : 'CIRCULAR'}
                      </span>
                      <span className="badge bg-light text-dark fw-semibold px-2 py-0.5" style={{ fontSize: 11 }}>
                        {ann.courseName}
                      </span>
                      <span className="text-muted" style={{ fontSize: 11.5 }}>
                        <i className="feather-calendar me-1" />
                        {ann.date}
                      </span>
                    </div>
                    <h5 className="fw-bold text-dark mb-1" style={{ fontSize: 15 }}>
                      {ann.title}
                    </h5>
                  </div>
                  <button
                    type="button"
                    className="ins-action-btn is-delete"
                    onClick={() => setDeleteTarget(ann)}
                    title="Remove announcement"
                  >
                    <i className="feather-trash-2" />
                  </button>
                </div>
                <p className="text-muted mb-0" style={{ fontSize: 13, lineHeight: 1.6 }}>
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4">
          <Pagination
            page={pager.page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={pager.setPage}
            noun="announcements"
          />
        </div>
      </SectionCard>

      {/* Modal: Broadcast Notice */}
      <Modal
        open={broadcastOpen}
        title="Broadcast New Notice to Scholars"
        subtitle="Notification will appear in student dashboards and dispatch via Moodle notifications"
        onClose={() => setBroadcastOpen(false)}
        onSubmit={handleBroadcast}
        submitLabel="Broadcast Notice"
        submitting={submitting}
      >
        <div className="row g-3">
          <div className="col-md-7">
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
          <div className="col-md-5">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Priority Flag
            </label>
            <select
              className="form-select form-select-sm"
              value={formPriority}
              onChange={(e) => setFormPriority(e.target.value as 'Normal' | 'High')}
            >
              <option value="Normal">Normal — General Circular</option>
              <option value="High">High — Urgent / Examination</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Subject Title *
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Continuous Assessment Lab 3 Submission Requirements"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Announcement Body *
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={4}
              placeholder="Type your academic circular details, instructions, or meeting links..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Confirm Delete */}
      <Modal
        open={!!deleteTarget}
        title="Confirm Announcement Removal"
        subtitle="This notice will be archived from the scholar dashboard"
        onClose={() => setDeleteTarget(null)}
        onSubmit={handleDelete}
        submitLabel="Delete Announcement"
        submitting={submitting}
      >
        <p className="text-muted mb-0" style={{ fontSize: 13 }}>
          Are you sure you want to delete notice: <strong>{deleteTarget?.title}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default InstructorAnnouncements;
