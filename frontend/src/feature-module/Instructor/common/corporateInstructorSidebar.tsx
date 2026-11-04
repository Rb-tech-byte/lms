import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/authContext';
import { instructorSidebarData } from '../../../core/common/data/json/instructor-sidebar';
import { all_routes } from '../../router/all_routes';
import { useInstructorIdentity } from './useInstructorIdentity';
import '../../student/common/studentPortal.css';

interface CorporateInstructorSidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
}

/** Maps each project instructor route to the in-portal view key. */
const ROUTE_TO_VIEW: Record<string, string> = {
  [all_routes.instructorDashboard]: 'dashboard',
  [all_routes.instructorProfile]: 'profile',
  [all_routes.instructorCourse]: 'courses',
  [all_routes.instructorAnnouncements]: 'announcements',
  [all_routes.instructorAssignment]: 'assignments',
  [all_routes.studentsList]: 'students',
  [all_routes.instructorQuiz]: 'quiz',
  [all_routes.instructorQuizResult]: 'quiz-results',
  [all_routes.instructorCertificate]: 'certificates',
  [all_routes.instructorEarning]: 'earnings',
  [all_routes.instructorPayout]: 'payout',
  [all_routes.instructorStatements]: 'statements',
  [all_routes.instructorMessage]: 'messages',
  [all_routes.instructorTickets]: 'tickets',
};

export const CorporateInstructorSidebar: React.FC<CorporateInstructorSidebarProps> = ({
  activeView,
  onSelectView,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const instructor = useInstructorIdentity();

  const handleLogout = () => {
    logout();
    navigate(all_routes.homeone);
  };

  return (
    <aside className="sp-sidebar" aria-label="Faculty navigation">
      <Link
        to={all_routes.instructorDashboard}
        className="sp-brand"
        onClick={() => onSelectView('dashboard')}
        title="OUT LMS • Faculty Teaching Console"
      >
        <span className="sp-brand-mark">
          <img src="/assets/img/logo.png" alt="OUT" />
        </span>
        <span className="sp-brand-text">
          <span className="sp-brand-name d-block">
            OUT <span>LMS</span>
          </span>
          <span className="sp-brand-sub d-block">Faculty Teaching Console</span>
        </span>
      </Link>

      <nav className="sp-nav">
        <div className="sp-nav-label">Academic Management</div>
        <ul>
          {instructorSidebarData.map((menu: any) => {
            const key = ROUTE_TO_VIEW[menu.route] || 'dashboard';
            const isActive = activeView === key;
            return (
              <li key={menu.route}>
                <button
                  type="button"
                  className={`sp-nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => onSelectView(key)}
                  title={menu.title}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <i className={menu.icon} />
                  <span className="sp-nav-text">{menu.title}</span>
                  {menu.title === 'Assignments' && (
                    <span className="sp-nav-badge">2 New</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="sp-nav-label">Faculty Governance</div>
        <ul>
          <li>
            <button
              type="button"
              className={`sp-nav-item ${activeView === 'settings' ? 'is-active' : ''}`}
              onClick={() => onSelectView('settings')}
              title="Settings"
            >
              <i className="isax isax-setting-25" />
              <span className="sp-nav-text">Teaching Settings</span>
            </button>
          </li>
          <li>
            <button type="button" className="sp-nav-item is-logout" onClick={handleLogout} title="Logout">
              <i className="isax isax-logout5" />
              <span className="sp-nav-text">Sign Out</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="sp-user">
        <img
          src={instructor.avatar}
          alt={instructor.name}
          className="sp-user-avatar"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
          }}
        />
        <div className="sp-user-info">
          <div className="sp-user-name" title={instructor.name}>{instructor.name}</div>
          <div className="sp-user-role">{instructor.title}</div>
          <div className="sp-user-meta" title={instructor.department}>
            <span>{instructor.staffId}</span>
          </div>
        </div>
        <button
          type="button"
          className="sp-user-logout"
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
        >
          <i className="ti ti-logout" />
        </button>
      </div>
    </aside>
  );
};

export default CorporateInstructorSidebar;
