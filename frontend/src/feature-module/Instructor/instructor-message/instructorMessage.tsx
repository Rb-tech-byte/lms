import React, { useEffect, useMemo, useState } from 'react';
import { instructorService, InstructorMessageThread } from '../../../core/api/instructorService';
import { useInstructorShell } from '../common/instructorLayout';
import {
  KpiCard,
  KpiGrid,
  SectionCard,
  SearchInput,
  LoadingState,
  EmptyState,
  exportToCsv,
} from '../common/instructorUi';

const InstructorMessage: React.FC = () => {
  const shell = useInstructorShell();
  const [threads, setThreads] = useState<InstructorMessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('THR-001');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const notify = shell?.notify ?? ((m: string) => window.alert(m));

  const loadThreads = async () => {
    setLoading(true);
    try {
      const list = await instructorService.fetchMessageThreads();
      setThreads(list);
      if (list.length && !activeThreadId) {
        setActiveThreadId(list[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || threads[0] || null,
    [threads, activeThreadId]
  );

  const filteredThreads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.participantName.toLowerCase().includes(q) ||
        t.courseCode.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q)
    );
  }, [threads, searchQuery]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;
    setSending(true);
    try {
      const res = await instructorService.sendMessage(activeThread.id, replyText.trim());
      if (res.success) {
        setReplyText('');
        await loadThreads();
      } else {
        notify(res.message || 'Failed to deliver message.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleExport = () => {
    if (!activeThread) return;
    exportToCsv(
      `OUT_Chat_${activeThread.participantName.replace(/\s+/g, '_')}`,
      activeThread.messages.map((m) => ({
        Sender: m.sender,
        Message: m.text,
        Time: m.time,
      }))
    );
  };

  const totalUnread = threads.reduce((acc, t) => acc + (t.unread || 0), 0);

  return (
    <div className="ins-page">
      {/* KPI Overview */}
      <KpiGrid>
        <KpiCard
          label="Active Inquiries"
          value={threads.length}
          unit="Threads"
          hint="Scholars & Faculty Dean"
          icon="isax isax-messages-35"
          tone="primary"
        />
        <KpiCard
          label="Unread Messages"
          value={totalUnread}
          unit="New"
          hint="Awaiting faculty reply"
          icon="isax isax-message-notif5"
          tone="warning"
        />
        <KpiCard
          label="Response SLA"
          value="< 1 Hour"
          hint="Real-time Moodle sync"
          icon="isax isax-clock5"
          tone="success"
        />
        <KpiCard
          label="Direct Advisory"
          value="Moodle Webhook"
          hint="Push & email notified"
          icon="isax isax-notification-status5"
          tone="info"
        />
      </KpiGrid>

      {/* Main Messaging Interface */}
      <SectionCard
        title="Scholar Advisory & Academic Inquiries"
        subtitle="Direct communication channel for thesis guidance, lab troubleshooting, and departmental notifications"
        actions={
          <button type="button" className="ins-btn ins-btn-ghost" onClick={handleExport}>
            <i className="feather-download" /> Export Chat Log
          </button>
        }
      >
        {loading ? (
          <LoadingState text="Loading faculty conversation threads..." />
        ) : (
          <div className="row g-3" style={{ minHeight: 520 }}>
            {/* Thread List Column */}
            <div className="col-lg-4 border-end">
              <div className="pe-lg-2">
                <div className="mb-3">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search scholars or topics..."
                  />
                </div>
                <div className="d-flex flex-column gap-2" style={{ maxHeight: 460, overflowY: 'auto' }}>
                  {filteredThreads.map((t) => {
                    const isActive = t.id === activeThread?.id;
                    return (
                      <div
                        key={t.id}
                        role="button"
                        onClick={() => setActiveThreadId(t.id)}
                        className={`p-2.5 rounded-3 transition ${
                          isActive ? 'bg-primary-subtle border border-primary' : 'bg-light hover-bg'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center gap-2.5">
                          <img
                            src={t.participantAvatar || '/assets/img/user/user-02.jpg'}
                            alt={t.participantName}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                          <div className="min-w-0 flex-grow-1">
                            <div className="d-flex justify-content-between align-items-baseline">
                              <h6 className="fw-bold text-dark text-truncate mb-0" style={{ fontSize: 13 }}>
                                {t.participantName}
                              </h6>
                              <span className="text-muted" style={{ fontSize: 10.5 }}>
                                {t.lastMessageTime}
                              </span>
                            </div>
                            <small className="text-primary fw-semibold d-block" style={{ fontSize: 11 }}>
                              {t.courseCode} • {t.participantRole}
                            </small>
                            <p
                              className="text-muted text-truncate mb-0"
                              style={{ fontSize: 11.5 }}
                              title={t.lastMessage}
                            >
                              {t.lastMessage}
                            </p>
                          </div>
                          {t.unread > 0 && (
                            <span className="badge bg-danger rounded-pill" style={{ fontSize: 10 }}>
                              {t.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Chat Conversation Column */}
            <div className="col-lg-8 d-flex flex-column justify-content-between ps-lg-3">
              {activeThread ? (
                <>
                  {/* Chat Header */}
                  <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                    <div className="d-flex align-items-center gap-2.5">
                      <img
                        src={activeThread.participantAvatar || '/assets/img/user/user-02.jpg'}
                        alt={activeThread.participantName}
                        style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <h6 className="fw-bold text-dark mb-0" style={{ fontSize: 14 }}>
                          {activeThread.participantName}
                        </h6>
                        <span className="badge bg-primary-subtle text-primary fw-semibold" style={{ fontSize: 11 }}>
                          {activeThread.courseCode}
                        </span>{' '}
                        <small className="text-muted" style={{ fontSize: 11.5 }}>
                          {activeThread.participantRole}
                        </small>
                      </div>
                    </div>
                    <span className="badge bg-success-subtle text-success fw-bold px-2 py-1">
                      ● Active Scholar
                    </span>
                  </div>

                  {/* Messages Stream */}
                  <div
                    className="flex-grow-1 d-flex flex-column gap-3 mb-3 pe-2"
                    style={{ maxHeight: 360, overflowY: 'auto' }}
                  >
                    {activeThread.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`d-flex flex-column ${m.isMe ? 'align-items-end' : 'align-items-start'}`}
                      >
                        <div className="d-flex align-items-baseline gap-2 mb-1">
                          <span className="fw-bold text-dark" style={{ fontSize: 11.5 }}>
                            {m.isMe ? 'You (Dr. Amina Kilindo)' : m.sender}
                          </span>
                          <span className="text-muted" style={{ fontSize: 10.5 }}>
                            {m.time}
                          </span>
                        </div>
                        <div
                          className="p-3 rounded-3"
                          style={{
                            maxWidth: '75%',
                            fontSize: 13,
                            lineHeight: 1.5,
                            background: m.isMe ? '#0171bb' : '#f1f5f9',
                            color: m.isMe ? '#ffffff' : '#1e293b',
                            borderRadius: m.isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          }}
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Composer */}
                  <form onSubmit={handleSend} className="pt-2 border-top">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Reply to ${activeThread.participantName}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        className="ins-btn ins-btn-primary"
                        disabled={sending || !replyText.trim()}
                      >
                        {sending ? (
                          <span className="spinner-border spinner-border-sm me-1" />
                        ) : (
                          <i className="feather-send me-1" />
                        )}
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <EmptyState text="Select a conversation thread to view messages." />
              )}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default InstructorMessage;
