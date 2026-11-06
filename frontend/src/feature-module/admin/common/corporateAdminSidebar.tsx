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
    path?: string;
    accentColor?: string;
    activeGradient?: string;
  }>;
}

export const CorporateAdminSidebar: React.FC<CorporateAdminSidebarProps> = ({
  collapsed,
  activeView,
  onSelectView,
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
      groupLabel: 'CONSOLE & GOVERNANCE',
      items: [
        { key: 'dashboard', title: 'Overview & KPI', icon: 'feather-grid', badge: 'LIVE', accentColor: '#38bdf8', activeGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' },
        { key: 'api-gateway', title: 'Admin & APIs', icon: 'feather-terminal', badge: '85+ API', accentColor: '#c084fc', activeGradient: 'linear-gradient(135deg, #9333ea 0%, #6d28d9 100%)' },
        { key: 'api-docs', title: 'API Hub', icon: 'feather-code', badge: 'OPENAPI', path: '/pages/api-docs', accentColor: '#38bdf8', activeGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' },
        { key: 'certificates', title: 'Beautiful Diplomas', icon: 'feather-award', badge: '6 THEMES', accentColor: '#fbbf24', activeGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' },
        { key: 'courses', title: 'Courses Catalog', icon: 'feather-book-open', badge: 'CUD', accentColor: '#34d399', activeGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
        { key: 'categories', title: 'Faculties & Cats', icon: 'feather-folder', badge: 'CUD', accentColor: '#fb923c', activeGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' },
        { key: 'users', title: 'User Directory', icon: 'feather-users', badge: 'RBAC', accentColor: '#60a5fa', activeGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' },
        { key: 'ledger', title: 'Tuition & Pesapal', icon: 'feather-credit-card', badge: 'IPN', accentColor: '#2dd4bf', activeGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' },
      ],
    },
    {
      groupLabel: 'SYSTEM & CAPABILITIES',
      items: [
        { key: 'corporate', title: 'Corporate Cohorts', icon: 'feather-briefcase', badge: 'B2B', accentColor: '#f472b6', activeGradient: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)' },
        { key: 'settings', title: 'CMS Content Studio', icon: 'feather-sliders', badge: 'CMS', accentColor: '#a78bfa', activeGradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' },
        { key: 'plugins', title: '77 System Features', icon: 'feather-cpu', badge: '77', accentColor: '#facc15', activeGradient: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)' },
        { key: 'health', title: 'System Health', icon: 'feather-activity', badge: '99.98%', accentColor: '#4ade80', activeGradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' },
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
        background: 'linear-gradient(180deg, #013BA6 0%, #013BA6 100%)',
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
                        if (item.path) {
                          navigate(item.path);
                        } else if (item.isStudio) {
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
                          ? item.activeGradient || 'linear-gradient(135deg, #013BA6 0%, #013BA6 100%)'
                          : 'rgba(255,255,255,0.06)',
                        color: isActive ? '#ffffff' : '#f1f5f9',
                        fontWeight: isActive ? 700 : 600,
                        fontSize: '12.5px',
                        borderLeft: `3px solid ${isActive ? '#F4ED2D' : item.accentColor || '#38bdf8'}`,
                        boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.28)' : 'none',
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
                            color: isActive ? '#F4ED2D' : item.accentColor || '#38bdf8',
                          }}
                        />
                        {!collapsed && <span className="text-truncate">{item.title}</span>}
                      </div>

                      {!collapsed && item.badge && (
                        <span
                          className="badge rounded-pill"
                          style={{
                            background: isActive ? '#F4ED2D' : 'rgba(15,23,42,0.45)',
                            color: isActive ? '#061838' : item.accentColor || '#F4ED2D',
                            fontSize: '9px',
                            fontWeight: 800,
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
