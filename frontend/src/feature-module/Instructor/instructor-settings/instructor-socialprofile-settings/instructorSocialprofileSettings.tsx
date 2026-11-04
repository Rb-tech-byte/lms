import React, { useState } from 'react';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../../common/profileCard';
import InstructorSidebar from '../../common/instructorSidebar';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import { useAuth } from '../../../../core/auth/authContext';

const InstructorSocialprofileSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [scholarUrl, setScholarUrl] = useState('https://scholar.google.com/citations?user=OUT-TZ');
  const [orcidUrl, setOrcidUrl] = useState('https://orcid.org/0000-0001-OUT-FACULTY');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ bio: `${user?.bio || ''} | ORCID: ${orcidUrl}`.trim() });
    setSaved(true);
  };

  return (
    <>
      <Breadcrumb title="Faculty Research & ORCID Profiles" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card mb-0">
                <div className="card-body">
                  <InstructorSettingsLink />
                  {saved && (
                    <div className="alert alert-success py-2 small">
                      Research profiles saved to Moodle faculty record.
                    </div>
                  )}
                  <form onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label">Google Scholar Profile</label>
                      <input
                        type="text"
                        className="form-control"
                        value={scholarUrl}
                        onChange={(e) => setScholarUrl(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">ORCID Identifier</label>
                      <input
                        type="text"
                        className="form-control"
                        value={orcidUrl}
                        onChange={(e) => setOrcidUrl(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-secondary">
                      Save Research Links
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

export default InstructorSocialprofileSettings;
