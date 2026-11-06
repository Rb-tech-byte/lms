import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { useAuth } from '../../../core/auth/authContext';
import {
  courseService,
  PublicCatalogCategory,
  PublicCatalogCourse,
} from '../../../core/api/courseService';
import { AuthBrandHeader, AuthSideShowcase } from '../common/authSideShowcase';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [department, setDepartment] = useState<string>(
    'Faculty of Science, Technology & Environmental Studies'
  );
  const [selectedCourseId, setSelectedCourseId] = useState<number>(2);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');

  const [faculties, setFaculties] = useState<PublicCatalogCategory[]>([]);
  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);

  const { register } = useAuth();
  const route = all_routes;
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    courseService
      .getPublicCatalog()
      .then((res) => {
        if (!mounted) return;
        if (res.categories?.length) {
          setFaculties(res.categories);
          setDepartment(res.categories[0].name);
        }
        if (res.courses?.length) {
          setCourses(res.courses);
          setSelectedCourseId(res.courses[0].id);
        }
      })
      .catch(() => null);
    return () => {
      mounted = false;
    };
  }, []);

  // Compute password strength (0..4)
  const computeStrength = (val: string) => {
    if (!val) return { score: 0, label: '', color: '#cbd5e1' };
    let score = 1;
    if (val.length >= 6) score++;
    if (/[0-9]/.test(val) && /[a-zA-Z]/.test(val)) score++;
    if (val.length >= 8 && /[^a-zA-Z0-9]/.test(val)) score++;
    const map: Record<number, { label: string; color: string }> = {
      1: { label: 'Too short', color: '#ef4444' },
      2: { label: 'Fair', color: '#f59e0b' },
      3: { label: 'Good', color: '#013BA6' },
      4: { label: 'Strong', color: '#10b981' },
    };
    return { score, ...map[score] };
  };

  const pwdStrength = computeStrength(password);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!fullName.trim() || !email.trim() || !password) {
      setFormError('Please enter your full name, email address, and password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await register({
      fullname: fullName.trim(),
      email: email.trim(),
      password,
      department,
      phone: phone.trim(),
      course_id: selectedCourseId,
    } as any);
    setSubmitting(false);

    if (!result.success) {
      setFormError(result.error || 'Registration failed. Please check your details.');
      return;
    }

    setFormSuccess(
      result.message || 'Scholar account created! Redirecting to your Student Dashboard...'
    );
    setTimeout(() => {
      navigate(result.user?.dashboardUrl || route.studentDashboard);
    }, 800);
  };

  return (
    <div className="container-fluid p-0" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="row g-0" style={{ minHeight: '100vh' }}>
        {/* Left Niche University SVG Showcase */}
        <AuthSideShowcase
          badge="NEW SCHOLAR ADMISSIONS & ENROLMENT"
          headline="Begin Your Accredited University Degree Journey Today"
          subheadline="Create your scholar profile to enrol in degree programmes, access digital study units, and track your academic progress."
        />

        {/* Right Compact Native Card Registration Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center p-3 p-sm-4 p-xl-5">
          <div
            className="card border-0 shadow-sm rounded-4 bg-white w-100 p-4"
            style={{ maxWidth: 520, border: '1px solid #e2e8f0' }}
          >
            <AuthBrandHeader />

            <div className="mb-3">
              <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '1.45rem' }}>
                Create Scholar Account
              </h1>
              <p className="text-muted small mb-0" style={{ fontSize: '0.82rem' }}>
                Complete your academic profile for immediate portal and classroom access.
              </p>
            </div>

            {formError && (
              <div className="alert alert-danger py-2 px-3 rounded-3 small mb-3 d-flex align-items-center gap-2">
                <i className="isax isax-danger" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="alert alert-success py-2 px-3 rounded-3 small mb-3 d-flex align-items-center gap-2">
                <i className="isax isax-tick-circle" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-2.5">
                <div className="col-sm-6 mb-2">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="isax isax-user" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="e.g. Juma Mwakasege"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-sm-6 mb-2">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Phone Number
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="isax isax-call" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="+255 712 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-12 mb-2">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="isax isax-sms" />
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 ps-0"
                      placeholder="scholar@out.ac.tz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-sm-6 mb-2">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Academic Faculty
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {faculties.length > 0 ? (
                      faculties.map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Faculty of Science, Technology & Environmental Studies">
                          Faculty of Science &amp; Technology
                        </option>
                        <option value="Faculty of Business Management">
                          Faculty of Business Management
                        </option>
                        <option value="Faculty of Law">Faculty of Law</option>
                        <option value="Faculty of Education">Faculty of Education</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="col-sm-6 mb-2">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Initial Programme
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  >
                    {courses.length > 0 ? (
                      courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.shortname}: {c.fullname}
                        </option>
                      ))
                    ) : (
                      <option value={2}>CS101: Data Structures &amp; Algorithms</option>
                    )}
                  </select>
                </div>

                <div className="col-sm-6 mb-2">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control border-end-0"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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

                <div className="col-sm-6 mb-2">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="form-control border-end-0"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="input-group-text bg-light border-start-0 text-muted"
                      onClick={() => setShowConfirm((prev) => !prev)}
                      tabIndex={-1}
                    >
                      <i className={`isax ${showConfirm ? 'isax-eye' : 'isax-eye-slash'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Compact Password Strength Indicator */}
              {password && (
                <div className="mb-2.5">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex gap-1 flex-grow-1 me-2">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className="rounded-pill flex-grow-1"
                          style={{
                            height: 4,
                            background: step <= pwdStrength.score ? pwdStrength.color : '#e2e8f0',
                          }}
                        />
                      ))}
                    </div>
                    <span className="fw-semibold" style={{ fontSize: '0.7rem', color: pwdStrength.color }}>
                      {pwdStrength.label}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-check my-2.5">
                <input
                  className="form-check-input"
                  type="checkbox"
                  defaultChecked
                  required
                  id="agreeScholarTerms"
                />
                <label
                  className="form-check-label small text-muted"
                  htmlFor="agreeScholarTerms"
                  style={{ fontSize: '0.78rem' }}
                >
                  I agree to the University{' '}
                  <Link to={route.termsConditions} className="text-decoration-none fw-semibold" style={{ color: '#013BA6' }}>
                    Academic Charter
                  </Link>{' '}
                  and{' '}
                  <Link to={route.privacyPolicy} className="text-decoration-none fw-semibold" style={{ color: '#013BA6' }}>
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm mt-1 mb-3"
                style={{
                  background: 'linear-gradient(135deg, #061838 0%, #013BA6 100%)',
                  fontSize: '0.9rem',
                }}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Creating Scholar Account...
                  </>
                ) : (
                  <>
                    Complete Registration <i className="isax isax-arrow-right-3 ms-1" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2.5 border-top text-center">
              <p className="small text-muted mb-0" style={{ fontSize: '0.82rem' }}>
                Already have a university account?{' '}
                <Link
                  to={route.login}
                  className="fw-bold text-decoration-none"
                  style={{ color: '#013BA6' }}
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
