import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import StudentSidebar from '../common/studentSidebar';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { useAuth } from '../../../core/auth/authContext';
import { courseService, getMoodleUserId, EnrolledCourse } from '../../../core/api/courseService';

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);

  useEffect(() => {
    let mounted = true;
    const uid = getMoodleUserId(user);
    courseService.getUserEnrolledCourses(uid).then((list) => {
      if (mounted) setCourses(list || []);
    });
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <>
      <Breadcrumb title="My Academic Profile" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5 className="fw-bold">Student Identity &amp; Academic Record</h5>
                <Link to={all_routes.studentSettings} className="edit-profile-icon">
                  <i className="isax isax-edit-2" />
                </Link>
              </div>
              <div className="card mb-0">
                <div className="card-body">
                  <h6 className="fs-18 page-title fw-bold">Basic Information</h6>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Full Name</h6>
                        <span>{user?.name || 'Baraka Mkwawa'}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Moodle Username</h6>
                        <span>{user?.username || 'student'}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Institutional Email</h6>
                        <span>{user?.email || 'student@out.ac.tz'}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Academic Role</h6>
                        <span className="text-uppercase">{user?.role || 'student'}</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Enrolled Modules</h6>
                        <span>{courses.length} Active Courses</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>University Campus</h6>
                        <span>The Open University of Tanzania — Dar es Salaam</span>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div>
                        <h6>Academic Bio</h6>
                        <span>
                          {user?.bio ||
                            'Registered distance and blended learning student at The Open University of Tanzania.'}
                        </span>
                      </div>
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

export default StudentProfile;
