import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ImageWithBasePath from '../imageWithBasePath';
import { useAuth } from '../../auth/authContext';
import { all_routes } from '../../../feature-module/router/all_routes';
import { setDataTheme } from '../../redux/themeSettingSlice';
import { useCmsConfig } from '../../api/cmsService';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, role, isAuthenticated, logout } = useAuth();
  const { cms } = useCmsConfig();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dataTheme = useSelector((state: any) => state.themeSetting?.dataTheme || 'light');

  const handleDataThemeChange = (theme: string) => {
    dispatch(setDataTheme(theme));
  };

  const handleLogout = () => {
    logout();
    navigate(all_routes.homeone);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('class', dataTheme);
  }, [dataTheme]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const headerCfg = cms.header;
  const seenRoutes = new Set<string>();
  const visibleNavItems = (headerCfg.navItems || []).filter((item) => {
    if (!item.visible) return false;
    if (item.label === 'New Menu Link') return false;
    if (seenRoutes.has(item.route)) return false;
    seenRoutes.add(item.route);
    if (Array.isArray(item.roles) && item.roles.length > 0) {
      return item.roles.includes(role);
    }
    return true;
  });

  return (
    <>
      {/* Compact CMS-Driven Top Utility Strip */}
      {headerCfg.showTopbar && (
        <div
          style={{
            background: 'linear-gradient(90deg, #013BA6 0%, #013BA6 50%, #013BA6 100%)', color: '#ffffff', fontSize: '12px', borderBottom: '2px solid #F4ED2D',
          }}
          className="py-1 px-2"
        >
          <div className="container d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center flex-wrap gap-3">
              {headerCfg.announcementBadge && (
                <span
                  className="badge rounded-pill px-2 py-1 fw-semibold"
                  style={{ background: '#F4ED2D', color: '#003B66', fontSize: '11px', fontWeight: 700 }}
                >
                  <i className="isax isax-verify me-1" />
                  {headerCfg.announcementBadge}
                </span>
              )}
              <span className="d-none d-md-inline-flex align-items-center">
                <i className="isax isax-location me-1" style={{ color: "#F4ED2D" }} />
                {headerCfg.topbarAddress}
              </span>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="d-none d-sm-inline-flex align-items-center">
                <i className="isax isax-call-calling me-1" style={{ color: "#F4ED2D" }} />
                {headerCfg.topbarPhone}
              </span>
              <span className="d-none d-lg-inline-flex align-items-center">
                <i className="isax isax-sms me-1" style={{ color: "#F4ED2D" }} />
                {headerCfg.topbarEmail}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Clean Compact Sticky Main Header */}
      <header
        className={scrolled ? 'shadow-sm' : ''}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1030,
          background: dataTheme === 'dark-mode' ? '#0f172a' : '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          transition: 'all 0.2s ease',
        }}
      >
        <div className="container">
          <div
            className="d-flex align-items-center justify-content-between py-2"
            style={{ minHeight: '62px' }}
          >
            {/* Brand Identity */}
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-light d-lg-none border"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle navigation"
              >
                <i className={`isax ${mobileOpen ? 'isax-close-circle' : 'isax-menu-1'} fs-18`} />
              </button>

              <Link
                to={all_routes.homeone}
                className="d-inline-flex align-items-center gap-2 text-decoration-none"
                style={{ whiteSpace: 'nowrap' }}
              >
                <img
                  src={headerCfg.logoUrl || '/assets/img/out-logo.png'}
                  alt="LMS"
                  style={{ width: '36px', height: '36px', objectFit: 'contain', flexShrink: 0 }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/img/logo.svg';
                  }}
                />
                <span
                  className="fw-bold"
                  style={{
                    fontSize: '16px',
                    letterSpacing: '0.03em',
                    color: dataTheme === 'dark-mode' ? '#f8fafc' : '#0f172a',
                  }}
                >
                  LMS
                </span>
              </Link>
            </div>

            {/* Dynamic Color-Coded Desktop Navigation Links */}
            <nav className="d-none d-lg-flex align-items-center gap-1 flex-wrap" style={{ whiteSpace: 'nowrap' }}>
              {visibleNavItems.map((item, idx) => {
                const isActive =
                  location.pathname === item.route ||
                  (item.route === '/index' && location.pathname === '/');
                const navPalette = [
                  { color: '#013BA6', bg: 'rgba(1,113,187,0.12)', activeBg: '#013BA6', border: 'rgba(1,113,187,0.3)', icon: 'isax-home-2' },
                  { color: '#059669', bg: 'rgba(5,150,105,0.12)', activeBg: '#059669', border: 'rgba(5,150,105,0.3)', icon: 'isax-book-1' },
                  { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', activeBg: '#7c3aed', border: 'rgba(124,58,237,0.3)', icon: 'isax-courthouse' },
                  { color: '#d97706', bg: 'rgba(217,119,6,0.12)', activeBg: '#d97706', border: 'rgba(217,119,6,0.3)', icon: 'isax-teacher' },
                  { color: '#e11d48', bg: 'rgba(225,29,72,0.12)', activeBg: '#e11d48', border: 'rgba(225,29,72,0.3)', icon: 'isax-notification-bing' },
                  { color: '#0d9488', bg: 'rgba(13,148,136,0.12)', activeBg: '#0d9488', border: 'rgba(13,148,136,0.3)', icon: 'isax-info-circle' },
                  { color: '#4f46e5', bg: 'rgba(79,70,229,0.12)', activeBg: '#4f46e5', border: 'rgba(79,70,229,0.3)', icon: 'isax-call' },
                ];
                const theme = navPalette[idx % navPalette.length];
                return (
                  <Link
                    key={item.id}
                    to={item.route}
                    className="px-2 py-1 rounded-pill text-decoration-none fw-bold d-inline-flex align-items-center gap-1"
                    style={{
                      fontSize: '12.5px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      color: isActive ? '#ffffff' : theme.color,
                      background: isActive ? theme.activeBg : theme.bg,
                      border: `1px solid ${isActive ? theme.activeBg : theme.border}`,
                      boxShadow: isActive ? `0 3px 8px ${theme.border}` : 'none',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <i className={`isax ${item.icon || theme.icon}`} style={{ fontSize: '13px' }} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Colorful Quick-Access Pills for Diploma Studio, API Docs & Headless Admin Console */}
              <Link
                to="/pages/verify-certificate?code=OUT-35CB03BB3C"
                className="px-2 py-1 rounded-pill text-decoration-none fw-bold d-inline-flex align-items-center gap-1"
                style={{
                  fontSize: '12.5px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  color: location.pathname.includes('verify-certificate') ? '#061838' : '#b45309',
                  background: location.pathname.includes('verify-certificate') ? '#F4ED2D' : 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.45)',
                }}
              >
                <i className="isax isax-medal-star" style={{ fontSize: '13px' }} />
                <span>Diplomas</span>
              </Link>

              {isAuthenticated && user && (
                <Link
                  to={user.dashboardUrl}
                  className="px-2 py-1 rounded-pill text-decoration-none fw-bold ms-1 d-inline-flex align-items-center gap-1"
                  style={{
                    fontSize: '12.5px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    border: '1px solid #059669',
                  }}
                >
                  <i className="isax isax-element-4" style={{ fontSize: '13px' }} />
                  <span>Dashboard</span>
                </Link>
              )}
            </nav>

            {/* Right Actions */}
            <div className="d-flex align-items-center gap-2">
              {/* Theme Switcher */}
              <button
                type="button"
                onClick={() => handleDataThemeChange(dataTheme === 'light' ? 'dark-mode' : 'light')}
                className="btn btn-sm btn-light border rounded-circle d-inline-flex align-items-center justify-content-center"
                style={{ width: '34px', height: '34px' }}
                title="Toggle Light / Dark Mode"
              >
                <i className={`isax ${dataTheme === 'light' ? 'isax-moon' : 'isax-sun-15'} fs-16`} />
              </button>

              {/* Course Cart */}
              <Link
                to={all_routes.courseCart}
                className="btn btn-sm btn-light border rounded-circle position-relative d-inline-flex align-items-center justify-content-center"
                style={{ width: '34px', height: '34px' }}
                title="Course Selection Cart"
              >
                <i className="isax isax-shopping-cart fs-16" />
              </Link>

              {isAuthenticated && user ? (
                <div className="dropdown">
                  <button
                    type="button"
                    className="btn btn-sm btn-light border rounded-pill d-inline-flex align-items-center gap-2 ps-1 pe-2 py-1 dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <ImageWithBasePath
                      src={user.avatar || 'assets/img/user/user-02.jpg'}
                      alt={user.name}
                      className="rounded-circle"
                      width={26}
                      height={26}
                    />
                    <span className="d-none d-md-inline fw-semibold" style={{ fontSize: '12.5px' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <span
                      className={`badge rounded-pill ${role === 'admin'
                        ? 'bg-danger'
                        : role === 'instructor'
                          ? 'bg-primary'
                          : 'bg-success'
                        }`}
                      style={{ fontSize: '10px' }}
                    >
                      {role.toUpperCase()}
                    </span>
                  </button>

                  <div className="dropdown-menu dropdown-menu-end shadow-sm border p-2" style={{ minWidth: '230px' }}>
                    <div className="px-2 py-2 border-bottom mb-1">
                      <div className="fw-bold" style={{ fontSize: '13.5px' }}>{user.name}</div>
                      <div className="text-muted" style={{ fontSize: '11.5px' }}>{user.email}</div>
                    </div>
                    <Link className="dropdown-item rounded py-1 small fw-medium" to={user.dashboardUrl}>
                      <i className="isax isax-element-4 me-2 text-primary" />
                      Open {role === 'admin' ? 'Admin' : role === 'instructor' ? 'Lecturer' : 'Student'} Dashboard
                    </Link>
                    {role === 'student' && (
                      <>
                        <Link className="dropdown-item rounded py-1 small" to={all_routes.studentCourses}>
                          <i className="isax isax-book me-2 text-primary" />
                          Enrolled Courses
                        </Link>
                        <Link className="dropdown-item rounded py-1 small" to={all_routes.studentCertificates}>
                          <i className="isax isax-award me-2 text-primary" />
                          Certificates &amp; Grades
                        </Link>
                      </>
                    )}
                    {role === 'instructor' && (
                      <>
                        <Link className="dropdown-item rounded py-1 small" to={all_routes.instructorCourse}>
                          <i className="isax isax-teacher me-2 text-primary" />
                          Manage Courses
                        </Link>
                        <Link className="dropdown-item rounded py-1 small" to={all_routes.addNewCourse}>
                          <i className="isax isax-add-circle me-2 text-primary" />
                          Create Course
                        </Link>
                      </>
                    )}
                    {role === 'admin' && (
                      <Link
                        to="/admin/dashboard?tab=settings"
                        className="dropdown-item rounded py-1 small text-start"
                      >
                        <i className="isax isax-edit-2 me-2 text-info" />
                        Admin Content Studio
                      </Link>
                    )}
                    <div className="border-top mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="dropdown-item rounded py-1 small text-danger fw-medium"
                      >
                        <i className="isax isax-logout me-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link
                    to={all_routes.login}
                    className="btn btn-sm btn-outline-primary rounded-2 px-3 fw-semibold"
                    style={{ fontSize: '13px' }}
                  >
                    {headerCfg.ctaSignInText || 'Sign In'}
                  </Link>
                  <Link
                    to={all_routes.register}
                    className="btn btn-sm btn-primary rounded-2 px-3 fw-semibold d-none d-sm-inline-flex align-items-center"
                    style={{ fontSize: '13px', background: '#013BA6', borderColor: '#013BA6' }}
                  >
                    {headerCfg.ctaRegisterText || 'Apply / Register'}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Responsive Mobile Drawer */}
          {mobileOpen && (
            <div className="d-lg-none border-top py-2">
              <div className="d-flex flex-column gap-1">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.route}
                    className="px-3 py-2 rounded text-decoration-none fw-medium d-flex align-items-center gap-2"
                    style={{ color: '#1e293b', fontSize: '13.5px' }}
                  >
                    {item.icon && <i className={`isax ${item.icon} text-primary`} />}
                    <span>{item.label}</span>
                  </Link>
                ))}
                {role === 'admin' && (
                  <Link
                    to="/admin/dashboard?tab=settings"
                    className="btn btn-sm btn-outline-secondary mt-1 text-start"
                  >
                    <i className="isax isax-setting-2 me-2" />
                    Settings &amp; Content Studio
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
