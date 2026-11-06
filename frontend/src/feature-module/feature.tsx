import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "../core/common/header/header";
import BackToTop from "../core/common/backtotop/backToTop";
import Footer from "../core/common/footer/footer";
import { useAuth } from "../core/auth/authContext";
import {
  studentProtectedRoutes,
  instructorProtectedRoutes,
  adminProtectedRoutes,
} from "./router/router.link";

const PROTECTED_DASHBOARD_PATHS = new Set<string>([
  ...studentProtectedRoutes.map((r) => r.path),
  ...instructorProtectedRoutes.map((r) => r.path),
  ...adminProtectedRoutes.map((r) => r.path),
]);

const Feature = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isImpersonating, stopImpersonation } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleExitImpersonation = () => {
    const returnUrl = stopImpersonation();
    navigate(returnUrl);
  };

  const impersonationBanner = isImpersonating && user ? (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 2050,
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        borderRadius: '999px',
        padding: '6px 8px 6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.35)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        fontSize: '11.5px',
      }}
    >
      <span className="d-inline-flex align-items-center gap-1">
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            display: 'inline-block',
          }}
        />
        <span>
          Impersonating <strong>{user.name}</strong> ({user.role})
        </span>
      </span>
      <button
        type="button"
        onClick={handleExitImpersonation}
        className="btn btn-sm rounded-pill fw-bold"
        style={{
          backgroundColor: '#013BA6',
          color: '#ffffff',
          fontSize: '11px',
          padding: '3px 10px',
          border: 'none',
        }}
      >
        Return to Admin Users
      </button>
    </div>
  ) : null;

  const isHome = location.pathname === '/' || location.pathname === '/index' || location.pathname === '/index-6';
  const isAdminCategoryRoute =
    role === 'admin' &&
    (location.pathname.startsWith('/course/course-category') ||
      location.pathname.startsWith('/courses/course-category') ||
      location.pathname.startsWith('/course-category'));

  const isDashboardLayout =
    PROTECTED_DASHBOARD_PATHS.has(location.pathname) ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/instructor') ||
    location.pathname.startsWith('/student') ||
    location.pathname.startsWith('/course/add-course') ||
    location.pathname.startsWith('/courses/add-course') ||
    location.pathname === '/add-course' ||
    location.pathname.startsWith('/course/course-watch') ||
    location.pathname.startsWith('/course/course-resume') ||
    isAdminCategoryRoute;

  if (isDashboardLayout) {
    return (
      <div className="admin-root-container" style={{ background: '#f4f6fa', minHeight: '100vh', margin: 0, padding: 0 }}>
        {impersonationBanner}
        <Outlet />
      </div>
    );
  }

  return (
    <>
      <div className="main-wrapper">
        {impersonationBanner}
        <div className={isHome ? 'home-page home-six' : ''}>
          <Header />
          <Outlet />
          {isHome ? <></> : <Footer />}
          <BackToTop />
        </div>

        <div className="sidebar-overlay"></div>
      </div>
    </>
  );
};

export default Feature;
