import React, { useEffect, useMemo, useState } from 'react';
import { instructorService, InstructorTicketItem } from '../../../core/api/instructorService';
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

const InstructorTickets: React.FC = () => {
  const shell = useInstructorShell();
  const [tickets, setTickets] = useState<InstructorTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<InstructorTicketItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New ticket form
  const [formCategory, setFormCategory] = useState('Academic Advisory');
  const [formSubject, setFormSubject] = useState('');
  const [formPriority, setFormPriority] = useState('Normal');
  const [formDesc, setFormDesc] = useState('');

  const notify = shell?.notify ?? ((m: string) => window.alert(m));

  const loadTickets = async () => {
    setLoading(true);
    try {
      const list = await instructorService.fetchTickets();
      setTickets(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tickets.filter((t) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'open' && t.status === 'Open') ||
        (statusFilter === 'in_progress' && t.status === 'In Progress') ||
        (statusFilter === 'resolved' && t.status === 'Resolved');
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.studentName.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [tickets, searchQuery, statusFilter]);

  const pager = usePaged(filtered, PAGE_SIZE, [searchQuery, statusFilter]);

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const handleExport = () => {
    exportToCsv(
      'OUT_Faculty_Support_Tickets',
      filtered.map((t) => ({
        Ticket_ID: t.id,
        Subject: t.subject,
        Requester: t.studentName,
        Category: t.category,
        Priority: t.priority,
        Status: t.status,
        Date_Logged: t.date,
        Description: t.description,
      }))
    );
  };

  const handleCreate = async () => {
    if (!formSubject.trim() || !formDesc.trim()) {
      notify('Please provide both ticket subject and detailed description.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await instructorService.createTicket({
        subject: formSubject.trim(),
        category: formCategory,
        priority: formPriority,
        description: formDesc.trim(),
      });
      if (res.success) {
        notify('Support ticket logged with OUT ICT Helpdesk.');
        setCreateOpen(false);
        setFormSubject('');
        setFormDesc('');
        await loadTickets();
      } else {
        notify(res.message || 'Failed to create ticket.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!detailTarget) return;
    setSubmitting(true);
    try {
      const res = await instructorService.replyTicket(
        detailTarget.id,
        replyText.trim(),
        updateStatus || undefined
      );
      if (res.success) {
        notify('Ticket response recorded.');
        setDetailTarget(null);
        setReplyText('');
        await loadTickets();
      } else {
        notify(res.message || 'Failed to update ticket.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = (t: InstructorTicketItem) => {
    setDetailTarget(t);
    setUpdateStatus(t.status);
    setReplyText('');
  };

  return (
    <div className="ins-page">
      {/* KPI Overview */}
      <KpiGrid>
        <KpiCard
          label="Total Support Queue"
          value={tickets.length}
          unit="Tickets"
          hint="Scholar & Infrastructure Issues"
          icon="isax isax-ticket5"
          tone="primary"
        />
        <KpiCard
          label="Open / In Review"
          value={openCount + inProgressCount}
          unit="Active"
          hint="Requiring instructor response"
          icon="isax isax-clock5"
          tone="warning"
        />
        <KpiCard
          label="Resolved Tickets"
          value={resolvedCount}
          unit="Closed"
          hint="Solved within SLA"
          icon="isax isax-tick-circle5"
          tone="success"
        />
        <KpiCard
          label="Resolution SLA"
          value="< 24 Hours"
          hint="Faculty ICT Helpdesk benchmark"
          icon="isax isax-timer5"
          tone="info"
        />
      </KpiGrid>

      {/* Main Table Card */}
      <SectionCard
        title="Faculty Academic & Technical Support Queue"
        subtitle="Manage student inquiries on grading, BigBlueButton session links, and LMS laboratory access"
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
              <i className="feather-plus" /> Log New Ticket
            </button>
          </div>
        }
      >
        {/* Search & Filters */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search tickets by ticket ID, subject, or requester..."
          />
          <FilterPills
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Tickets', count: tickets.length },
              { value: 'open', label: 'Open', count: openCount },
              { value: 'in_progress', label: 'In Progress', count: inProgressCount },
              { value: 'resolved', label: 'Resolved', count: resolvedCount },
            ]}
          />
        </div>

        {loading ? (
          <LoadingState text="Loading support queue..." />
        ) : filtered.length === 0 ? (
          <EmptyState text="No support tickets match your search criteria." />
        ) : (
          <div className="table-responsive">
            <table className="table ins-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject & Summary</th>
                  <th>Requester</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Date Logged</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {pager.slice.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className="badge bg-light text-primary font-monospace fw-bold px-2 py-1">
                        {t.id}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>
                        {t.subject}
                      </div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: 280, fontSize: 11.5 }}>
                        {t.description}
                      </small>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark" style={{ fontSize: 13 }}>
                        {t.studentName}
                      </span>
                      <small className="text-muted d-block" style={{ fontSize: 11 }}>
                        {t.regNumber}
                      </small>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: 12.5 }}>
                        {t.category}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.priority === 'High'
                            ? 'bg-danger-subtle text-danger'
                            : 'bg-primary-subtle text-primary'
                        } fw-bold px-2 py-0.5`}
                        style={{ fontSize: 11 }}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        {t.date}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.status === 'Resolved'
                            ? 'bg-success-subtle text-success'
                            : t.status === 'In Progress'
                            ? 'bg-warning-subtle text-warning'
                            : 'bg-danger-subtle text-danger'
                        } fw-bold px-2 py-1`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="ins-btn ins-btn-ghost px-2 py-1"
                        onClick={() => openDetail(t)}
                      >
                        <i className="feather-message-square me-1" /> View / Reply
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
            noun="tickets"
          />
        </div>
      </SectionCard>

      {/* Modal: View / Reply Ticket */}
      <Modal
        open={!!detailTarget}
        title={`Support Ticket: ${detailTarget?.id || ''}`}
        subtitle={`Requester: ${detailTarget?.studentName} • Category: ${detailTarget?.category}`}
        onClose={() => setDetailTarget(null)}
        onSubmit={handleReply}
        submitLabel="Post Response"
        submitting={submitting}
      >
        <div className="d-flex flex-column gap-3">
          <div className="p-3 rounded bg-light border">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <strong className="text-dark">{detailTarget?.subject}</strong>
              <span className="badge bg-light text-dark font-monospace">{detailTarget?.date}</span>
            </div>
            <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
              {detailTarget?.description}
            </p>
          </div>

          {/* Conversation History */}
          {detailTarget?.replies && detailTarget.replies.length > 0 && (
            <div className="d-flex flex-column gap-2">
              <span className="fw-semibold text-dark" style={{ fontSize: 12 }}>
                Audit Conversation:
              </span>
              {detailTarget.replies.map((r, idx) => (
                <div key={idx} className="p-2.5 rounded border bg-white" style={{ fontSize: 12.5 }}>
                  <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: 11 }}>
                    <strong>{r.sender} ({r.role})</strong>
                    <span>{r.time}</span>
                  </div>
                  <div>{r.text}</div>
                </div>
              ))}
            </div>
          )}

          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
                Update Ticket Status
              </label>
              <select
                className="form-select form-select-sm"
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
              >
                <option value="Open">Open — Awaiting Action</option>
                <option value="In Progress">In Progress — Under Investigation</option>
                <option value="Resolved">Resolved — Solved & Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Instructor Response / Resolution Note
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={3}
              placeholder="Type your academic or technical solution for the scholar..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Log New Ticket */}
      <Modal
        open={createOpen}
        title="Log Support Ticket with OUT ICT Directorate"
        subtitle="Internal faculty escalation system"
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        submitLabel="Submit Ticket"
        submitting={submitting}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Issue Category *
            </label>
            <select
              className="form-select form-select-sm"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            >
              <option value="Academic Advisory">Academic Advisory</option>
              <option value="Grading & Assessment">Grading & Assessment</option>
              <option value="Course Materials">Course Materials / Media</option>
              <option value="BigBlueButton Seminar">BigBlueButton Virtual Seminar</option>
              <option value="Moodle Access & Enrollment">Moodle Access &amp; Cohort Enrollment</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Priority Level
            </label>
            <select
              className="form-select form-select-sm"
              value={formPriority}
              onChange={(e) => setFormPriority(e.target.value)}
            >
              <option value="Normal">Normal — Standard SLA</option>
              <option value="High">High — Urgent Assessment Blocker</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Ticket Subject *
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Moodle Gradebook sync latency for CS101 Quiz 2"
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Detailed Description & Steps *
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={4}
              placeholder="Describe the issue, affected course modules, or scholar registration IDs..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InstructorTickets;
