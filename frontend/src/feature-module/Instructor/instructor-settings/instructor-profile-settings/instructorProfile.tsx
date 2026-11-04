import React, { useState } from 'react';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../../common/profileCard';
import InstructorSidebar from '../../common/instructorSidebar';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import { useAuth } from '../../../../core/auth/authContext';

const InstructorProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || 'Dr. Amina Kilindo');
  const [email, setEmail] = useState(user?.email || 'instructor@out.ac.tz');
  const [title, setTitle] = useState(user?.title || 'Senior Lecturer • Faculty of Science & Technology');
  const [bio, setBio] = useState(
    user?.bio || 'Senior Lecturer and Moodle Course Coordinator at The Open University of Tanzania.'
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, title, bio });
    setSaved(true);
  };

  return (
    <>
      <Breadcrumb title="Lecturer Profile Settings" />
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
                      Lecturer profile synchronized with Moodle 5.3 database.
                    </div>
                  )}
                  <form onSubmit={handleSave}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Full Name &amp; Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Official OUT Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Academic Designation</label>
                        <input
                          type="text"
                          className="form-control"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Biography</label>
                        <textarea
                          rows={3}
                          className="form-control"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <button type="submit" className="btn btn-secondary">
                          Save Moodle Profile
                        </button>
                      </div>
                    </div>
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

export default InstructorProfile;
