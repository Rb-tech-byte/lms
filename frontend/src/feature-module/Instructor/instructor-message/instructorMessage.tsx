import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { useAuth } from '../../../core/auth/authContext';
import { getMoodleUserId } from '../../../core/api/courseService';
import { studentService, MoodleConversation } from '../../../core/api/studentService';

const InstructorMessage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<MoodleConversation[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  useEffect(() => {
    const uid = getMoodleUserId(user);
    studentService.getConversations(uid).then((list) => {
      setConversations(list || []);
    });
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await studentService.sendInstantMessage(4, replyText.trim());
    setSentNotice('Reply dispatched via Moodle Messaging API.');
    setReplyText('');
  };

  return (
    <>
      <Breadcrumb title="Student Supervision Messages" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm p-4">
                <h5 className="fw-bold mb-3">Student Academic Inquiries</h5>
                {sentNotice && <div className="alert alert-success py-2 small">{sentNotice}</div>}
                {conversations.map((conv) => (
                  <div key={conv.id} className="border rounded-3 p-3 mb-3">
                    <h6 className="fw-bold mb-1">
                      {conv.members?.[0]?.fullname || 'Baraka Mkwawa (OUT Student)'}
                    </h6>
                    <div
                      className="text-muted small"
                      dangerouslySetInnerHTML={{
                        __html: conv.messages?.[conv.messages.length - 1]?.text || '',
                      }}
                    />
                  </div>
                ))}
                <form onSubmit={handleSend} className="d-flex gap-2 mt-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Send supervision feedback to student..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    Send Reply
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

export default InstructorMessage;
