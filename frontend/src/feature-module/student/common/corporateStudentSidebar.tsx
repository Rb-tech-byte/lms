import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/authContext';
import { studentSidebarData } from '../../../core/common/data/json/student-sidebar';
import { all_routes } from '../../router/all_routes';
import { useStudentIdentity } from './useStudentIdentity';
import './studentPortal.css';

interface CorporateStudentSidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
}

/** Maps each project sidebar route to the in-portal view key. */
const ROUTE_TO_VIEW: Record<string, string> = {
  [all_routes.studentDashboard]: 'dashboard',
  [all_routes.studentProfile]: 'profile',
  [all_routes.studentCourses]: 'courses',
  [all_routes.studentCertificates]: 'certificates',
  [all_routes.studentWishlist]: 'wishlist',
  [all_routes.studentReviews]: 'reviews',
  [all_routes.studentQuiz]: 'quizzes',
  [all_routes.studentOrderHistory]: 'orders',
  [all_routes.studentReferral]: 'referrals',
  [all_routes.studentMessage]: 'messages',
  [all_routes.studentTickets]: 'tickets',
};

export const CorporateStudentSidebar: React.FC<CorporateStudentSidebarProps> = ({
  activeView,
  onSelectView,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const student = useStudentIdentity();

  const handleLogout = () => {
    logout();
    navigate(all_routes.homeone);
  };

  return (
    <aside className="sp-sidebar" aria-label="Student navigation">
      <Link
        to={all_routes.studentDashboard}
        className="sp-brand"
        onClick={() => onSelectView('dashboard')}
        title="OUT LMS • The Open University of Tanzania"
      >
        <span className="sp-brand-mark">
          <img src="/assets/img/logo.png" alt="OUT" />
        </span>
        <span className="sp-brand-text">
          <span className="sp-brand-name d-block">
            OUT <span>LMS</span>
          </span>
          <span className="sp-brand-sub d-block">Open University of Tanzania</span>
        </span>
      </Link>

      <nav className="sp-nav">
        <div className="sp-nav-label">Main Menu</div>
        <ul>
          {studentSidebarData.map((menu: any) => {
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
                </button>
              </li>
            );
          })}
        </ul>

        <div className="sp-nav-label">Account Settings</div>
        <ul>
          <li>
            <button
              type="button"
              className={`sp-nav-item ${activeView === 'settings' ? 'is-active' : ''}`}
              onClick={() => onSelectView('settings')}
              title="Settings"
            >
              <i className="isax isax-setting-25" />
              <span className="sp-nav-text">Settings</span>
            </button>
          </li>
          <li>
            <button type="button" className="sp-nav-item is-logout" onClick={handleLogout} title="Logout">
              <i className="isax isax-logout5" />
              <span className="sp-nav-text">Logout</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="sp-user">
        <img
          src={student.avatar}
          alt={student.name}
          className="sp-user-avatar"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/img/user/user-02.jpg';
          }}
        />
        <div className="sp-user-info">
          <div className="sp-user-name" title={student.name}>{student.name}</div>
          <div className="sp-user-role">{student.title}</div>
          <div className="sp-user-meta" title={student.department}>
            <i className="feather-hash me-1" />
            {student.regNumber}
          </div>
        </div>
        <button type="button" className="sp-user-logout" onClick={handleLogout} title="Logout" aria-label="Logout">
          <i className="feather-log-out" />
        </button>
      </div>
    </aside>
  );
};

export default CorporateStudentSidebar;
