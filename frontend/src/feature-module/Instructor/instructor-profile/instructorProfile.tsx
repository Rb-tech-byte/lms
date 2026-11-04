import React from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { useAuth } from '../../../core/auth/authContext';

const InstructorProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Breadcrumb title="Lecturer Academic Profile" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5 className="fw-bold">Faculty Profile Details</h5>
                <Link to={all_routes.instructorsettings} className="edit-profile-icon">
                  <i className="isax isax-edit-2" />
                </Link>
              </div>
              <div className="card mb-0">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <h6>Full Name</h6>
                      <span>{user?.name || 'Dr. Amina Kilindo'}</span>
                    </div>
                    <div className="col-md-4">
                      <h6>Official Email</h6>
                      <span>{user?.email || 'instructor@out.ac.tz'}</span>
                    </div>
                    <div className="col-md-4">
                      <h6>Role</h6>
                      <span className="text-uppercase">{user?.role || 'instructor'}</span>
                    </div>
                    <div className="col-12">
                      <h6>Academic Biography</h6>
                      <span>
                        {user?.bio ||
                          'Senior Lecturer & Course Coordinator at The Open University of Tanzania.'}
                      </span>
                    </div>
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

export default InstructorProfile;
