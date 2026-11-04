import React from 'react';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../../common/profileCard';
import InstructorSidebar from '../../common/instructorSidebar';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import { useAuth } from '../../../../core/auth/authContext';

const InstructorLinkedAccounts: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Breadcrumb title="Linked Institutional Accounts" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card mb-0">
                <div className="card-body">
                  <InstructorSettingsLink />
                  <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-1">OUT SARIS Academic Staff Identity</h6>
                      <p className="text-muted small mb-0">
                        Authenticated as {user?.email || 'instructor@out.ac.tz'}
                      </p>
                    </div>
                    <span className="badge bg-success">Verified</span>
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

export default InstructorLinkedAccounts;
