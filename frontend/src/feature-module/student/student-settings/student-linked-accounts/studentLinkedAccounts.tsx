import React from 'react';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../../common/profileCard';
import StudentSidebar from '../../common/studentSidebar';
import SettingsLinks from '../settingsLinks/settingsLinks';
import { useAuth } from '../../../../core/auth/authContext';

const StudentLinkedAccounts: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Breadcrumb title="Linked Institutional Accounts" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="card mb-0">
                <div className="card-body">
                  <SettingsLinks />
                  <div className="p-3 border rounded-3 mb-3 d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1 fw-bold">OUT SARIS / OAS Student Registry</h6>
                      <p className="text-muted small mb-0">
                        Connected to {user?.email || 'student@out.ac.tz'}
                      </p>
                    </div>
                    <span className="badge bg-success">Linked</span>
                  </div>
                  <div className="p-3 border rounded-3 d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1 fw-bold">Institutional Single Sign-On (SSO)</h6>
                      <p className="text-muted small mb-0">
                        Active token session for {user?.username || 'student'}
                      </p>
                    </div>
                    <span className="badge bg-primary">Active</span>
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

export default StudentLinkedAccounts;
