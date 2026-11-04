import React, { useState } from 'react';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../../common/profileCard';
import StudentSidebar from '../../common/studentSidebar';
import SettingsLinks from '../settingsLinks/settingsLinks';
import { useAuth } from '../../../../core/auth/authContext';

const StudentSocialProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [orcid, setOrcid] = useState('https://orcid.org/0000-0002-OUT-TZ');
  const [linkedin, setLinkedin] = useState('https://linkedin.com/school/open-university-of-tanzania');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ bio: `${user?.bio || ''} | ORCID: ${orcid}`.trim() });
    setSaved(true);
  };

  return (
    <>
      <Breadcrumb title="Academic & Research Profiles" />
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
                      Academic social profiles saved to student record.
                    </div>
                  )}
                  <form onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label">ORCID / Google Scholar URL</label>
                      <input
                        type="text"
                        className="form-control"
                        value={orcid}
                        onChange={(e) => setOrcid(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">LinkedIn Profile</label>
                      <input
                        type="text"
                        className="form-control"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-secondary">
                      Save Academic Links
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

export default StudentSocialProfile;
