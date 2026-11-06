import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { useAuth } from '../../../core/auth/authContext';
import { DEMO_USERS } from '../../../core/auth/demoUsers';
import { AuthBrandHeader, AuthSideShowcase } from '../common/authSideShowcase';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const route = all_routes;
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (fallbackUrl?: string, loginIdentifier?: string) => {
    const idLower = (loginIdentifier || email || '').trim().toLowerCase();
    try {
      const storedUser = JSON.parse(localStorage.getItem('out_lms_auth_user') || '{}');
      if (
        storedUser?.role === 'admin' ||
        idLower === 'admin' ||
        idLower === 'admin@out.ac.tz' ||
        idLower === 'ict@out.ac.tz'
      ) {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      if (
        storedUser?.role === 'instructor' ||
        idLower === 'instructor' ||
        idLower === 'instructor@out.ac.tz'
      ) {
        navigate(route.instructorDashboard, { replace: true });
        return;
      }
      if (storedUser?.dashboardUrl) {
        navigate(storedUser.dashboardUrl, { replace: true });
        return;
      }
    } catch {
      // Fallback below
    }
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    navigate(fallbackUrl || route.studentDashboard, { replace: true });
  };

  const handleDemoClick = async (roleKey: 'student' | 'instructor' | 'coursecreator' | 'admin') => {
    const creds = DEMO_USERS[roleKey];
    setEmail(creds.email);
    setPassword(creds.password);
    setErrorMessage('');
    setActiveDemoRole(roleKey);
    setSubmitting(true);
    try {
      const ok = await login(creds.email, creds.password);
      if (ok) {
        if (roleKey === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (roleKey === 'coursecreator') {
          navigate('/course/add-course', { replace: true });
        } else if (roleKey === 'instructor') {
          navigate(route.instructorDashboard || '/instructor/instructor-dashboard', { replace: true });
        } else {
          redirectAfterLogin(creds.dashboardUrl, creds.email);
        }
      } else {
        setErrorMessage(`Unable to sign in with ${creds.title || roleKey} demo profile. Please try again.`);
      }
    } finally {
      setSubmitting(false);
      setActiveDemoRole(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email/username and password.');
      return;
    }
    setSubmitting(true);
    try {
      const ok = await login(email.trim(), password);
      if (ok) {
        redirectAfterLogin(undefined, email.trim());
      } else {
        setErrorMessage('Invalid credentials. Please verify your email/username and password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-0" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="row g-0" style={{ minHeight: '100vh' }}>
        {/* Left Niche University SVG Showcase */}
        <AuthSideShowcase
          badge="ACCREDITED DIGITAL UNIVERSITY CAMPUS"
          headline="Advance Your Degree & Career Through Flexible Digital Learning"
          subheadline="Sign in to access your study units, continuous assessments, academic transcripts, and regional study centre support."
        />

        {/* Right Clean Native Card Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center p-3 p-sm-4 p-xl-5">
          <div
            className="card border-0 shadow-sm rounded-4 bg-white w-100 p-4 p-sm-4"
            style={{ maxWidth: 465, border: '1px solid #e2e8f0' }}
          >
            <AuthBrandHeader />

            <div className="mb-3">
              <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '1.45rem' }}>
                Sign In to Your Portal
              </h1>
              <p className="text-muted small mb-0" style={{ fontSize: '0.83rem' }}>
                Enter your university credentials or use instant role access below.
              </p>
            </div>

            {/* Compact One-Click Role Access Bar */}
            <div
              className="p-2.5 rounded-3 mb-3"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <div className="d-flex align-items-center justify-content-between px-1 mb-2">
                <span className="fw-semibold text-dark" style={{ fontSize: '0.75rem' }}>
                  <i className="isax isax-flash-1 text-warning me-1" />
                  Instant Portal Access
                </span>
                <span
                  className="badge rounded-pill"
                  style={{ background: '#eff6ff', color: '#013BA6', fontSize: '0.66rem' }}
                >
                  One-Click Demo
                </span>
              </div>
              <div className="row g-2">
                {[
                  { key: 'student' as const, label: 'Scholar', roleDesc: 'Student Portal', icon: 'isax-teacher', accent: '#013BA6' },
                  { key: 'instructor' as const, label: 'Lecturer', roleDesc: 'Instructor Portal', icon: 'isax-briefcase', accent: '#1D80DF' },
                  { key: 'coursecreator' as const, label: 'Course Creator', roleDesc: 'Course Wizard Studio', icon: 'isax-book-1', accent: '#013BA6' },
                  { key: 'admin' as const, label: 'Admin', roleDesc: 'ICT & Admin Hub', icon: 'isax-shield-tick', accent: '#061838' },
                ]
                  .map((item) => {
                  const isBusy = activeDemoRole === item.key;
                  return (
                    <div className="col-6" key={item.key}>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleDemoClick(item.key)}
                        className="btn btn-sm w-100 rounded-3 py-2 px-1 d-flex align-items-center justify-content-center gap-1.5 fw-semibold bg-white border"
                        style={{
                          fontSize: '0.78rem',
                          color: item.accent,
                          borderColor: isBusy ? item.accent : '#cbd5e1',
                          boxShadow: isBusy ? `0 0 0 2px ${item.accent}33` : 'none',
                        }}
                        title={`Sign in instantly as demo ${item.label} (${item.roleDesc})`}
                      >
                        {isBusy ? (
                          <span className="spinner-border spinner-border-sm" role="status" style={{ width: 12, height: 12 }} />
                        ) : (
                          <i className={`isax ${item.icon}`} />
                        )}
                        <span>{isBusy ? '...' : item.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {errorMessage && (
              <div className="alert alert-danger py-2 px-3 rounded-3 small mb-3 d-flex align-items-center gap-2">
                <i className="isax isax-danger" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Academic Email or Username <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="isax isax-sms" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@out.ac.tz or username"
                    required
                    style={{ fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <label className="form-label small fw-semibold text-dark mb-0">
                    Password <span className="text-danger">*</span>
                  </label>
                  <Link
                    to={route.forgotpassword}
                    className="text-decoration-none fw-semibold"
                    style={{ fontSize: '0.76rem', color: '#013BA6' }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="isax isax-lock" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0 ps-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{ fontSize: '0.88rem' }}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light border-start-0 text-muted"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    <i className={`isax ${showPassword ? 'isax-eye' : 'isax-eye-slash'}`} />
                  </button>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="form-check mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultChecked
                    id="rememberScholarSession"
                  />
                  <label
                    className="form-check-label small text-muted"
                    htmlFor="rememberScholarSession"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Keep me signed in on this device
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm mb-3"
                style={{
                  background: 'linear-gradient(135deg, #061838 0%, #013BA6 100%)',
                  fontSize: '0.9rem',
                }}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In to Portal <i className="isax isax-arrow-right-3 ms-1" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-top text-center">
              <p className="small text-muted mb-2" style={{ fontSize: '0.82rem' }}>
                New applicant or prospective scholar?{' '}
                <Link
                  to={route.register}
                  className="fw-bold text-decoration-none"
                  style={{ color: '#013BA6' }}
                >
                  Create Scholar Account
                </Link>
              </p>
              <div className="d-flex align-items-center justify-content-center gap-3 small">
                <Link to={route.courseGrid} className="text-muted text-decoration-none" style={{ fontSize: '0.75rem' }}>
                  Browse Courses
                </Link>
                <span className="text-muted">•</span>
                <Link to={route.courseCategory} className="text-muted text-decoration-none" style={{ fontSize: '0.75rem' }}>
                  Faculties
                </Link>
                <span className="text-muted">•</span>
                <Link to={route.contactUs} className="text-muted text-decoration-none" style={{ fontSize: '0.75rem' }}>
                  Helpdesk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
