import React, { useEffect, useState } from 'react';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import {
  instructorService,
  InstructorNotificationSettings,
} from '../../../../core/api/instructorService';
import { SectionCard } from '../../common/instructorUi';

const InstructorNotification: React.FC = () => {
  const [notifs, setNotifs] = useState<InstructorNotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    instructorService.fetchNotificationSettings().then((data) => {
      if (mounted) {
        setNotifs(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleToggle = (field: keyof InstructorNotificationSettings) => {
    if (!notifs) return;
    setNotifs({ ...notifs, [field]: !notifs[field] });
  };

  const handleSave = async () => {
    if (!notifs) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await instructorService.updateNotificationSettings(notifs);
      setMessage({ type: 'success', text: res.message || 'Notification preferences saved.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save preferences.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !notifs) {
    return (
      <div className="ins-content p-4">
        <InstructorSettingsLink />
        <div className="ins-empty">
          <span className="spinner-border spinner-border-sm text-primary me-2" />
          Loading notification preferences...
        </div>
      </div>
    );
  }

  return (
    <div className="ins-content">
      <InstructorSettingsLink />

      {message && (
        <div
          className={`alert ${
            message.type === 'success' ? 'alert-success border-success' : 'alert-danger border-danger'
          } d-flex align-items-center justify-content-between py-2 px-3 mb-4 rounded-3`}
        >
          <div className="d-flex align-items-center gap-2">
            <i className={`feather-${message.type === 'success' ? 'check-circle' : 'alert-circle'}`} />
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-sm"
            onClick={() => setMessage(null)}
            aria-label="Close"
          />
        </div>
      )}

      <SectionCard
        title="Teaching &amp; System Notification Preferences"
        subtitle="Control which events trigger emails, SMS mobile alerts, or in-app dashboard banners."
      >
        <div className="row g-4">
          {/* Academic & Teaching Alerts */}
          <div className="col-12">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3" style={{ fontSize: 13.5 }}>
              Course &amp; Scholar Activities
            </h6>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border bg-white">
                <div>
                  <div className="fw-semibold text-dark small">New Scholar Course Enrollment</div>
                  <small className="text-muted">
                    Receive notification when a new student enrolls in any of your directed courses.
                  </small>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={notifs.studentEnrolmentEmail}
                    onChange={() => handleToggle('studentEnrolmentEmail')}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border bg-white">
                <div>
                  <div className="fw-semibold text-dark small">Assignment Submissions Digest</div>
                  <small className="text-muted">
                    Send daily summary email of pending assignments awaiting grading.
                  </small>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={notifs.assignmentSubmissionsEmail}
                    onChange={() => handleToggle('assignmentSubmissionsEmail')}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border bg-white">
                <div>
                  <div className="fw-semibold text-dark small">Instant Submission Alerts</div>
                  <small className="text-muted">
                    Send immediate notification the moment a student uploads an assignment file.
                  </small>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={notifs.assignmentSubmissionsInstant}
                    onChange={() => handleToggle('assignmentSubmissionsInstant')}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border bg-white">
                <div>
                  <div className="fw-semibold text-dark small">Quiz Completion Alerts</div>
                  <small className="text-muted">
                    Notify when a scholar completes a timed quiz assessment with their automatic score.
                  </small>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={notifs.quizCompletedEmail}
                    onChange={() => handleToggle('quizCompletedEmail')}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border bg-white">
                <div>
                  <div className="fw-semibold text-dark small">Discussion Forums &amp; Scholar Inquiries</div>
                  <small className="text-muted">
                    Notify when a scholar posts a query in your course Q&amp;A forum.
                  </small>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={notifs.forumPostsEmail}
                    onChange={() => handleToggle('forumPostsEmail')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial & University Administrative Alerts */}
          <div className="col-12">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3" style={{ fontSize: 13.5 }}>
              Financial &amp; OUT Administrative Circulars
            </h6>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border bg-white">
                <div>
                  <div className="fw-semibold text-dark small">Bursar Payout &amp; Honorarium Notifications</div>
                  <small className="text-muted">
                    Email notification upon approval or disbursement of teaching honoraria and allowances.
                  </small>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={notifs.bursarPayoutEmail}
                    onChange={() => handleToggle('bursarPayoutEmail')}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border bg-white">
                <div>
                  <div className="fw-semibold text-dark small">SMS Urgent Text Alerts (+255 754 892 104)</div>
                  <small className="text-muted">
                    Send high-priority SMS notifications for system maintenance or critical Senate notices.
                  </small>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={notifs.smsAlerts}
                    onChange={() => handleToggle('smsAlerts')}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border bg-white">
                <div>
                  <div className="fw-semibold text-dark small">University Senate Circulars</div>
                  <small className="text-muted">
                    Official Open University of Tanzania administrative notices, circulars, and academic calendars.
                  </small>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={notifs.systemCircularsEmail}
                    onChange={() => handleToggle('systemCircularsEmail')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 pt-3 border-top d-flex justify-content-end gap-2">
            <button
              type="button"
              className="ins-btn ins-btn-ghost"
              onClick={() => instructorService.fetchNotificationSettings().then(setNotifs)}
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              className="ins-btn ins-btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <span className="spinner-border spinner-border-sm me-1" />}
              {saving ? 'Saving...' : 'Save Notification Preferences'}
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default InstructorNotification;
