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
    <div className="col-lg-3">
      <div className="settings-sidebar mb-lg-0 theiaStickySidebar">
        {/* Admin Identity Card */}
        <div className="card border-0 shadow-sm p-3 mb-4 rounded-3 text-center" style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", color: "#ffffff" }}>
          <div className="avatar avatar-xl rounded-circle mx-auto mb-2 bg-white text-primary d-flex align-items-center justify-content-center shadow-sm">
            <i className="isax isax-security-user fs-24" />
          </div>
          <h6 className="text-white mb-0 fw-bold">Eng. Godfrey Makundi</h6>
          <span className="badge bg-danger text-white my-1 align-self-center px-2 py-1 fs-11">
            Super Administrator
          </span>
          <p className="text-white-50 fs-12 mb-0">Directorate of ICT Services & Registrar</p>
        </div>

        <div>
          <h6 className="mb-3">Governance Menu</h6>
          <ul className="mb-3 pb-1">
            {menuItems.map((menu, index) => (
              <li key={index}>
                <Link
                  to={menu.path}
                  className={`d-inline-flex align-items-center ${location.pathname === menu.path ? 'active' : ''}`}
                >
                  <i className={`${menu.icon} me-2`} />
                  {menu.title}
                </Link>
              </li>
            ))}
          </ul>
          <hr />
          <h6 className="mb-3">Portal Switcher</h6>
          <div className="d-flex flex-column gap-2 mb-3">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary text-start d-flex align-items-center gap-2"
              onClick={() => { switchRole('student'); navigate('/student/student-dashboard'); }}
            >
              <span>🎓</span> Student Portal
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary text-start d-flex align-items-center gap-2"
              onClick={() => { switchRole('instructor'); navigate('/instructor/instructor-dashboard'); }}
            >
              <span>👨‍🏫</span> Instructor Portal
            </button>
            <a
              href="http://localhost/outlmstheme/moodle-backend/admin/index.php"
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-warning text-dark text-start d-flex align-items-center gap-2 fw-medium"
            >
              <span>⚙️</span> Moodle Site Admin
            </a>
          </div>
          <hr />
          <h6>Session</h6>
          <ul>
            <li>
              <button
                type="button"
                className="btn btn-link text-danger d-inline-flex align-items-center p-0 text-decoration-none"
                onClick={handleLogout}
              >
                <i className="isax isax-logout5 me-2" />
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
