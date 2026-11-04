import React from 'react';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../../common/profileCard';
import InstructorSidebar from '../../common/instructorSidebar';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import { useAuth } from '../../../../core/auth/authContext';

const InstructorDeleteAccount: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Breadcrumb title="Academic Staff Account Governance" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card mb-0">
                <div className="card-body">
                  <InstructorSettingsLink />
                  <h6 className="fw-bold mb-2">Institutional Staff Record ({user?.username})</h6>
                  <p className="text-muted small mb-0">
                    Open University of Tanzania faculty accounts are governed by the Directorate of
                    Human Resource Management and cannot be self-deleted while courses are active.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorDeleteAccount;

