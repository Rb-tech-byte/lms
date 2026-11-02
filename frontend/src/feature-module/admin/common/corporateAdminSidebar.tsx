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

  // Short, concise menu names to prevent text wrapping or pushing canvas inward
  const governanceMenuItems = [
    { key: 'dashboard', title: 'Dashboard', icon: 'feather-grid' },
    { key: 'siteadmin', title: 'Site Admin', icon: 'feather-layers' },
    { key: 'courses', title: 'Courses', icon: 'feather-book-open' },
    { key: 'plugins', title: 'Plugins', icon: 'feather-cpu' },
    { key: 'settings', title: 'Settings', icon: 'feather-settings' },
    { key: 'users', title: 'Users', icon: 'feather-users' },
    { key: 'ledger', title: 'Financial Ledger', icon: 'feather-dollar-sign' },
    { key: 'health', title: 'System Health', icon: 'feather-activity' },
  ];

  return (
    <aside
      className="corporate-admin-sidebar text-white d-flex flex-column"
      style={{
        width: collapsed ? '64px' : '220px',
        minWidth: collapsed ? '64px' : '220px',
        maxWidth: collapsed ? '64px' : '220px',
        backgroundColor: '#0b1727',
        height: '100vh',
        transition: 'width 0.2s ease, min-width 0.2s ease, max-width 0.2s ease',
        zIndex: 1040,
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* 1. BRAND HEADER: OPEN UNIVERSITY OF TANZANIA (56px TO MATCH TOP HEADER) */}
      <div
        className="sidebar-brand px-3 d-flex align-items-center gap-2 border-bottom flex-shrink-0"
        style={{ height: '56px', borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <Link
          to="/admin/dashboard"
          onClick={() => onSelectView('dashboard')}
          className="d-flex align-items-center gap-2 text-decoration-none text-white overflow-hidden w-100"
        >
          <div
            className="rounded-2 d-flex align-items-center justify-content-center bg-white p-1 shadow-sm flex-shrink-0"
            style={{ width: '32px', height: '32px' }}
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
                  letterSpacing: '0.5px',
                  lineHeight: '1.2',
                }}
              >
                OUT LMS
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* 2. SIDEBAR NAVIGATION MENUS (COMPACT, SHORT NAMES) */}
      <div className="sidebar-menu-body py-2 flex-grow-1" style={{ fontSize: '12.5px' }}>
        {/* GOVERNANCE MENU */}
        <div className="px-3 pt-2 pb-1">
          {!collapsed ? (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '9.5px', letterSpacing: '0.8px', color: '#64748b' }}
            >
              GOVERNANCE MENU
            </div>
          ) : (
            <div className="text-center text-muted small" style={{ fontSize: '8px' }}>
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
                  className={`w-100 btn text-start d-flex align-items-center justify-content-between px-2.5 py-1.5 border-0 rounded-2 text-decoration-none ${
                    isActive ? 'text-white fw-bold' : 'text-light-muted'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.15s ease',
                    fontSize: '12.5px',
                  }}
                  title={collapsed ? menu.title : undefined}
                >
                  <div className="d-flex align-items-center gap-2 text-truncate">
                    <i className={`${menu.icon} fs-15 flex-shrink-0`} />
                    {!collapsed && <span className="text-truncate">{menu.title}</span>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* ADMINISTRATIVE CONSOLES */}
        <div className="px-3 pt-2 pb-1 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          {!collapsed ? (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '9.5px', letterSpacing: '0.8px', color: '#64748b' }}
            >
              ADMIN CONSOLES
            </div>
          ) : (
            <div className="text-center text-muted small" style={{ fontSize: '8px' }}>
              •••
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-2 px-2">
          {/* Students */}
          <li className="mb-1">
            <Link
              to={route.studentsList}
              className="w-100 btn text-start d-flex align-items-center gap-2 px-2.5 py-1.5 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8', fontSize: '12.5px' }}
              title={collapsed ? 'Students' : undefined}
            >
              <i className="feather-user-check fs-15 flex-shrink-0" />
              {!collapsed && <span className="text-truncate">Students</span>}
            </Link>
          </li>

          {/* Faculty */}
          <li className="mb-1">
            <Link
              to={route.instructorList}
              className="w-100 btn text-start d-flex align-items-center gap-2 px-2.5 py-1.5 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8', fontSize: '12.5px' }}
              title={collapsed ? 'Faculty' : undefined}
            >
              <i className="feather-award fs-15 flex-shrink-0" />
              {!collapsed && <span className="text-truncate">Faculty</span>}
            </Link>
          </li>

          {/* Course Studio (BBA301) */}
          <li className="mb-1">
            <button
              type="button"
              onClick={() => onOpenCourseStudio?.(4)}
              className="w-100 btn text-start d-flex align-items-center gap-2 px-2.5 py-1.5 border-0 rounded-2 text-warning"
              style={{ backgroundColor: 'transparent', fontSize: '12.5px' }}
              title={collapsed ? 'Course Studio' : undefined}
            >
              <i className="feather-sliders fs-15 flex-shrink-0 text-warning" />
              {!collapsed && <span className="text-truncate">Course Studio</span>}
            </button>
          </li>

          {/* Moodle Site Admin (SSO) */}
          <li className="mb-1">
            <a
              href={adminService.getMoodleSsoUrl('/admin/search.php')}
              target="_blank"
              rel="noreferrer"
              className="w-100 btn text-start d-flex align-items-center gap-2 px-2.5 py-1.5 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8', fontSize: '12.5px' }}
              title={collapsed ? 'Moodle Admin (SSO)' : undefined}
            >
              <i className="feather-external-link fs-15 flex-shrink-0 text-info" />
              {!collapsed && <span className="text-truncate">Moodle Admin (SSO)</span>}
            </a>
          </li>

          {/* Course Management (SSO) */}
          <li className="mb-1">
            <a
              href={adminService.getMoodleSsoUrl('/course/management.php')}
              target="_blank"
              rel="noreferrer"
              className="w-100 btn text-start d-flex align-items-center gap-2 px-2.5 py-1.5 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8', fontSize: '12.5px' }}
              title={collapsed ? 'Course Mgt (SSO)' : undefined}
            >
              <i className="feather-book fs-15 flex-shrink-0 text-info" />
              {!collapsed && <span className="text-truncate">Course Mgt (SSO)</span>}
            </a>
          </li>

          {/* REST API Swagger (OAS 3.1) */}
          <li className="mb-1">
            <a
              href={adminService.getMoodleSsoUrl('/admin/swagger')}
              target="_blank"
              rel="noreferrer"
              className="w-100 btn text-start d-flex align-items-center gap-2 px-2.5 py-1.5 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8', fontSize: '12.5px' }}
              title={collapsed ? 'API Swagger' : undefined}
            >
              <i className="feather-code fs-15 flex-shrink-0 text-warning" />
              {!collapsed && <span className="text-truncate">API Swagger</span>}
            </a>
          </li>

          {/* Purge Caches */}
          <li className="mb-1">
            <button
              type="button"
              onClick={() => {
                if (onPurgeCache) onPurgeCache();
              }}
              className="w-100 btn text-start d-flex align-items-center gap-2 px-2.5 py-1.5 border-0 rounded-2 text-light-muted"
              style={{ color: '#94a3b8', fontSize: '12.5px' }}
              title={collapsed ? 'Purge Caches' : 'Purge all Moodle caches'}
            >
              <i className="feather-refresh-cw fs-15 flex-shrink-0 text-warning" />
              {!collapsed && <span className="text-truncate">Purge Caches</span>}
            </button>
          </li>
        </ul>
      </div>

      {/* 3. SESSION: UNIVERSITY ADMINISTRATOR & SIGN OUT */}
      <div
        className="px-3 py-2 border-top d-flex align-items-center justify-content-between flex-shrink-0"
        style={{ height: '54px', borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: '28px', height: '28px', fontSize: '12px' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="fw-semibold text-white small text-truncate" style={{ fontSize: '12px', lineHeight: 1.2 }}>
                {user?.name || 'University Admin'}
              </div>
              <div className="text-white-50 text-truncate" style={{ fontSize: '10px' }}>
                {user?.department || 'Directorate of ICT'}
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
            <i className="feather-log-out fs-14" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default CorporateAdminSidebar;
