import React, { useState } from 'react';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../../common/profileCard';
import StudentSidebar from '../../common/studentSidebar';
import SettingsLinks from '../settingsLinks/settingsLinks';
import { useAuth } from '../../../../core/auth/authContext';

const StudentNotification: React.FC = () => {
  const { user } = useAuth();
  const [gradeAlerts, setGradeAlerts] = useState(true);
  const [forumAlerts, setForumAlerts] = useState(true);

  return (
    <>
      <Breadcrumb title="Academic Notification Preferences" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="card mb-0">
                <div className="card-body">
                  <SettingsLinks />
                  <p className="text-muted small mb-3">
                    Notification preferences for <strong>{user?.email || 'student@out.ac.tz'}</strong>
                  </p>
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={gradeAlerts}
                      onChange={(e) => setGradeAlerts(e.target.checked)}
                    />
                    <label className="form-check-label">
                      Gradebook &amp; Quiz Assessment Notifications
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
                      Course Forum &amp; Lecturer Announcement Alerts
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

export default StudentNotification;
