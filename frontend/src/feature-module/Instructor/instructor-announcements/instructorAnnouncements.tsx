import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { instructorService, InstructorAnnouncementItem } from '../../../core/api/instructorService';

const InstructorAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<InstructorAnnouncementItem[]>([]);
  const [courseName, setCourseName] = useState('OIT-101: ICT Fundamentals');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    instructorService
      .getInstructorAnnouncements([2, 3, 4])
      .then((list) => {
        if (mounted) setAnnouncements(list || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setAnnouncements((prev) => [
      {
        id: Date.now(),
        courseId: 2,
        courseName,
        title: title.trim(),
        content: content.trim(),
        date: new Date().toLocaleDateString(),
        priority: 'Normal',
      },
      ...prev,
    ]);
    setTitle('');
    setContent('');
  };

  return (
    <>
      <Breadcrumb title="Course Announcements & Broadcasts" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm p-4 mb-4">
                <h5 className="fw-bold mb-3">Publish New Course Announcement</h5>
                <form onSubmit={handlePublish}>
                  <div className="row g-3">
                    <div className="col-md-5">
                      <label className="form-label">Course</label>
                      <input
                        type="text"
                        className="form-control"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                      />
                    </div>
                    <div className="col-md-7">
                      <label className="form-label">Announcement Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Mid-Semester Assessment Schedule"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Message Body</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-secondary">
                        Broadcast to Enrolled Students
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : (
                <div className="table-responsive custom-table">
                  <table className="table">
                    <thead className="thead-light">
                      <tr>
                        <th>Date</th>
                        <th>Course</th>
                        <th>Announcement</th>
                        <th>Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {announcements.map((a) => (
                        <tr key={a.id}>
                          <td>{a.date}</td>
                          <td>{a.courseName}</td>
                          <td>
                            <h6 className="mb-1 fw-bold">{a.title}</h6>
                            <p className="text-muted small mb-0">{a.content}</p>
                          </td>
                          <td>
                            <span className="badge bg-primary">{a.priority}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorAnnouncements;
