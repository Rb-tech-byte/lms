import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
  onToggle,
  activeView,
  onSelectView,
  onOpenCourseStudio,
  onPurgeCache,
}) => {
  const location = useLocation();

  // Submenu open/close state for dropdown items
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    academic: false,
    users: false,
    engagement: false,
    system: false,
  });

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
      {/* 1. TOP BRAND / CREST HEADER */}
      <div
        className="sidebar-brand px-3 py-3 d-flex align-items-center gap-2 border-bottom"
        style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <div className="d-flex align-items-center gap-1 flex-shrink-0">
          {/* Bank / University Dual Crest Logos */}
          <div
            className="rounded d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              fontSize: '14px',
            }}
            title="People's Bank of Zanzibar / OUT LMS"
          >
            🏛️
          </div>
          <div
            className="rounded d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              fontSize: '14px',
            }}
            title="Corporate LMS Academy"
          >
            🎓
          </div>
        </div>

        {!collapsed && (
          <div className="overflow-hidden">
            <div
              className="fw-bold text-white text-truncate"
              style={{
                fontSize: '11px',
                letterSpacing: '0.4px',
                lineHeight: '1.2',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              PEOPLE'S BANK OF ZANZIBAR •
            </div>
            <div
              className="fw-bold text-truncate"
              style={{
                fontSize: '10px',
                color: '#38bdf8',
                letterSpacing: '0.5px',
                lineHeight: '1.2',
              }}
            >
              CORPORATE LMS ACADEMY
            </div>
          </div>
        )}
      </div>

      {/* 2. SIDEBAR NAVIGATION GROUPS */}
      <div className="sidebar-menu-body py-2 flex-grow-1" style={{ fontSize: '13px' }}>
        {/* GROUP 1: CORE OVERVIEW */}
        <div className="px-3 pt-3 pb-1">
          {!collapsed && (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '10px', letterSpacing: '0.8px', color: '#64748b' }}
            >
              CORE OVERVIEW
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-1 px-2">
          <li>
            <button
              type="button"
              onClick={() => onSelectView('dashboard')}
              className={`w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 text-decoration-none ${
                activeView === 'dashboard'
                  ? 'text-white fw-bold'
                  : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'dashboard' ? '#0284c7' : 'transparent',
                color: activeView === 'dashboard' ? '#ffffff' : '#94a3b8',
                transition: 'background-color 0.15s ease',
              }}
            >
              <i className="feather-home fs-15" />
              {!collapsed && <span>Dashboard</span>}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectView('reports')}
              className={`w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 text-decoration-none ${
                activeView === 'reports' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'reports' ? '#0284c7' : 'transparent',
                color: activeView === 'reports' ? '#ffffff' : '#94a3b8',
              }}
            >
              <i className="feather-pie-chart fs-15" />
              {!collapsed && <span>Reports & Analytics</span>}
            </button>
          </li>
        </ul>

        {/* GROUP 2: ACADEMIC & LEARNING */}
        <div className="px-3 pt-3 pb-1">
          {!collapsed && (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '10px', letterSpacing: '0.8px', color: '#64748b' }}
            >
              ACADEMIC & LEARNING
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-1 px-2">
          {/* Courses & Curriculum */}
          <li>
            <button
              type="button"
              onClick={() => {
                toggleSubmenu('academic');
                onSelectView('courses');
              }}
              className={`w-100 btn text-start d-flex align-items-center justify-content-between px-3 py-2 border-0 rounded-2 ${
                activeView === 'courses' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'courses' ? '#0284c7' : 'transparent',
                color: activeView === 'courses' ? '#ffffff' : '#94a3b8',
              }}
            >
              <div className="d-flex align-items-center gap-2 text-truncate">
                <i className="feather-book-open fs-15" />
                {!collapsed && <span>Courses & Curriculum</span>}
              </div>
              {!collapsed && (
                <i
                  className={`feather-chevron-${openSubmenus.academic ? 'down' : 'right'} fs-12 opacity-60`}
                />
              )}
            </button>
            {openSubmenus.academic && !collapsed && (
              <ul className="list-unstyled ps-4 pe-2 py-1 small">
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectView('courses')}
                    className="w-100 btn btn-sm text-start py-1 px-2 text-light-muted border-0 text-white-50 hover-text-white"
                  >
                    • Course Models List
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenCourseStudio?.(4)}
                    className="w-100 btn btn-sm text-start py-1 px-2 text-light-muted border-0 text-info hover-text-white"
                  >
                    • Course #4 Studio (BBA301)
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* Assessments & Activity */}
          <li>
            <button
              type="button"
              onClick={() => onSelectView('assessments')}
              className={`w-100 btn text-start d-flex align-items-center justify-content-between px-3 py-2 border-0 rounded-2 ${
                activeView === 'assessments' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'assessments' ? '#0284c7' : 'transparent',
                color: activeView === 'assessments' ? '#ffffff' : '#94a3b8',
              }}
            >
              <div className="d-flex align-items-center gap-2 text-truncate">
                <i className="feather-check-square fs-15" />
                {!collapsed && <span>Assessments & Activity</span>}
              </div>
              {!collapsed && <i className="feather-chevron-right fs-12 opacity-60" />}
            </button>
          </li>

          {/* Events & Classes */}
          <li>
            <button
              type="button"
              onClick={() => onSelectView('events')}
              className={`w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 ${
                activeView === 'events' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'events' ? '#0284c7' : 'transparent',
                color: activeView === 'events' ? '#ffffff' : '#94a3b8',
              }}
            >
              <i className="feather-calendar fs-15" />
              {!collapsed && <span>Events & Classes</span>}
            </button>
          </li>
        </ul>

        {/* GROUP 3: COMPLIANCE & BOT AUDIT */}
        <div className="px-3 pt-3 pb-1">
          {!collapsed && (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '10px', letterSpacing: '0.8px', color: '#64748b' }}
            >
              COMPLIANCE & BOT AUDIT
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-1 px-2">
          <li>
            <button
              type="button"
              onClick={() => onSelectView('oversight')}
              className={`w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 ${
                activeView === 'oversight' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'oversight' ? '#0284c7' : 'transparent',
                color: activeView === 'oversight' ? '#ffffff' : '#94a3b8',
              }}
            >
              <i className="feather-shield fs-15" />
              {!collapsed && <span>Branch Oversight Matrix</span>}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectView('compliance')}
              className={`w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 ${
                activeView === 'compliance' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'compliance' ? '#0284c7' : 'transparent',
                color: activeView === 'compliance' ? '#ffffff' : '#94a3b8',
              }}
            >
              <i className="feather-cpu fs-15" />
              {!collapsed && <span>BOT Compliance Engine</span>}
            </button>
          </li>
        </ul>

        {/* GROUP 4: USERS & ENROLLMENT */}
        <div className="px-3 pt-3 pb-1">
          {!collapsed && (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '10px', letterSpacing: '0.8px', color: '#64748b' }}
            >
              USERS & ENROLLMENT
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-1 px-2">
          <li>
            <button
              type="button"
              onClick={() => onSelectView('enrollments')}
              className={`w-100 btn text-start d-flex align-items-center justify-content-between px-3 py-2 border-0 rounded-2 ${
                activeView === 'enrollments' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'enrollments' ? '#0284c7' : 'transparent',
                color: activeView === 'enrollments' ? '#ffffff' : '#94a3b8',
              }}
            >
              <div className="d-flex align-items-center gap-2 text-truncate">
                <i className="feather-user-check fs-15" />
                {!collapsed && <span>Enrollments</span>}
              </div>
              {!collapsed && <i className="feather-chevron-right fs-12 opacity-60" />}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectView('users')}
              className={`w-100 btn text-start d-flex align-items-center justify-content-between px-3 py-2 border-0 rounded-2 ${
                activeView === 'users' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'users' ? '#0284c7' : 'transparent',
                color: activeView === 'users' ? '#ffffff' : '#94a3b8',
              }}
            >
              <div className="d-flex align-items-center gap-2 text-truncate">
                <i className="feather-briefcase fs-15" />
                {!collapsed && <span>Bank Staff & Officers</span>}
              </div>
              {!collapsed && <i className="feather-chevron-right fs-12 opacity-60" />}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectView('instructors')}
              className={`w-100 btn text-start d-flex align-items-center justify-content-between px-3 py-2 border-0 rounded-2 ${
                activeView === 'instructors' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'instructors' ? '#0284c7' : 'transparent',
                color: activeView === 'instructors' ? '#ffffff' : '#94a3b8',
              }}
            >
              <div className="d-flex align-items-center gap-2 text-truncate">
                <i className="feather-award fs-15" />
                {!collapsed && <span>Instructors</span>}
              </div>
              {!collapsed && <i className="feather-chevron-right fs-12 opacity-60" />}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectView('deletions')}
              className={`w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 ${
                activeView === 'deletions' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'deletions' ? '#0284c7' : 'transparent',
                color: activeView === 'deletions' ? '#ffffff' : '#94a3b8',
              }}
            >
              <i className="feather-user-x fs-15" />
              {!collapsed && <span>Account Deletions</span>}
            </button>
          </li>
        </ul>

        {/* GROUP 5: ENGAGEMENT & MARKETING */}
        <div className="px-3 pt-3 pb-1">
          {!collapsed && (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '10px', letterSpacing: '0.8px', color: '#64748b' }}
            >
              ENGAGEMENT & MARKETING
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-1 px-2">
          <li>
            <button
              type="button"
              onClick={() => onSelectView('reviews')}
              className={`w-100 btn text-start d-flex align-items-center justify-content-between px-3 py-2 border-0 rounded-2 ${
                activeView === 'reviews' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'reviews' ? '#0284c7' : 'transparent',
                color: activeView === 'reviews' ? '#ffffff' : '#94a3b8',
              }}
            >
              <div className="d-flex align-items-center gap-2 text-truncate">
                <i className="feather-star fs-15" />
                {!collapsed && <span>Reviews & Ratings</span>}
              </div>
              {!collapsed && <i className="feather-chevron-right fs-12 opacity-60" />}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectView('blogs')}
              className={`w-100 btn text-start d-flex align-items-center justify-content-between px-3 py-2 border-0 rounded-2 ${
                activeView === 'blogs' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'blogs' ? '#0284c7' : 'transparent',
                color: activeView === 'blogs' ? '#ffffff' : '#94a3b8',
              }}
            >
              <div className="d-flex align-items-center gap-2 text-truncate">
                <i className="feather-file-text fs-15" />
                {!collapsed && <span>Blogs & News</span>}
              </div>
              {!collapsed && <i className="feather-chevron-right fs-12 opacity-60" />}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectView('communications')}
              className={`w-100 btn text-start d-flex align-items-center justify-content-between px-3 py-2 border-0 rounded-2 ${
                activeView === 'communications' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'communications' ? '#0284c7' : 'transparent',
                color: activeView === 'communications' ? '#ffffff' : '#94a3b8',
              }}
            >
              <div className="d-flex align-items-center gap-2 text-truncate">
                <i className="feather-message-square fs-15" />
                {!collapsed && <span>Communications</span>}
              </div>
              {!collapsed && <i className="feather-chevron-right fs-12 opacity-60" />}
            </button>
          </li>
        </ul>

        {/* GROUP 6: SYSTEM & PLATFORM */}
        <div className="px-3 pt-3 pb-1">
          {!collapsed && (
            <div
              className="text-uppercase fw-bold text-truncate"
              style={{ fontSize: '10px', letterSpacing: '0.8px', color: '#64748b' }}
            >
              SYSTEM & PLATFORM
            </div>
          )}
        </div>
        <ul className="list-unstyled mb-3 px-2">
          <li>
            <button
              type="button"
              onClick={() => onSelectView('frontend_manager')}
              className={`w-100 btn text-start d-flex align-items-center justify-content-between px-3 py-2 border-0 rounded-2 ${
                activeView === 'frontend_manager' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'frontend_manager' ? '#0284c7' : 'transparent',
                color: activeView === 'frontend_manager' ? '#ffffff' : '#94a3b8',
              }}
            >
              <div className="d-flex align-items-center gap-2 text-truncate">
                <i className="feather-layout fs-15" />
                {!collapsed && <span>Frontend Manager</span>}
              </div>
              {!collapsed && <i className="feather-chevron-right fs-12 opacity-60" />}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectView('languages')}
              className={`w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 ${
                activeView === 'languages' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'languages' ? '#0284c7' : 'transparent',
                color: activeView === 'languages' ? '#ffffff' : '#94a3b8',
              }}
            >
              <i className="feather-globe fs-15" />
              {!collapsed && <span>Language Manager</span>}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectView('siteadmin')}
              className={`w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 ${
                activeView === 'siteadmin' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'siteadmin' ? '#0284c7' : 'transparent',
                color: activeView === 'siteadmin' ? '#ffffff' : '#94a3b8',
              }}
            >
              <i className="feather-settings fs-15" />
              {!collapsed && <span>Settings & Config</span>}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                if (onPurgeCache) onPurgeCache();
                onSelectView('maintenance');
              }}
              className={`w-100 btn text-start d-flex align-items-center gap-2 px-3 py-2 border-0 rounded-2 ${
                activeView === 'maintenance' ? 'text-white fw-bold' : 'text-light-muted'
              }`}
              style={{
                backgroundColor: activeView === 'maintenance' ? '#0284c7' : 'transparent',
                color: activeView === 'maintenance' ? '#ffffff' : '#94a3b8',
              }}
            >
              <i className="feather-tool fs-15" />
              {!collapsed && <span>System Maintenance</span>}
            </button>
          </li>
        </ul>
      </div>

      {/* Bottom User Quick Indicator */}
      <div
        className="px-3 py-2 border-top d-flex align-items-center justify-content-between"
        style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: '28px', height: '28px', fontSize: '11px' }}
          >
            A
          </div>
          {!collapsed && (
            <div className="text-truncate">
              <div className="fw-semibold text-white small text-truncate">Administrator</div>
              <div className="text-white-50" style={{ fontSize: '10px' }}>
                PBZ • OUT LMS
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <Link to="/" className="text-white-50 hover-text-white small" title="Exit to Public Portal">
            <i className="feather-log-out fs-14" />
          </Link>
        )}
      </div>
    </aside>
  );
};

export default CorporateAdminSidebar;
