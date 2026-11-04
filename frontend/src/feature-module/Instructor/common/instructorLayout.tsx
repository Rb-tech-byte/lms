/**
 * InstructorLayout — reusable Faculty Console shell.
 * Wraps every /instructor/* route so each sidebar item opens *inside* the dashboard
 * (persistent sidebar + header, page content rendered through <Outlet />).
 * Live data (identity, KPIs, courses, submissions) is fetched once and shared via context.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { useAuth } from '../../../core/auth/authContext';
import {
  instructorService,
  InstructorCourseItem,
  InstructorIdentity,
  InstructorStats,
  RecentSubmissionItem,
} from '../../../core/api/instructorService';
import './instructorShell.css';

/* ---------------- Shared context ---------------- */
interface InstructorShellState {
  inShell: true;
  loading: boolean;
  refreshing: boolean;
  instructor: InstructorIdentity;
  stats: InstructorStats;
  courses: InstructorCourseItem[];
  submissions: RecentSubmissionItem[];
  reload: () => Promise<void>;
  setCourses: React.Dispatch<React.SetStateAction<InstructorCourseItem[]>>;
  setSubmissions: React.Dispatch<React.SetStateAction<RecentSubmissionItem[]>>;
  setStats: React.Dispatch<React.SetStateAction<InstructorStats>>;
  notify: (msg: string) => void;
}

const InstructorShellContext = createContext<InstructorShellState | null>(null);

/** Returns the shell state, or null when a page is rendered outside the shell. */
export const useInstructorShell = () => useContext(InstructorShellContext);

/* ---------------- Navigation model ---------------- */
interface NavItem {
  title: string;
  icon: string;
  route: string;
  match?: string[];
  badgeKey?: 'courses' | 'pending' | 'students';
}

const MAIN_MENU: NavItem[] = [
  { title: 'Dashboard', icon: 'isax isax-grid-35', route: all_routes.instructorDashboard },
  {
    title: 'Courses',
    icon: 'isax isax-teacher5',
    route: all_routes.instructorCourse,
    match: [all_routes.instructorCourseGrid],
    badgeKey: 'courses',
  },
  { title: 'Announcements', icon: 'isax isax-volume-high5', route: all_routes.instructorAnnouncements },
  { title: 'Assignments', icon: 'isax isax-clipboard-text5', route: all_routes.instructorAssignment, badgeKey: 'pending' },
  {
    title: 'Students',
    icon: 'isax isax-profile-2user5',
    route: all_routes.studentsList,
    match: [all_routes.studentsGrid, all_routes.studentsDetails],
    badgeKey: 'students',
  },
  { title: 'Quiz', icon: 'isax isax-award5', route: all_routes.instructorQuiz, match: [all_routes.instructorQA] },
  { title: 'Quiz Results', icon: 'isax isax-medal-star5', route: all_routes.instructorQuizResult },
  { title: 'Certificates', icon: 'isax isax-note-215', route: all_routes.instructorCertificate },
  { title: 'Earnings', icon: 'isax isax-wallet-add5', route: all_routes.instructorEarning },
  { title: 'Payout', icon: 'isax isax-coin-15', route: all_routes.instructorPayout },
  { title: 'Statements', icon: 'isax isax-shopping-cart5', route: all_routes.instructorStatements },
  { title: 'Messages', icon: 'isax isax-messages-35', route: all_routes.instructorMessage },
  { title: 'Support Tickets', icon: 'isax isax-ticket5', route: all_routes.instructorTickets },
];

const SETTINGS_ROUTES = [
  all_routes.instructorsettings,
  all_routes.instructorChangePassword,
  all_routes.instructorPlan,
  all_routes.instructorSocialProfiles,
  all_routes.instructorLinkedAccounts,
  all_routes.instructorNotification,
  all_routes.instructorIntegrations,
  all_routes.instructorWithdraw,
];

const PAGE_TITLES: Record<string, string> = {
  [all_routes.instructorDashboard]: 'Teaching Dashboard',
  [all_routes.instructorProfile]: 'My Faculty Profile',
  [all_routes.instructorCourse]: 'Directed Courses',
  [all_routes.instructorCourseGrid]: 'Directed Courses',
  [all_routes.instructorAnnouncements]: 'Announcements',
  [all_routes.instructorAssignment]: 'Assignments',
  [all_routes.studentsList]: 'Enrolled Students',
  [all_routes.studentsGrid]: 'Enrolled Students',
  [all_routes.studentsDetails]: 'Student Details',
  [all_routes.instructorQuiz]: 'Quiz Banks',
  [all_routes.instructorQA]: 'Quiz Questions',
  [all_routes.instructorQuizResult]: 'Quiz Results',
  [all_routes.instructorCertificate]: 'Certificates',
  [all_routes.instructorEarning]: 'Earnings',
  [all_routes.instructorPayout]: 'Payout',
  [all_routes.instructorStatements]: 'Statements',
  [all_routes.instructorMessage]: 'Messages',
  [all_routes.instructorTickets]: 'Support Tickets',
  [all_routes.instructorsettings]: 'Faculty Settings',
  [all_routes.instructorChangePassword]: 'Security & Password',
  [all_routes.instructorPlan]: 'Faculty Appointment & Workload',
  [all_routes.instructorSocialProfiles]: 'Scholarly Profiles',
  [all_routes.instructorLinkedAccounts]: 'Linked Accounts',
  [all_routes.instructorNotification]: 'Notification Preferences',
  [all_routes.instructorIntegrations]: 'Moodle Integrations',
  [all_routes.instructorWithdraw]: 'Bursar & Payout Accounts',
};

const DEFAULT_IDENTITY: InstructorIdentity = {
  id: 4,
  fullname: 'Faculty Member',
  title: 'Lecturer',
  email: '',
  department: '',
  avatar: '/assets/img/user/user-01.jpg',
};

const EMPTY_STATS: InstructorStats = {
  totalCourses: 0,
  activeCourses: 0,
  completedCourses: 0,
  totalStudents: 0,
  pendingSubmissions: 0,
  averageRating: '—',
  totalQuizzes: 0,
};

const InstructorLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* ----- layout state ----- */
  const [collapsed, setCollapsed] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem('ins_sidebar_collapsed') === '1'
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('ins_sidebar_collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  // Close drawer / dropdown on route change and scroll to top
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setProfileOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

  /* ----- live data ----- */
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [instructor, setInstructor] = useState<InstructorIdentity>(DEFAULT_IDENTITY);
  const [stats, setStats] = useState<InstructorStats>(EMPTY_STATS);
  const [courses, setCourses] = useState<InstructorCourseItem[]>([]);
  const [submissions, setSubmissions] = useState<RecentSubmissionItem[]>([]);

  const instructorId = role === 'instructor' && (user as any)?.id ? Number((user as any).id) : 4;

  const load = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      try {
        const data = await instructorService.getInstructorDashboardData(instructorId);
        if (data?.success) {
          setInstructor(data.instructor);
          setStats(data.stats);
          setCourses(data.courses || []);
          setSubmissions(data.submissions || []);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [instructorId]
  );

  useEffect(() => {
    load();
  }, [load]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const shellValue = useMemo<InstructorShellState>(
    () => ({
      inShell: true,
      loading,
      refreshing,
      instructor,
      stats,
      courses,
      submissions,
      reload: () => load(true),
      setCourses,
      setSubmissions,
      setStats,
      notify,
    }),
    [loading, refreshing, instructor, stats, courses, submissions, load, notify]
  );

  /* ----- helpers ----- */
  const isActive = (item: NavItem) =>
    location.pathname === item.route || (item.match || []).includes(location.pathname);
  const settingsActive = SETTINGS_ROUTES.includes(location.pathname);

  const badgeFor = (item: NavItem): { text: string; warn?: boolean } | null => {
    if (loading) return null;
    if (item.badgeKey === 'courses' && courses.length) return { text: `${courses.length} Active` };
    if (item.badgeKey === 'pending' && stats.pendingSubmissions)
      return { text: `${stats.pendingSubmissions} New`, warn: true };
    if (item.badgeKey === 'students' && stats.totalStudents) return { text: `${stats.totalStudents}` };
    return null;
  };

  const pageTitle = settingsActive ? 'Teaching Settings' : PAGE_TITLES[location.pathname] || 'Faculty Console';
  const displayName = (user as any)?.name && role === 'instructor' ? (user as any).name : instructor.fullname;
  const displayTitle = instructor.title;
  const avatar = instructor.avatar || '/assets/img/user/user-01.jpg';

  const handleLogout = () => {
    logout();
    navigate(all_routes.homeone);
  };

  const toggleNav = () => {
    if (window.innerWidth < 992) setMobileOpen((o) => !o);
    else setCollapsed((c) => !c);
  };

  return (
    <InstructorShellContext.Provider value={shellValue}>
      <div className={`ins-shell ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}>
        <div className="ins-backdrop" onClick={() => setMobileOpen(false)} />

        {/* ================= SIDEBAR ================= */}
        <aside className="ins-sidebar" aria-label="Faculty navigation">
          <div className="ins-brand">
            <Link to={all_routes.instructorDashboard} title="OUT LMS • Faculty Console">
              <span className="ins-brand-logo">
                <img src="/assets/img/logo.png" alt="OUT" />
              </span>
              <span className="ins-brand-name">
                OUT <span>LMS</span>
              </span>
              <span className="ins-brand-tag">Faculty</span>
            </Link>
            <button
              type="button"
              className="btn btn-link text-white p-0 d-lg-none"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <i className="feather-x fs-18" />
            </button>
          </div>

          <nav className="ins-nav">
            <div className="ins-nav-label">Main Menu</div>
            <div className="ins-nav-label-divider" />
            <ul>
              {MAIN_MENU.map((item) => {
                const badge = badgeFor(item);
                return (
                  <li key={item.route}>
                    <NavLink
                      to={item.route}
                      end
                      className={() => `ins-nav-link ${isActive(item) ? 'active' : ''}`}
                      title={item.title}
                    >
                      <i className={item.icon} />
                      <span className="ins-nav-text">{item.title}</span>
                      {badge && (
                        <span className={`ins-nav-badge ${badge.warn ? 'is-warn' : ''}`}>{badge.text}</span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>

            <div className="ins-nav-label">Account Settings</div>
            <div className="ins-nav-label-divider" />
            <ul>
              <li>
                <NavLink
                  to={all_routes.instructorsettings}
                  className={() => `ins-nav-link ${settingsActive ? 'active' : ''}`}
                  title="Settings"
                >
                  <i className="isax isax-setting-25" />
                  <span className="ins-nav-text">Settings</span>
                </NavLink>
              </li>
              <li>
                <button type="button" className="ins-nav-link is-danger" onClick={handleLogout} title="Logout">
                  <i className="isax isax-logout5" />
                  <span className="ins-nav-text">Logout</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="ins-sidebar-foot">
            <button type="button" className="ins-collapse-btn" onClick={() => setCollapsed((c) => !c)}>
              <i className={`feather-${collapsed ? 'chevrons-right' : 'chevrons-left'}`} />
              <span className="ins-collapse-text">Collapse</span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN ================= */}
        <div className="ins-main">
          <header className="ins-header">
            <div className="ins-header-left">
              <button type="button" className="ins-icon-btn" onClick={toggleNav} aria-label="Toggle navigation">
                <i className="feather-menu" />
              </button>
              <div className="min-w-0">
                <h1 className="ins-page-title">{pageTitle}</h1>
                <div className="ins-page-crumb ins-header-hide-xs">
                  <Link to={all_routes.homeone}>Home</Link> / <Link to={all_routes.instructorDashboard}>Faculty Console</Link> / {pageTitle}
                </div>
              </div>
            </div>

            <div className="ins-header-right">
              <button
                type="button"
                className="ins-icon-btn ins-header-hide-xs"
                onClick={() => load(true)}
                disabled={refreshing}
                title="Refresh live data"
              >
                <i className={`feather-rotate-cw ${refreshing ? 'fa-spin' : ''}`} />
              </button>

              <Link
                to={all_routes.instructorAssignment}
                className="ins-icon-btn"
                title={`${stats.pendingSubmissions} submissions awaiting review`}
              >
                <i className="feather-bell" />
                {stats.pendingSubmissions > 0 && <span className="ins-icon-dot">{stats.pendingSubmissions}</span>}
              </Link>

              <Link to={all_routes.instructorMessage} className="ins-icon-btn ins-header-hide-xs" title="Messages">
                <i className="feather-message-square" />
              </Link>

              {role === 'admin' && (
                <Link
                  to={all_routes.adminDashboard}
                  className="ins-btn ins-btn-primary ins-btn-sm d-none d-md-inline-flex"
                  title="Return to Admin Console"
                >
                  <i className="feather-shield" /> Admin
                </Link>
              )}

              {/* My Profile button on the other side (top header right) */}
              <Link
                to={all_routes.instructorProfile}
                className={`ins-btn ins-btn-sm d-none d-sm-inline-flex align-items-center gap-1.5 ${
                  location.pathname === all_routes.instructorProfile
                    ? 'ins-btn-accent'
                    : 'ins-btn-ghost'
                }`}
                title="View & Edit My Profile"
              >
                <i className="fa-solid fa-user" style={{ fontSize: '11px' }} />
                <span>My Profile</span>
              </Link>

              {/* Profile on the right-hand side */}
              <div className="position-relative ps-2 border-start" ref={profileRef}>
                <button
                  type="button"
                  className="ins-profile-btn"
                  onClick={() => setProfileOpen((o) => !o)}
                  aria-expanded={profileOpen}
                >
                  <span className="ins-avatar">
                    <img src={avatar} alt={displayName} />
                  </span>
                  <span className="ins-profile-meta d-none d-xl-block">
                    <strong>{displayName}</strong>
                    <small>{displayTitle}</small>
                  </span>
                  <i className={`feather-chevron-${profileOpen ? 'up' : 'down'} text-muted d-none d-xl-inline`} />
                </button>

                {profileOpen && (
                  <div className="ins-dropdown">
                    <div className="ins-dropdown-head">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="ins-avatar">
                          <img src={avatar} alt={displayName} />
                        </span>
                        <div className="min-w-0">
                          <strong className="d-block text-dark text-truncate" style={{ fontSize: 13 }}>
                            {displayName}
                          </strong>
                          <small className="text-muted d-block text-truncate" style={{ fontSize: 11 }}>
                            {displayTitle}
                          </small>
                        </div>
                      </div>
                      {instructor.email && (
                        <small className="text-muted d-block text-truncate" style={{ fontSize: 11 }}>
                          <i className="feather-mail me-1" /> {instructor.email}
                        </small>
                      )}
                      {instructor.department && (
                        <small className="text-muted d-block text-truncate" style={{ fontSize: 11 }}>
                          <i className="feather-briefcase me-1" /> {instructor.department}
                        </small>
                      )}
                    </div>
                    <Link to={all_routes.instructorProfile}>
                      <i className="fa-solid fa-user text-primary" /> My Faculty Profile
                    </Link>
                    <Link to={all_routes.instructorCourse}>
                      <i className="isax isax-teacher5 text-success" /> Directed Courses ({courses.length})
                    </Link>
                    <Link to={all_routes.instructorMessage}>
                      <i className="isax isax-messages-35 text-info" /> Messages
                    </Link>
                    <Link to={all_routes.instructorsettings}>
                      <i className="isax isax-setting-25 text-secondary" /> Teaching Settings
                    </Link>
                    <hr className="my-1" />
                    <button type="button" className="ins-dd-item text-danger" onClick={handleLogout}>
                      <i className="isax isax-logout5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="ins-content">
            <Outlet />
          </main>
        </div>

        {toast && (
          <div className="ins-toast" role="status">
            <i className="feather-check-circle text-success fs-18" />
            <span className="flex-grow-1">{toast}</span>
            <button type="button" className="btn-close btn-close-white" onClick={() => setToast(null)} />
          </div>
        )}
      </div>
    </InstructorShellContext.Provider>
  );
};

export default InstructorLayout;

