import React, { useState } from 'react';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../../common/profileCard';
import InstructorSidebar from '../../common/instructorSidebar';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import { useAuth } from '../../../../core/auth/authContext';

const InstructorNotification: React.FC = () => {
  const { user } = useAuth();
  const [submissionAlerts, setSubmissionAlerts] = useState(true);
  const [forumAlerts, setForumAlerts] = useState(true);

  return (
    <>
      <Breadcrumb title="Lecturer Notification Preferences" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card mb-0">
                <div className="card-body">
                  <InstructorSettingsLink />
                  <p className="text-muted small mb-3">
                    Email alerts for <strong>{user?.email || 'instructor@out.ac.tz'}</strong>
                  </p>
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={submissionAlerts}
                      onChange={(e) => setSubmissionAlerts(e.target.checked)}
                    />
                    <label className="form-check-label">
                      Notify when students submit coursework or quizzes
                    </label>
                  </div>
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={forumAlerts}
                      onChange={(e) => setForumAlerts(e.target.checked)}
                    />
                    <label className="form-check-label">
                      Notify on student discussion forum questions
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorNotification;
