import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/authContext';
import { all_routes } from '../../router/all_routes';

interface CorporateAdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenCourseStudio?: (courseId: number) => void;
  onPurgeCache?: () => void;
}

interface SidebarNavGroup {
  groupLabel: string;
  items: Array<{
    key: string;
    title: string;
    icon: string;
    badge?: string;
    isStudio?: boolean;
  }>;
}

export const CorporateAdminSidebar: React.FC<CorporateAdminSidebarProps> = ({
  collapsed,
  activeView,
  onSelectView,
  onOpenCourseStudio,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const route = all_routes;

  const handleLogout = () => {
    logout();
    navigate(route.homeone);
  };

  const navGroups: SidebarNavGroup[] = [
    {
      groupLabel: 'CONSOLE',
      items: [
        { key: 'dashboard', title: 'Overview & KPI', icon: 'feather-grid' },
        { key: 'courses', title: 'Courses Catalog', icon: 'feather-book-open', badge: 'CUD' },
        { key: 'categories', title: 'Faculties & Cats', icon: 'feather-folder', badge: 'CUD' },
        { key: 'users', title: 'User Directory', icon: 'feather-users', badge: 'RBAC' },
        { key: 'ledger', title: 'Tuition & Pesapal', icon: 'feather-credit-card', badge: 'IPN' },
      ],
    },
    {
      groupLabel: 'MANAGEMENT',
      items: [
        { key: 'corporate', title: 'Corporate Cohorts', icon: 'feather-briefcase', badge: 'B2B' },
        { key: 'settings', title: 'CMS Content Studio', icon: 'feather-sliders', badge: 'CMS' },
        { key: 'plugins', title: 'Extensions', icon: 'feather-cpu' },
        { key: 'health', title: 'System Health', icon: 'feather-activity' },
      ],
    },
  ];

  const sidebarWidth = collapsed ? '68px' : '220px';

  return (
    <aside
      className="corporate-admin-sidebar text-white d-flex flex-column"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        background: 'linear-gradient(180deg, #005B97 0%, #0171BB 100%)',
        height: '100vh',
        transition: 'width 0.2s ease, min-width 0.2s ease, max-width 0.2s ease',
        zIndex: 1040,
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        boxShadow: '4px 0 20px rgba(11, 31, 58, 0.14)',
      }}
    >
      {/* 1. BRAND HEADER: Clean Crest + LMS (No bottom border line) */}
      <div
        className="px-3 d-flex align-items-center justify-content-between flex-shrink-0"
        style={{ height: '56px' }}
      >
        <Link
          to="/admin/dashboard"
          onClick={() => onSelectView('dashboard')}
          className="d-flex align-items-center gap-2 text-decoration-none text-white overflow-hidden"
          title="LMS Admin Dashboard"
        >
          <div
            className="rounded-3 d-flex align-items-center justify-content-center bg-white p-1 shadow-sm flex-shrink-0"
            style={{ width: '30px', height: '30px' }}
          >
            <img
              src="/assets/img/out-logo.png"
              alt="LMS"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e: any) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {!collapsed && (
            <div className="d-flex align-items-center gap-1.5 overflow-hidden">
              <span
                className="fw-bold text-white"
                style={{
                  fontSize: '15px',
                  letterSpacing: '0.02em',
                }}
              >
                LMS
              </span>
              <span
                className="badge rounded-pill"
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  fontSize: '9px',
                  fontWeight: 700,
                }}
              >
                ADMIN
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* 2. NAVIGATION ITEMS (No divider lines between groups or items) */}
      <div className="px-2 py-1 flex-grow-1">
        {navGroups.map((group, gIdx) => (
          <div key={group.groupLabel} className={gIdx > 0 ? 'mt-3' : 'mt-1'}>
            {!collapsed && (
              <div
                className="px-2.5 mb-1 text-uppercase fw-bold"
                style={{
                  fontSize: '9.5px',
                  letterSpacing: '0.08em',
                  color: '#64748b',
                }}
              >
                {group.groupLabel}
              </div>
            )}

            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
              {group.items.map((item) => {
                const isActive =
                  activeView === item.key ||
                  (item.key === 'categories' &&
                    (activeView === 'course-category' || activeView === 'category')) ||
                  (item.key === 'studio' && activeView === 'course-details');

                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.isStudio) {
                          onSelectView('courses');
                        } else {
                          onSelectView(item.key);
                        }
                      }}
                      className={`w-100 btn text-start d-flex align-items-center ${
                        collapsed ? 'justify-content-center px-0' : 'justify-content-between px-2.5'
                      } py-2 border-0 rounded-3 text-decoration-none`}
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, #0171BB 0%, #005B97 100%)'
                          : 'transparent',
                        color: isActive ? '#ffffff' : '#cbd5e1',
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '12.5px',
                        boxShadow: isActive ? '0 4px 12px rgba(2, 132, 199, 0.28)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                      title={collapsed ? item.title : undefined}
                    >
                      <div className="d-flex align-items-center gap-2 text-truncate">
                        <i
                          className={`${
                            item.icon === 'feather-Sliders' ? 'feather-sliders' : item.icon
                          } flex-shrink-0`}
                          style={{
                            fontSize: '14px',
                            color: isActive ? '#ffffff' : '#94a3b8',
                          }}
                        />
                        {!collapsed && <span className="text-truncate">{item.title}</span>}
                      </div>

                      {!collapsed && item.badge && (
                        <span
                          className="badge rounded-pill"
                          style={{
                            background: isActive ? 'rgba(255,255,255,0.22)' : 'rgba(56,189,248,0.15)',
                            color: isActive ? '#ffffff' : '#FFD200',
                            fontSize: '9px',
                            fontWeight: 700,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* 3. BOTTOM COMPACT ADMIN PROFILE CAPSULE (No border line) */}
      <div className="p-2 flex-shrink-0">
        <div
          className="px-2.5 py-2 rounded-3 d-flex align-items-center justify-content-between"
          style={{ background: 'rgba(255, 255, 255, 0.06)' }}
        >
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
              style={{
                width: '28px',
                height: '28px',
                fontSize: '11px',
                background: '#f59e0b',
                color: '#0f172a',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div
                  className="fw-semibold text-white text-truncate"
                  style={{ fontSize: '11.5px', lineHeight: 1.15 }}
                >
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-truncate" style={{ fontSize: '10px', color: '#94a3b8' }}>
                  System Admin
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-link text-warning p-0 border-0 text-decoration-none flex-shrink-0 ms-1"
              title="Sign Out"
            >
              <i className="feather-log-out" style={{ fontSize: '14px' }} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CorporateAdminSidebar;
