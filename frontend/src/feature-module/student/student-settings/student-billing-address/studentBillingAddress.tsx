import React, { useState } from 'react';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../../common/profileCard';
import StudentSidebar from '../../common/studentSidebar';
import SettingsLinks from '../settingsLinks/settingsLinks';
import { useAuth } from '../../../../core/auth/authContext';

const StudentBillingAddress: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [centre, setCentre] = useState('Kinondoni HQ Regional Centre, Kawawa Road, Dar es Salaam');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ title: `${user?.title || 'OUT Student'} • ${centre}` });
    setSaved(true);
  };

  return (
    <>
      <Breadcrumb title="Regional Study Centre & Billing Address" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="card mb-0">
                <div className="card-body">
                  <SettingsLinks />
                  {saved && (
                    <div className="alert alert-success py-2 small">
                      Regional study centre address synchronized with student profile.
                    </div>
                  )}
                  <form onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label">Assigned OUT Regional Study Centre</label>
                      <input
                        type="text"
                        className="form-control"
                        value={centre}
                        onChange={(e) => setCentre(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-secondary">
                      Save Regional Centre
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentBillingAddress;
