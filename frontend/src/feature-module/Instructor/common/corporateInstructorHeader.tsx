import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/authContext';
import { all_routes } from '../../router/all_routes';
import { useInstructorIdentity } from './useInstructorIdentity';

export interface FacultyNotification {
  id: string | number;
  title: string;
  time: string;
  icon: string;
  tone: 'amber' | 'sky' | 'green';
}

interface CorporateInstructorHeaderProps {
  pageTitle: string;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTab: (tab: string) => void;
  notifications?: FacultyNotification[];
}

const TONES: Record<FacultyNotification['tone'], { bg: string; fg: string }> = {
  amber: { bg: 'rgba(244, 237, 45, 0.22)', fg: '#061838' },
  sky: { bg: '#E8F4FC', fg: '#013BA6' },
  green: { bg: '#F0F9FF', fg: '#228DDD' },
};

export const CorporateInstructorHeader: React.FC<CorporateInstructorHeaderProps> = ({
  pageTitle,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onSelectTab,
  notifications = [],
}) => {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const instructor = useInstructorIdentity();
  const searchRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState<'English' | 'Kiswahili'>('English');

  // "/" focuses search (ignored while typing in another field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const today = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const handleLogout = () => {
    logout();
    navigate(all_routes.homeone);
  };

  return (
    <header className="sp-topbar">
      <div className="sp-topbar-left">
        <button type="button" className="sp-icon-btn" onClick={onToggleSidebar} aria-label="Toggle navigation">
          <i className="ti ti-menu-2 fs-18" />
        </button>
        <div className="min-w-0">
          <div className="sp-page-date">{today}</div>
          <h1 className="sp-page-title m-0">{pageTitle}</h1>
        </div>
      </div>

      <div className="sp-topbar-right">
        {role === 'admin' && (
          <button
            type="button"
            className="btn btn-sm btn-dark d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
            style={{ fontSize: 11.5, fontWeight: 600 }}
            onClick={() => navigate(all_routes.adminDashboard)}
            title="Return to Super Administrator Console"
          >
            <span>🛡️</span>
            <span>Admin Console</span>
          </button>
        )}
        <div className="sp-search">
          <i className="ti ti-search" />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search courses, students, submissions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) onSelectTab('courses');
            }}
            aria-label="Search teaching dashboard"
          />
          <kbd>/</kbd>
        </div>

        <div className="dropdown sp-lang-wrap">
          <button type="button" className="sp-lang" data-bs-toggle="dropdown" aria-expanded="false">
            <i className="ti ti-world" />
            <span>{language}</span>
            <i className="ti ti-chevron-down" style={{ fontSize: 12, color: '#94a3b8' }} />
          </button>
          <ul className="dropdown-menu dropdown-menu-end sp-dropdown py-1">
            {(['English', 'Kiswahili'] as const).map((lang) => (
              <li key={lang}>
                <button
                  type="button"
                  className={`dropdown-item ${language === lang ? 'active' : ''}`}
                  onClick={() => setLanguage(lang)}
                >
                  {lang}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="dropdown">
          <button type="button" className="sp-icon-btn" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Notifications">
            <i className="ti ti-bell fs-18" />
            {notifications.length > 0 && <span className="sp-count">{notifications.length}</span>}
          </button>
          <div className="dropdown-menu dropdown-menu-end sp-dropdown p-0" style={{ width: 320 }}>
            <div className="px-3 py-2 border-bottom fw-semibold d-flex align-items-center justify-content-between" style={{ fontSize: 13 }}>
              <span>Faculty Action Items</span>
              <span className="badge bg-primary-subtle text-primary" style={{ fontSize: 10 }}>Moodle 5.x Sync</span>
            </div>
            {notifications.length === 0 ? (
              <div className="px-3 py-3 text-muted" style={{ fontSize: 12.5 }}>All student submissions graded.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="sp-notif-item">
                  <span className="sp-notif-icon" style={{ background: TONES[n.tone].bg, color: TONES[n.tone].fg }}>
                    <i className={n.icon} />
                  </span>
                  <div className="min-w-0">
                    <div className="fw-semibold text-dark" style={{ fontSize: 12.5 }}>{n.title}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{n.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dropdown">
          <button type="button" className="sp-avatar-btn" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Account menu">
            <img
              src={instructor.avatar}
              alt={instructor.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
              }}
            />
          </button>
          <ul className="dropdown-menu dropdown-menu-end sp-dropdown py-1" style={{ minWidth: 240 }}>
            <li className="px-3 py-2 border-bottom">
              <div className="fw-semibold text-dark" style={{ fontSize: 13 }}>{instructor.name}</div>
              <div className="text-muted" style={{ fontSize: 11.5 }}>{instructor.staffId} • {instructor.title}</div>
            </li>
            <li>
              <button type="button" className="dropdown-item" onClick={() => onSelectTab('profile')}>
                <i className="isax isax-user" /> Faculty Profile
              </button>
            </li>
            <li>
              <button type="button" className="dropdown-item" onClick={() => onSelectTab('courses')}>
                <i className="isax isax-teacher" /> Assigned Courses
              </button>
            </li>
            <li>
              <button type="button" className="dropdown-item" onClick={() => onSelectTab('assignments')}>
                <i className="isax isax-clipboard-text" /> Grading Queue
              </button>
            </li>
            <li>
              <button type="button" className="dropdown-item" onClick={() => onSelectTab('settings')}>
                <i className="ti ti-settings" /> Faculty Settings
              </button>
            </li>
            <li className="border-top mt-1 pt-1">
              <button type="button" className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="ti ti-logout text-danger" /> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default CorporateInstructorHeader;
