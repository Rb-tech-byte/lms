import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { callInternalApi } from '../../../core/api/apiClient';
import { AuthBrandHeader, AuthSideShowcase } from '../common/authSideShowcase';

const ForgortPassword: React.FC = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address or username.');
      return;
    }

    setLoading(true);
    try {
      const data = await callInternalApi<any>(
        'request_password_reset',
        { email: email.trim() },
        'POST'
      );
      setLoading(false);

      if (!data?.success) {
        setErrorMsg(data?.error || 'No active account matched that email address.');
        return;
      }

      sessionStorage.setItem('out_lms_reset_identifier', email.trim());
      setSuccessMsg(
        data.message || 'Account verified! Redirecting to set your new password...'
      );
      setTimeout(() => {
        navigate(`${route.setpassowrd}?account=${encodeURIComponent(email.trim())}`);
      }, 700);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Unable to verify account at this time.');
    }
  };

  return (
    <div className="container-fluid p-0" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="row g-0" style={{ minHeight: '100vh' }}>
        <AuthSideShowcase
          badge="ACCOUNT RECOVERY & IDENTITY"
          headline="Secure Credential Recovery for Scholars & Faculty"
          subheadline="Verify your registered academic email or username to reset your portal password and restore access to your classrooms."
        />

        <div className="col-lg-6 d-flex align-items-center justify-content-center p-3 p-sm-4 p-xl-5">
          <div
            className="card border-0 shadow-sm rounded-4 bg-white w-100 p-4"
            style={{ maxWidth: 460, border: '1px solid #e2e8f0' }}
          >
            <AuthBrandHeader />

            <div className="mb-3">
              <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '1.45rem' }}>
                Reset Portal Password
              </h1>
              <p className="text-muted small mb-0" style={{ fontSize: '0.83rem' }}>
                Enter your registered university email address or username to continue.
              </p>
            </div>

            {errorMsg && (
              <div className="alert alert-danger py-2 px-3 rounded-3 small mb-3">
                <i className="isax isax-danger me-1" />
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success py-2 px-3 rounded-3 small mb-3">
                <i className="isax isax-tick-circle me-1" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Registered Email or Username <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="isax isax-sms" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="student@out.ac.tz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm mb-3"
                style={{
                  background: 'linear-gradient(135deg, #071F38 0%, #0171BB 100%)',
                  fontSize: '0.9rem',
                }}
              >
                {loading ? 'Verifying Account...' : 'Verify & Continue'}
                <i className="isax isax-arrow-right-3 ms-1" />
              </button>
            </form>

            <div className="pt-3 border-top text-center">
              <p className="small text-muted mb-0">
                Remember your password?{' '}
                <Link
                  to={route.login}
                  className="fw-bold text-decoration-none"
                  style={{ color: '#0171BB' }}
                >
                  Return to Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgortPassword;
