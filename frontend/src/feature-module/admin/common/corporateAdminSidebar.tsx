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

  // Categorized menu items tailored to fit snug within 130px width (equal to text size, no wasted space)
  const overviewMenus = [
    { key: 'dashboard', title: 'Dashboard', icon: 'feather-grid' },
    { key: 'siteadmin', title: 'Site Admin', icon: 'feather-layers' },
    { key: 'health', title: 'Health', icon: 'feather-activity' },
  ];

  const academicMenus = [
    { key: 'courses', title: 'Courses', icon: 'feather-book-open' },
  ];

  const directoryMenus = [
    { key: 'users', title: 'Users', icon: 'feather-users' },
  ];

  const systemMenus = [
    { key: 'plugins', title: 'Plugins', icon: 'feather-cpu' },
    { key: 'settings', title: 'Settings', icon: 'feather-settings' },
    { key: 'ledger', title: 'Finance', icon: 'feather-dollar-sign' },
  ];

  return (
    <aside
      className="corporate-admin-sidebar text-white d-flex flex-column"
      style={{
        width: collapsed ? '48px' : '130px',
        minWidth: collapsed ? '48px' : '130px',
        maxWidth: collapsed ? '48px' : '130px',
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
      {/* 1. BRAND HEADER: OUT LMS (50px TO MATCH TOP NAVBAR) */}
      <div
        className="sidebar-brand px-2 d-flex align-items-center gap-1.5 border-bottom flex-shrink-0"
        style={{ height: '50px', borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <Link
          to="/admin/dashboard"
          onClick={() => onSelectView('dashboard')}
          className="d-flex align-items-center gap-1.5 text-decoration-none text-white overflow-hidden w-100"
          title="OUT LMS Dashboard"
        >
          <div
            className="rounded-2 d-flex align-items-center justify-content-center bg-white p-0.5 shadow-sm flex-shrink-0"
            style={{ width: '24px', height: '24px' }}
          >
            <img
              src="/assets/img/out-logo.png"
              alt="OUT LMS"
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
                  fontSize: '12.5px',
                  letterSpacing: '0.3px',
                  lineHeight: '1.2',
                }}
              >
                OUT LMS
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* 2. SIDEBAR NAVIGATION MENUS (SNUG 130px WIDTH, EQUAL TO TEXT SIZE) */}
      <div className="sidebar-menu-body py-1 flex-grow-1" style={{ fontSize: '11px' }}>
        {/* SECTION A: OVERVIEW */}
        <div className="px-2 pt-1.5 pb-0.5">
          {!collapsed ? (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '8px', letterSpacing: '0.6px', color: '#64748b' }}
            >
              OVERVIEW
            </div>
          ) : (
            <div className="text-center text-muted small" style={{ fontSize: '7px' }}>
              •••
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-1 px-1">
          {overviewMenus.map((menu) => {
            const isActive = activeView === menu.key;
            return (
              <li key={menu.key} className="mb-0.5">
                <button
                  type="button"
                  onClick={() => onSelectView(menu.key)}
                  className={`w-100 btn text-start d-flex align-items-center px-1.5 py-1 border-0 rounded-2 text-decoration-none ${
                    isActive ? 'text-white fw-semibold' : 'text-light-muted'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.15s ease',
                    fontSize: '11px',
                  }}
                  title={collapsed ? menu.title : undefined}
                >
                  <div className="d-flex align-items-center gap-1.5 text-truncate">
                    <i className={`${menu.icon} fs-13 flex-shrink-0`} />
                    {!collapsed && <span className="text-truncate">{menu.title}</span>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* SECTION B: ACADEMICS */}
        <div className="px-2 pt-1.5 pb-0.5 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
          {!collapsed ? (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '8px', letterSpacing: '0.6px', color: '#64748b' }}
            >
              ACADEMICS
            </div>
          ) : (
            <div className="text-center text-muted small" style={{ fontSize: '7px' }}>
              •••
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-1 px-1">
          {academicMenus.map((menu) => {
            const isActive = activeView === menu.key;
            return (
              <li key={menu.key} className="mb-0.5">
                <button
                  type="button"
                  onClick={() => onSelectView(menu.key)}
                  className={`w-100 btn text-start d-flex align-items-center px-1.5 py-1 border-0 rounded-2 text-decoration-none ${
                    isActive ? 'text-white fw-semibold' : 'text-light-muted'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.15s ease',
                    fontSize: '11px',
                  }}
                  title={collapsed ? menu.title : undefined}
                >
                  <div className="d-flex align-items-center gap-1.5 text-truncate">
                    <i className={`${menu.icon} fs-13 flex-shrink-0`} />
                    {!collapsed && <span className="text-truncate">{menu.title}</span>}
                  </div>
                </button>
              </li>
            );
          })}

          {/* Course Studio */}
          <li className="mb-0.5">
            <button
              type="button"
              onClick={() => onOpenCourseStudio?.(4)}
              className="w-100 btn text-start d-flex align-items-center gap-1.5 px-1.5 py-1 border-0 rounded-2 text-warning"
              style={{ backgroundColor: 'transparent', fontSize: '11px' }}
              title={collapsed ? 'Studio' : undefined}
            >
              <i className="feather-sliders fs-13 flex-shrink-0 text-warning" />
              {!collapsed && <span className="text-truncate">Studio</span>}
            </button>
          </li>

          {/* Course Mgt (SSO) */}
          <li className="mb-0.5">
            <a
              href={adminService.getMoodleSsoUrl('/course/management.php')}
              target="_blank"
              rel="noreferrer"
              className="w-100 btn text-start d-flex align-items-center gap-1.5 px-1.5 py-1 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8', fontSize: '11px' }}
              title={collapsed ? 'Course Mgt' : undefined}
            >
              <i className="feather-book fs-13 flex-shrink-0 text-info" />
              {!collapsed && <span className="text-truncate">Course Mgt</span>}
            </a>
          </li>
        </ul>

        {/* SECTION C: DIRECTORY */}
        <div className="px-2 pt-1.5 pb-0.5 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
          {!collapsed ? (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '8px', letterSpacing: '0.6px', color: '#64748b' }}
            >
              DIRECTORY
            </div>
          ) : (
            <div className="text-center text-muted small" style={{ fontSize: '7px' }}>
              •••
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-1 px-1">
          {/* Students */}
          <li className="mb-0.5">
            <Link
              to={route.studentsList}
              className="w-100 btn text-start d-flex align-items-center gap-1.5 px-1.5 py-1 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8', fontSize: '11px' }}
              title={collapsed ? 'Students' : undefined}
            >
              <i className="feather-user-check fs-13 flex-shrink-0" />
              {!collapsed && <span className="text-truncate">Students</span>}
            </Link>
          </li>

          {/* Faculty */}
          <li className="mb-0.5">
            <Link
              to={route.instructorList}
              className="w-100 btn text-start d-flex align-items-center gap-1.5 px-1.5 py-1 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8', fontSize: '11px' }}
              title={collapsed ? 'Faculty' : undefined}
            >
              <i className="feather-award fs-13 flex-shrink-0" />
              {!collapsed && <span className="text-truncate">Faculty</span>}
            </Link>
          </li>

          {/* Users */}
          {directoryMenus.map((menu) => {
            const isActive = activeView === menu.key;
            return (
              <li key={menu.key} className="mb-0.5">
                <button
                  type="button"
                  onClick={() => onSelectView(menu.key)}
                  className={`w-100 btn text-start d-flex align-items-center px-1.5 py-1 border-0 rounded-2 text-decoration-none ${
                    isActive ? 'text-white fw-semibold' : 'text-light-muted'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.15s ease',
                    fontSize: '11px',
                  }}
                  title={collapsed ? menu.title : undefined}
                >
                  <div className="d-flex align-items-center gap-1.5 text-truncate">
                    <i className={`${menu.icon} fs-13 flex-shrink-0`} />
                    {!collapsed && <span className="text-truncate">{menu.title}</span>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* SECTION D: SYSTEM */}
        <div className="px-2 pt-1.5 pb-0.5 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
          {!collapsed ? (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '8px', letterSpacing: '0.6px', color: '#64748b' }}
            >
              SYSTEM
            </div>
          ) : (
            <div className="text-center text-muted small" style={{ fontSize: '7px' }}>
              •••
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-1 px-1">
          {systemMenus.map((menu) => {
            const isActive = activeView === menu.key;
            return (
              <li key={menu.key} className="mb-0.5">
                <button
                  type="button"
                  onClick={() => onSelectView(menu.key)}
                  className={`w-100 btn text-start d-flex align-items-center px-1.5 py-1 border-0 rounded-2 text-decoration-none ${
                    isActive ? 'text-white fw-semibold' : 'text-light-muted'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.15s ease',
                    fontSize: '11px',
                  }}
                  title={collapsed ? menu.title : undefined}
                >
                  <div className="d-flex align-items-center gap-1.5 text-truncate">
                    <i className={`${menu.icon} fs-13 flex-shrink-0`} />
                    {!collapsed && <span className="text-truncate">{menu.title}</span>}
                  </div>
                </button>
              </li>
            );
          })}

          {/* Moodle Admin (SSO) */}
          <li className="mb-0.5">
            <a
              href={adminService.getMoodleSsoUrl('/admin/search.php')}
              target="_blank"
              rel="noreferrer"
              className="w-100 btn text-start d-flex align-items-center gap-1.5 px-1.5 py-1 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8', fontSize: '11px' }}
              title={collapsed ? 'Moodle' : undefined}
            >
              <i className="feather-external-link fs-13 flex-shrink-0 text-info" />
              {!collapsed && <span className="text-truncate">Moodle</span>}
            </a>
          </li>

          {/* REST API Swagger (OAS 3.1) */}
          <li className="mb-0.5">
            <a
              href={adminService.getMoodleSsoUrl('/admin/swagger')}
              target="_blank"
              rel="noreferrer"
              className="w-100 btn text-start d-flex align-items-center gap-1.5 px-1.5 py-1 border-0 rounded-2 text-decoration-none"
              style={{ color: '#94a3b8', fontSize: '11px' }}
              title={collapsed ? 'Swagger' : undefined}
            >
              <i className="feather-code fs-13 flex-shrink-0 text-warning" />
              {!collapsed && <span className="text-truncate">Swagger</span>}
            </a>
          </li>

          {/* Purge Caches */}
          <li className="mb-0.5">
            <button
              type="button"
              onClick={() => {
                if (onPurgeCache) onPurgeCache();
              }}
              className="w-100 btn text-start d-flex align-items-center gap-1.5 px-1.5 py-1 border-0 rounded-2 text-light-muted"
              style={{ color: '#94a3b8', fontSize: '11px' }}
              title={collapsed ? 'Purge' : 'Purge all caches'}
            >
              <i className="feather-refresh-cw fs-13 flex-shrink-0 text-warning" />
              {!collapsed && <span className="text-truncate">Purge</span>}
            </button>
          </li>
        </ul>
      </div>

      {/* 3. SESSION: UNIVERSITY ADMINISTRATOR & SIGN OUT (PINNED TO BOTTOM, 48px) */}
      <div
        className="px-2 py-1 border-top d-flex align-items-center justify-content-between flex-shrink-0"
        style={{ height: '48px', borderColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: '#070f1a' }}
      >
        <div className="d-flex align-items-center gap-1.5 overflow-hidden">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: '24px', height: '24px', fontSize: '10px' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="fw-semibold text-white small text-truncate" style={{ fontSize: '11px', lineHeight: 1.1 }}>
                {user?.name || 'OUT Admin'}
              </div>
              <div className="text-white-50 text-truncate" style={{ fontSize: '9px' }}>
                {user?.department || 'Directorate of ICT'}
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-link text-danger p-0 border-0 text-decoration-none flex-shrink-0 ms-1"
            title="Sign Out"
          >
            <i className="feather-log-out fs-13" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default CorporateAdminSidebar;
