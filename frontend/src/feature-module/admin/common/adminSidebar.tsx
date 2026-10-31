import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { useAuth } from '../../../core/auth/authContext';
import { all_routes } from '../../router/all_routes';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();
  const route = all_routes;

  const handleLogout = () => {
    logout();
    navigate(route.homeone);
  };

  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: 'isax isax-element-4' },
    { title: 'Course Approvals', path: '/admin/courses', icon: 'isax isax-book' },
    { title: 'Student Management', path: route.studentsList, icon: 'isax isax-user-tag' },
    { title: 'Instructor Management', path: route.instructorList, icon: 'isax isax-teacher' },
    { title: 'Financial Reports', path: route.instructorStatements, icon: 'isax isax-dollar-circle' },
    { title: 'Course Categories', path: route.courseCategory, icon: 'isax isax-category-2' },
  ];

  return (
    <div className="col-lg-3 theiaStickySidebar">
      <div className="settings-widget dash-profile mb-4">
        <div className="settings-menu p-0">
          <div className="profile-bg text-center">
            <h5>Super Administrator</h5>
            <ImageWithBasePath
              src="assets/img/user/user-03.jpg"
              alt="Admin Avatar"
              className="img-fluid rounded-circle avatar-xxl mb-3 border border-3 border-white shadow-sm"
            />
          </div>
          <div className="profile-group text-center px-3 pb-3">
            <h5 className="mb-1">{user?.name || 'OUT LMS Administrator'}</h5>
            <p className="badge bg-danger text-white mb-2 px-3 py-1">Super Admin</p>
            <p className="text-muted fs-13 mb-3">{user?.department || 'Directorate of ICT Services'}</p>

            {/* Quick Role Switcher for Demo */}
            <div className="bg-light p-2 rounded text-start mb-3 border">
              <small className="text-muted fw-bold d-block mb-1">Demo Quick Switch:</small>
              <div className="d-flex gap-1">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary flex-fill fs-11"
                  onClick={() => { switchRole('student'); navigate('/student/student-dashboard'); }}
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary flex-fill fs-11"
                  onClick={() => { switchRole('instructor'); navigate('/instructor/instructor-dashboard'); }}
                >
                  👨‍🏫 Instructor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-widget account-settings">
        <div className="settings-menu">
          <h6 className="px-3 pt-2 text-muted text-uppercase fs-12 fw-bold">Administration</h6>
          <ul>
            {menuItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={idx} className={isActive ? 'active' : ''}>
                  <Link to={item.path}>
                    <i className={`${item.icon} me-2`} />
                    {item.title}
                  </Link>
                </li>
              );
            })}
            <li className="border-top mt-2 pt-2">
              <button
                type="button"
                className="btn btn-link text-danger text-start w-100 px-3 py-2 text-decoration-none d-flex align-items-center"
                onClick={handleLogout}
              >
                <i className="isax isax-logout me-2 fs-16" />
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
