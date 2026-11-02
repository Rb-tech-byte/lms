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
      className="corporate-admin-header bg-white border-bottom px-3 px-md-4 d-flex align-items-center justify-content-between sticky-top flex-shrink-0"
      style={{
        height: '50px',
        zIndex: 990,
        borderColor: '#e2e8f0',
      }}
    >
      {/* Left: Hamburger menu toggle + Console title */}
      <div className="d-flex align-items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="btn btn-sm btn-light border-0 p-1.5 d-flex align-items-center justify-content-center rounded-2"
          style={{ width: '30px', height: '30px', color: '#334155', backgroundColor: '#f1f5f9' }}
          title="Toggle Navigation Menu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="d-none d-sm-flex align-items-center gap-2 small text-muted" style={{ fontSize: '12px' }}>
          <span className="fw-bold text-dark">Executive Governance</span>
          <span className="text-muted">•</span>
          <span>OUT LMS Console</span>
        </div>
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
