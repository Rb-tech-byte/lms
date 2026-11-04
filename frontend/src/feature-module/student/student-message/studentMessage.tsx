import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import StudentSidebar from '../common/studentSidebar';
import ProfileCard from '../common/profileCard';
import { useAuth } from '../../../core/auth/authContext';
import { getMoodleUserId } from '../../../core/api/courseService';
import { studentService, MoodleConversation } from '../../../core/api/studentService';

const StudentMessage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<MoodleConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<MoodleConversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    const uid = getMoodleUserId(user);
    setLoading(true);
    studentService
      .getConversations(uid)
      .then((list) => {
        if (!mounted) return;
        setConversations(list || []);
        if (list && list.length > 0) setSelectedConv(list[0]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConv) return;
    setSending(true);
    try {
      const targetUserId = selectedConv.members?.[0]?.id || 3;
      await studentService.sendInstantMessage(targetUserId, messageText.trim());
      const newMsg = {
        id: Date.now(),
        useridfrom: getMoodleUserId(user),
        text: messageText.trim(),
        timecreated: Math.floor(Date.now() / 1000),
      };
      setSelectedConv({
        ...selectedConv,
        messages: [...(selectedConv.messages || []), newMsg],
      });
      setMessageText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Academic Messages & Lecturer Chat" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm p-4">
                <h5 className="fw-bold mb-3">Moodle Direct Messages</h5>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                ) : (
                  <div className="row g-3">
                    <div className="col-md-4 border-end">
                      {conversations.map((conv) => {
                        const member = conv.members?.[0];
                        return (
                          <div
                            key={conv.id}
                            onClick={() => setSelectedConv(conv)}
                            className={`p-3 rounded-3 mb-2 cursor-pointer border ${
                              selectedConv?.id === conv.id ? 'bg-primary-transparent border-primary' : 'bg-white'
                            }`}
                            style={{ cursor: 'pointer' }}
                          >
                            <h6 className="mb-1 fw-bold">{member?.fullname || conv.name || 'OUT Lecturer'}</h6>
                            <p className="text-muted small mb-0 text-truncate">
                              {(conv.messages?.[conv.messages.length - 1]?.text || '').replace(/<[^>]*>?/gm, '')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="col-md-8 d-flex flex-column justify-content-between" style={{ minHeight: 340 }}>
                      {selectedConv ? (
                        <>
                          <div className="border-bottom pb-2 mb-3">
                            <h6 className="mb-0 fw-bold">
                              {selectedConv.members?.[0]?.fullname || 'Academic Supervisor'}
                            </h6>
                            <small className="text-muted">Open University of Tanzania Faculty</small>
                          </div>
                          <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: 260 }}>
                            {(selectedConv.messages || []).map((msg) => (
                              <div key={msg.id} className="mb-2 p-2 rounded bg-light border">
                                <div
                                  className="small"
                                  dangerouslySetInnerHTML={{ __html: msg.text }}
                                />
                              </div>
                            ))}
                          </div>
                          <form onSubmit={handleSend} className="d-flex gap-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Write a message to your lecturer..."
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                            />
                            <button type="submit" disabled={sending} className="btn btn-primary">
                              Send
                            </button>
                          </form>
                        </>
                      ) : (
                        <div className="text-center text-muted py-5">Select a conversation</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentMessage;
