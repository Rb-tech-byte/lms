import React, { useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { useAuth } from '../../../core/auth/authContext';
import { callInternalApi } from '../../../core/api/apiClient';

const InstructorTickets: React.FC = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sentMsg, setSentMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    const res = await callInternalApi<{ ticketId: string; message: string }>(
      'submit_contact_inquiry',
      {
        name: user?.name || 'OUT Lecturer',
        email: user?.email || 'instructor@out.ac.tz',
        subject: `[Faculty Support] ${subject.trim()}`,
        message: message.trim(),
      }
    );
    setSentMsg(`${res.message} (${res.ticketId})`);
    setSubject('');
    setMessage('');
  };

  return (
    <>
      <Breadcrumb title="Faculty ICT Helpdesk Tickets" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm p-4">
                <h5 className="fw-bold mb-3">Request Moodle / BigBlueButton Technical Support</h5>
                {sentMsg && <div className="alert alert-success py-2 small">{sentMsg}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Submit Faculty Ticket
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorTickets;
