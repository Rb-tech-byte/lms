import React from 'react';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../../common/profileCard';
import InstructorSidebar from '../../common/instructorSidebar';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import { useAuth } from '../../../../core/auth/authContext';

const InstructorWithdraw: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Breadcrumb title="University Bursar Payroll Settings" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card mb-0">
                <div className="card-body">
                  <InstructorSettingsLink />
                  <h6 className="fw-bold mb-2">OUT Directorate of Finance Disbursement</h6>
                  <p className="text-muted small mb-0">
                    Supervision and marking allowances for{' '}
                    <strong>{user?.name || 'Dr. Amina Kilindo'}</strong> are disbursed via the
                    official Open University of Tanzania payroll system.
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

export default InstructorWithdraw;
