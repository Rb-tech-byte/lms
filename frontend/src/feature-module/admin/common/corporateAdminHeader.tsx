import React from 'react';
import { Link } from 'react-router-dom';

interface CorporateAdminHeaderProps {
  onToggleSidebar: () => void;
  onPurgeCache?: () => void;
}

export const CorporateAdminHeader: React.FC<CorporateAdminHeaderProps> = ({
  onToggleSidebar,
  onPurgeCache,
}) => {
  return (
    <header
      className="corporate-admin-header bg-white border-bottom px-4 d-flex align-items-center justify-content-between sticky-top"
      style={{
        height: '56px',
        zIndex: 990,
        borderColor: '#e2e8f0',
      }}
    >
      {/* Left: Hamburger menu toggle */}
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="btn btn-sm btn-light border-0 p-2 d-flex align-items-center justify-content-center rounded-2"
          style={{ width: '36px', height: '36px', color: '#334155' }}
          title="Toggle Navigation Menu"
        >
          <i className="feather-menu fs-18" />
        </button>
      </div>

      {/* Right: Visit Website link & quick indicators */}
      <div className="d-flex align-items-center gap-3">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-decoration-none d-flex align-items-center gap-2 small fw-semibold"
          style={{ color: '#64748b' }}
          title="Visit Public LMS Portal"
        >
          <span style={{ fontSize: '15px' }}>🌐</span>
          <span>Visit Website</span>
        </Link>

        {onPurgeCache && (
          <button
            type="button"
            onClick={onPurgeCache}
            className="btn btn-sm btn-outline-light text-secondary border px-2 py-1 small rounded-pill d-none d-md-flex align-items-center gap-1"
            title="Purge Moodle Caches"
          >
            <i className="feather-refresh-cw small" />
            <span style={{ fontSize: '11px' }}>Purge Caches</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default CorporateAdminHeader;
