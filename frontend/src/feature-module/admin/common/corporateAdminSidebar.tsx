import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/authContext';
import { all_routes } from '../../router/all_routes';
import { adminService } from '../../../core/api/adminService';

interface CorporateAdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenCourseStudio?: (courseId: number) => void;
  onPurgeCache?: () => void;
}

export const CorporateAdminSidebar: React.FC<CorporateAdminSidebarProps> = ({
  collapsed,
  activeView,
  onSelectView,
  onOpenCourseStudio,
  onPurgeCache,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const route = all_routes;

  const handleLogout = () => {
    logout();
    navigate(route.homeone);
  };

  // Original Project Navigation Menu Items from adminSidebar.tsx
  const governanceMenuItems = [
    { key: 'dashboard', title: 'Dashboard', icon: 'feather-grid' },
    { key: 'siteadmin', title: 'Site Administration (All 9 Areas)', icon: 'feather-layers', badge: 'Suite' },
    { key: 'courses', title: 'Course Models & Features', icon: 'feather-book-open' },
    { key: 'plugins', title: 'Plugin Management', icon: 'feather-cpu' },
    { key: 'settings', title: 'System & Gateway Settings', icon: 'feather-settings' },
    { key: 'users', title: 'User Directory', icon: 'feather-users' },
    { key: 'ledger', title: 'Financial & Pesapal Ledger', icon: 'feather-dollar-sign' },
    { key: 'health', title: 'System Health & Telemetry', icon: 'feather-activity' },
  ];

  return (
    <aside
      className="corporate-admin-sidebar text-white d-flex flex-column"
      style={{
        width: collapsed ? '70px' : '260px',
        minWidth: collapsed ? '70px' : '260px',
        maxWidth: collapsed ? '70px' : '260px',
        backgroundColor: '#0b1727',
        minHeight: '100vh',
        transition: 'all 0.25s ease',
        zIndex: 1000,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* 1. BRAND HEADER: OPEN UNIVERSITY OF TANZANIA */}
      <div
        className="sidebar-brand px-3 py-3 d-flex align-items-center gap-2 border-bottom"
        style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <Link
          to="/admin/dashboard"
          onClick={() => onSelectView('dashboard')}
          className="d-flex align-items-center gap-2 text-decoration-none text-white overflow-hidden w-100"
        >
          <div
            className="rounded-2 d-flex align-items-center justify-content-center bg-white p-1 shadow-sm flex-shrink-0"
            style={{ width: '36px', height: '36px' }}
          >
            <img
              src="/assets/img/out-logo.png"
              alt="OUT LMS Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e: any) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <div
                className="fw-bold text-white text-truncate"
                style={{
                  fontSize: '15px',
                  letterSpacing: '0.6px',
                  lineHeight: '1.2',
                }}
              >
                OUT LMS
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* 2. SIDEBAR NAVIGATION MENUS (ORIGINAL PROJECT MENUS) */}
      <div className="sidebar-menu-body py-2 flex-grow-1" style={{ fontSize: '13px' }}>
        {/* GOVERNANCE MENU */}
        <div className="px-3 pt-3 pb-1">
          {!collapsed ? (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '10px', letterSpacing: '0.8px', color: '#64748b' }}
            >
              GOVERNANCE MENU
            </div>
          ) : (
            <div className="text-center text-muted small" style={{ fontSize: '9px' }}>
              •••
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-2 px-2">
          {governanceMenuItems.map((menu) => {
            const isActive = activeView === menu.key;
            return (
              <li key={menu.key} className="mb-1">
                <button
                  type="button"
                  onClick={() => onSelectView(menu.key)}
                  className={`w-100 btn text-start d-flex align-items-center justify-content-between px-3 py-2 border-0 rounded-2 text-decoration-none ${
                    isActive ? 'text-white fw-bold' : 'text-light-muted'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.15s ease',
                  }}
                  title={collapsed ? menu.title : undefined}
                >
                  <div className="d-flex align-items-center gap-2 text-truncate">
                    <i className={`${menu.icon} fs-15 flex-shrink-0`} />
                    {!collapsed && <span className="text-truncate">{menu.title}</span>}
                  </div>
                  {!collapsed && menu.badge && (
                    <span
                      className="badge bg-primary text-white rounded-pill px-1"
                      style={{ fontSize: '9px' }}
                    >
                      {menu.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* ADMINISTRATIVE CONSOLES */}
        <div className="px-3 pt-3 pb-1 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          {!collapsed ? (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '10px', letterSpacing: '0.8px', color: '#64748b' }}
            >
              ADMINISTRATIVE CONSOLES
            </div>
          ) : (
            <div className="text-center text-muted small" style={{ fontSize: '9px' }}>
              •••
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-2 px-2">
          {/* Student Directory */}
          <li className="mb-1">
            <Link
              to={route.studentsList}
              className="w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8' }}
              title={collapsed ? 'Student Directory' : undefined}
            >
              <i className="feather-user-check fs-15 flex-shrink-0" />
              {!collapsed && <span>Student Directory</span>}
            </Link>
          </li>

          {/* Faculty Directory */}
          <li className="mb-1">
            <Link
              to={route.instructorList}
              className="w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8' }}
              title={collapsed ? 'Faculty Directory' : undefined}
            >
              <i className="feather-award fs-15 flex-shrink-0" />
              {!collapsed && <span>Faculty Directory</span>}
            </Link>
          </li>

          {/* Course Settings Studio (BBA301) */}
          <li className="mb-1">
            <button
              type="button"
              onClick={() => onOpenCourseStudio?.(4)}
              className="w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 text-warning"
              style={{ backgroundColor: 'transparent' }}
              title={collapsed ? 'Course Settings Studio (BBA301)' : undefined}
            >
              <i className="feather-sliders fs-15 flex-shrink-0 text-warning" />
              {!collapsed && <span>Course Settings Studio (BBA301)</span>}
            </button>
          </li>

          {/* Moodle Site Admin (SSO) */}
          <li className="mb-1">
            <a
              href={adminService.getMoodleSsoUrl('/admin/search.php')}
              target="_blank"
              rel="noreferrer"
              className="w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8' }}
              title={collapsed ? 'Moodle Site Admin (SSO)' : undefined}
            >
              <i className="feather-external-link fs-15 flex-shrink-0 text-info" />
              {!collapsed && <span>Moodle Site Admin (SSO)</span>}
            </a>
          </li>

          {/* Course Management (SSO) */}
          <li className="mb-1">
            <a
              href={adminService.getMoodleSsoUrl('/course/management.php')}
              target="_blank"
              rel="noreferrer"
              className="w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8' }}
              title={collapsed ? 'Course Management (SSO)' : undefined}
            >
              <i className="feather-book fs-15 flex-shrink-0 text-info" />
              {!collapsed && <span>Course Management (SSO)</span>}
            </a>
          </li>

          {/* REST API Swagger (OAS 3.1) */}
          <li className="mb-1">
            <a
              href={adminService.getMoodleSsoUrl('/admin/swagger')}
              target="_blank"
              rel="noreferrer"
              className="w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8' }}
              title={collapsed ? 'REST API Swagger (OAS 3.1)' : undefined}
            >
              <i className="feather-code fs-15 flex-shrink-0 text-warning" />
              {!collapsed && <span>REST API Swagger (OAS 3.1)</span>}
            </a>
          </li>

          {/* Purge All Caches */}
          <li className="mb-1">
            <button
              type="button"
              onClick={() => {
                if (onPurgeCache) onPurgeCache();
              }}
              className="w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 text-light-muted"
              style={{ color: '#94a3b8' }}
              title={collapsed ? 'Purge All Caches' : 'Purge all Moodle caches'}
            >
              <i className="feather-refresh-cw fs-15 flex-shrink-0 text-warning" />
              {!collapsed && <span>Purge All Caches</span>}
            </button>
          </li>
        </ul>
      </div>

      {/* 3. SESSION: SUPER ADMINISTRATOR & SIGN OUT */}
      <div
        className="px-3 py-3 border-top d-flex align-items-center justify-content-between"
        style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: '32px', height: '32px', fontSize: '13px' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="fw-semibold text-white small text-truncate">
                {user?.name || 'University Administrator'}
              </div>
              <div className="text-white-50 text-truncate" style={{ fontSize: '10px' }}>
                {user?.department || 'Directorate of ICT Services & Registrar'}
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-link text-danger p-0 border-0 text-decoration-none"
            title="Sign Out"
          >
            <i className="feather-log-out fs-15" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default CorporateAdminSidebar;
