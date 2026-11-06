import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/authContext';
import { all_routes } from '../../router/all_routes';
import { adminService } from '../../../core/api/adminService';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const route = all_routes;

  const handleLogout = () => {
    logout();
    navigate(route.homeone);
  };

  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: 'isax isax-element-4' },
    { title: 'Admin & APIs', path: '/admin/dashboard?tab=api-gateway', icon: 'isax isax-Hierarchy-2' },
    { title: 'API Hub', path: '/pages/api-docs', icon: 'isax isax-code-circle' },
    { title: 'Site Administration (All 9 Areas)', path: '/admin/dashboard?tab=siteadmin', icon: 'isax isax-category-2' },
    { title: 'Course Models & Features', path: '/admin/dashboard?tab=courses', icon: 'isax isax-book' },
    { title: 'Plugin Management', path: '/admin/dashboard?tab=plugins', icon: 'isax isax-cpu' },
    { title: 'System & Gateway Settings', path: '/admin/dashboard?tab=settings', icon: 'isax isax-setting-2' },
    { title: 'User Directory', path: '/admin/dashboard?tab=users', icon: 'isax isax-user-tag' },
    { title: 'Financial & Pesapal Ledger', path: '/admin/dashboard?tab=ledger', icon: 'isax isax-dollar-circle' },
    { title: 'System Health & Telemetry', path: '/admin/dashboard?tab=health', icon: 'isax isax-health' },
  ];

  const currentPathWithSearch = location.pathname + location.search;

  return (
    <div className="col-lg-3">
      <div className="settings-sidebar mb-lg-0 theiaStickySidebar">
        {/* Admin Identity Card */}
        <div className="card border-0 shadow-sm p-3 mb-4 rounded-3 text-center" style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", color: "#ffffff" }}>
          <div className="avatar avatar-xl rounded-circle mx-auto mb-2 bg-white text-primary d-flex align-items-center justify-content-center shadow-sm">
            <i className="isax isax-security-user fs-24" />
          </div>
          <h6 className="text-white mb-0 fw-bold">{user?.name || 'University Administrator'}</h6>
          <span className="badge bg-danger text-white my-1 align-self-center px-2 py-1 fs-11">
            Super Administrator
          </span>
          <p className="text-white-50 fs-12 mb-0">{user?.department || 'Directorate of ICT Services & Registrar'}</p>
        </div>

        <div>
          <h6 className="mb-3">Governance Menu</h6>
          <ul className="mb-3 pb-1">
            {menuItems.map((menu, index) => {
              const isActive = menu.path.includes('?')
                ? currentPathWithSearch === menu.path
                : location.pathname === menu.path && (!location.search || location.search === '?tab=users');
              return (
                <li key={index}>
                  <Link
                    to={menu.path}
                    className={`d-inline-flex align-items-center ${isActive ? 'active' : ''}`}
                  >
                    <i className={`${menu.icon} me-2`} />
                    {menu.title}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-3">
            <h6 className="mb-3">Administrative Consoles</h6>
            <div className="d-flex flex-column gap-2 mb-3">
              <Link
                to={route.studentsList}
                className="btn btn-sm btn-outline-primary text-start d-flex align-items-center gap-2"
              >
                <span>🎓</span> Student Directory
              </Link>
              <Link
                to={route.instructorList}
                className="btn btn-sm btn-outline-secondary text-start d-flex align-items-center gap-2"
              >
                <span>👨‍🏫</span> Faculty Directory
              </Link>
            </div>
          </div>
          <div className="mt-3">
            <h6>Session</h6>
            <ul className="list-unstyled">
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
    </div>
  );
};

export default AdminSidebar;
