import React, { useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import StudentSidebar from '../common/studentSidebar';
import { useAuth } from '../../../core/auth/authContext';
import { callInternalApi } from '../../../core/api/apiClient';

interface TicketItem {
  id: string;
  subject: string;
  category: string;
  date: string;
  status: 'Open' | 'Resolved';
}

const StudentTickets: React.FC = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Course Portal Access');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<TicketItem[]>([
    {
      id: 'OUT-TKT-1042',
      subject: 'SARIS Gradebook Synchronization Inquiry',
      category: 'Academic Records',
      date: new Date().toLocaleDateString(),
      status: 'Resolved',
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await callInternalApi<{ ticketId: string }>('submit_contact_inquiry', {
        name: user?.name || 'OUT Student',
        email: user?.email || 'student@out.ac.tz',
        subject: `[${category}] ${subject.trim()}`,
        message: message.trim(),
      });
      setTickets((prev) => [
        {
          id: res.ticketId || `OUT-TKT-${Math.floor(1000 + Math.random() * 9000)}`,
          subject: subject.trim(),
          category,
          date: new Date().toLocaleDateString(),
          status: 'Open',
        },
        ...prev,
      ]);
      setSubject('');
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Student ICT Helpdesk Tickets" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm p-4 mb-4">
                <h5 className="fw-bold mb-3">Open New Helpdesk Ticket</h5>
                <form onSubmit={handleCreateTicket}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Describe your issue..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Support Category</label>
                      <select
                        className="form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="Course Portal Access">Course Portal Access</option>
                        <option value="Pesapal Tuition Receipt">Pesapal Tuition Receipt</option>
                        <option value="Academic Records">Academic Records &amp; Gradebook</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Details</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" disabled={submitting} className="btn btn-primary">
                        {submitting ? 'Submitting...' : 'Submit Helpdesk Ticket'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="table-responsive custom-table">
                <table className="table">
                  <thead className="thead-light">
                    <tr>
                      <th>Ticket ID</th>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t.id}>
                        <td className="fw-bold">{t.id}</td>
                        <td>{t.date}</td>
                        <td>{t.subject}</td>
                        <td>{t.category}</td>
                        <td>
                          <span
                            className={`badge ${t.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'
                              }`}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentTickets;
