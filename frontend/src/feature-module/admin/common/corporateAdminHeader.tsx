import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/authContext';
import { all_routes } from '../../router/all_routes';

interface CorporateAdminHeaderProps {
  onToggleSidebar: () => void;
  onPurgeCache?: () => void;
  isPurging?: boolean;
  activeView?: string;
  onSelectView?: (view: string) => void;
}

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Executive Overview & Live Telemetry',
  courses: 'Course Catalog & Curriculum Management',
  categories: 'Academic Faculties & Course Categories',
  users: 'University User Directory & RBAC',
  ledger: 'Tuition & Pesapal IPN Audit Ledger',
  corporate: 'Corporate Enterprise Cohorts (IEMT)',
  settings: 'Institutional CMS & Content Studio',
  plugins: 'Moodle Extensions & Payment Gateways',
  health: 'System Health & Server Telemetry',
};

export const CorporateAdminHeader: React.FC<CorporateAdminHeaderProps> = ({
  onToggleSidebar,
  onPurgeCache,
  isPurging = false,
  activeView = 'dashboard',
  onSelectView,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const openCmsStudio = () => {
    if (onSelectView) {
      onSelectView('settings');
    } else {
      navigate('/admin/dashboard?tab=settings');
    }
  };

  return (
    <header
      className="corporate-admin-header bg-white border-bottom px-3 px-md-4 d-flex align-items-center justify-content-between sticky-top flex-shrink-0"
      style={{
        height: '56px',
        zIndex: 990,
        borderColor: '#e2e8f0',
      }}
    >
      {/* Left: Sidebar Toggle + Clean Active Section Pill */}
      <div className="d-flex align-items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="btn btn-sm btn-light border-0 p-1.5 d-flex align-items-center justify-content-center rounded-3"
          style={{ width: '34px', height: '34px', color: '#334155', backgroundColor: '#f1f5f9' }}
          title="Toggle Sidebar"
        >
          <i className="feather-menu" style={{ fontSize: '16px' }} />
        </button>

        <span
          className="badge rounded-pill px-3 py-1.5 fw-semibold"
          style={{
            background: '#f1f5f9',
            color: '#0f172a',
            fontSize: '12px',
          }}
        >
          {VIEW_LABELS[activeView] || 'Dashboard'}
        </span>
      </div>

      {/* Right: Quick Actions (Users & Impersonation, CMS Studio, Public Site, Purge Caches) */}
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (onSelectView) {
              onSelectView('users');
            } else {
              navigate('/admin/dashboard?tab=users');
            }
          }}
          className={`btn btn-sm rounded-pill px-3 py-1 d-none d-md-inline-flex align-items-center gap-1.5 fw-semibold ${
            activeView === 'users' ? 'btn-primary' : 'btn-light text-dark border'
          }`}
          style={{ fontSize: '11.5px' }}
          title="Manage Users & Impersonate Roles"
        >
          <i className="feather-users" style={{ fontSize: '12px' }} />
          <span>Users &amp; Impersonation</span>
        </button>

        <button
          type="button"
          onClick={openCmsStudio}
          className={`btn btn-sm rounded-pill px-3 py-1 d-none d-sm-inline-flex align-items-center gap-1.5 fw-semibold ${
            activeView === 'settings' ? 'btn-primary' : 'btn-light text-dark border'
          }`}
          style={{ fontSize: '11.5px' }}
          title="Open Unified Settings & OUT Digital Campus Content Studio"
        >
          <i className={`feather-sliders ${activeView === 'settings' ? 'text-white' : 'text-primary'}`} style={{ fontSize: '12px' }} />
          <span>Settings &amp; Studio</span>
        </button>

        {onPurgeCache && (
          <button
            type="button"
            onClick={onPurgeCache}
            disabled={isPurging}
            className="btn btn-sm btn-light border rounded-pill px-3 py-1 d-none d-lg-inline-flex align-items-center gap-1.5 fw-semibold text-dark"
            style={{ fontSize: '11.5px' }}
            title="Refresh Platform Caches"
          >
            <i className={`feather-refresh-cw text-warning ${isPurging ? 'fa-spin' : ''}`} style={{ fontSize: '12px' }} />
            <span>{isPurging ? 'Purging...' : 'Refresh Cache'}</span>
          </button>
        )}

        <Link
          to={all_routes.home}
          className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5 fw-semibold"
          style={{ fontSize: '11.5px' }}
          title="Open Public Website"
        >
          <i className="feather-external-link" style={{ fontSize: '12px' }} />
          <span className="d-none d-sm-inline">Public Site</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate(all_routes.login);
          }}
          className="btn btn-sm btn-light border rounded-circle d-inline-flex align-items-center justify-content-center text-danger"
          style={{ width: '32px', height: '32px' }}
          title={`Sign Out (${user?.name || 'Admin'})`}
        >
          <i className="feather-log-out" style={{ fontSize: '13px' }} />
        </button>
      </div>
    </header>
  );
};

export default CorporateAdminHeader;
