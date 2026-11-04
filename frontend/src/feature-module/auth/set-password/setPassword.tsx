import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { callInternalApi } from '../../../core/api/apiClient';
import { AuthBrandHeader, AuthSideShowcase } from '../common/authSideShowcase';

const SetPassword: React.FC = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialAccount =
    params.get('account') || sessionStorage.getItem('out_lms_reset_identifier') || '';

  const [account, setAccount] = useState<string>(initialAccount);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!account.trim()) {
      setErrorMsg('Please enter your account email or username.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await callInternalApi<any>(
        'request_password_reset',
        {
          email: account.trim(),
          new_password: password,
        },
        'POST'
      );
      setLoading(false);

      if (!data?.success) {
        setErrorMsg(data?.error || 'Failed to update password.');
        return;
      }

      sessionStorage.removeItem('out_lms_reset_identifier');
      setSuccessMsg(
        data.message || 'Password updated! Redirecting to Sign In...'
      );
      setTimeout(() => {
        navigate(route.login);
      }, 900);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Unable to update password at this time.');
    }
  };

  return (
    <div className="container-fluid p-0" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="row g-0" style={{ minHeight: '100vh' }}>
        <AuthSideShowcase
          badge="CREDENTIAL UPDATE"
          headline="Set Your New Portal Password"
          subheadline="Choose a strong password to protect your university account, coursework submissions, and examination records."
        />

        <div className="col-lg-6 d-flex align-items-center justify-content-center p-3 p-sm-4 p-xl-5">
          <div
            className="card border-0 shadow-sm rounded-4 bg-white w-100 p-4"
            style={{ maxWidth: 460, border: '1px solid #e2e8f0' }}
          >
            <AuthBrandHeader />

            <div className="mb-3">
              <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '1.45rem' }}>
                Set New Password
              </h1>
              <p className="text-muted small mb-0" style={{ fontSize: '0.83rem' }}>
                Update your portal password below to sign back in.
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
                  Account Email / Username <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="student@out.ac.tz"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  New Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-end-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
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

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Confirm New Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="form-control border-end-0"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
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

              <button
                type="submit"
                disabled={loading}
                className="btn w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm mb-3"
                style={{
                  background: 'linear-gradient(135deg, #071F38 0%, #0171BB 100%)',
                  fontSize: '0.9rem',
                }}
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
                <i className="isax isax-arrow-right-3 ms-1" />
              </button>
            </form>

            <div className="pt-3 border-top text-center">
              <Link
                to={route.login}
                className="fw-bold text-decoration-none small"
                style={{ color: '#0171BB' }}
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
