import React, { useState } from 'react';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import { instructorService } from '../../../../core/api/instructorService';
import { SectionCard } from '../../common/instructorUi';

const ACTIVE_SESSIONS = [
  {
    id: 's-1',
    device: 'Dell OptiPlex (Windows 11) • Chrome 130',
    location: 'Kinondoni Headquarters, Dar es Salaam (197.250.198.42)',
    lastActive: 'Active Now (Current Session)',
    isCurrent: true,
  },
  {
    id: 's-2',
    device: 'Google Pixel 8 Pro • Moodle Mobile 4.4',
    location: 'Dar es Salaam, Tanzania (102.164.218.15)',
    lastActive: '12 minutes ago',
    isCurrent: false,
  },
  {
    id: 's-3',
    device: 'MacBook Air M2 • Safari 18.1',
    location: 'Arusha Regional Centre (197.250.201.88)',
    lastActive: 'Yesterday, 16:42 EAT',
    isCurrent: false,
  },
];

const InstructorChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sessions, setSessions] = useState(ACTIVE_SESSIONS);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Strength score: 0 to 4
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match. Please verify and re-enter.' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must contain at least 8 characters.' });
      return;
    }

    setSaving(true);
    try {
      const res = await instructorService.changePassword(currentPassword, newPassword);
      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Moodle credentials updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update password.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTerminateSession = (id: string) => {
    setSessions((s) => s.filter((item) => item.id !== id));
    setMessage({ type: 'success', text: 'Remote session revoked successfully.' });
  };

  return (
    <div className="ins-content">
      <InstructorSettingsLink />

      {message && (
        <div
          className={`alert ${
            message.type === 'success' ? 'alert-success border-success' : 'alert-danger border-danger'
          } d-flex align-items-center justify-content-between py-2 px-3 mb-4 rounded-3`}
        >
          <div className="d-flex align-items-center gap-2">
            <i className={`feather-${message.type === 'success' ? 'check-circle' : 'alert-circle'}`} />
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-sm"
            onClick={() => setMessage(null)}
            aria-label="Close"
          />
        </div>
      )}

      <div className="row g-4">
        {/* Change Password Form */}
        <div className="col-lg-7">
          <SectionCard
            title="Update Faculty Password"
            subtitle="Change your password for Open University of Tanzania single sign-on and Moodle backend."
          >
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark small mb-1">
                  Current Password <span className="text-danger">*</span>
                </label>
                <div className="position-relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    className="form-control pe-5"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter existing password"
                  />
                  <button
                    type="button"
                    className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none pe-3"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    <i className={showCurrent ? 'feather-eye-off' : 'feather-eye'} />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark small mb-1">
                  New Password <span className="text-danger">*</span>
                </label>
                <div className="position-relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    className="form-control pe-5"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Minimum 8 characters with numbers & symbols"
                  />
                  <button
                    type="button"
                    className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none pe-3"
                    onClick={() => setShowNew(!showNew)}
                  >
                    <i className={showNew ? 'feather-eye-off' : 'feather-eye'} />
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted" style={{ fontSize: 11.5 }}>
                        Password Strength: <strong>{strengthLabels[strength]}</strong>
                      </small>
                    </div>
                    <div className="progress" style={{ height: 5 }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${(strength / 4) * 100}%`,
                          backgroundColor: strengthColors[strength],
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark small mb-1">
                  Confirm New Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-type new password"
                />
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button
                  type="button"
                  className="ins-btn ins-btn-ghost"
                  onClick={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="ins-btn ins-btn-primary" disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm me-1" />}
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </SectionCard>
        </div>

        {/* Security Preferences & Active Sessions */}
        <div className="col-lg-5">
          <SectionCard
            title="Two-Factor Authentication"
            subtitle="Secure your teaching account with OUT staff verification."
          >
            <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-light mb-4">
              <div className="d-flex align-items-center gap-2.5">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                  style={{ width: 40, height: 40, background: '#e8f4fc' }}
                >
                  <i className="feather-shield fs-18" />
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: 13.5 }}>
                    OUT Staff 2FA
                  </h6>
                  <small className="text-muted">
                    {twoFactorEnabled ? 'Active via Google Authenticator' : 'Disabled'}
                  </small>
                </div>
              </div>
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={twoFactorEnabled}
                  onChange={(e) => {
                    setTwoFactorEnabled(e.target.checked);
                    setMessage({
                      type: 'success',
                      text: e.target.checked ? '2FA protection enabled.' : '2FA protection disabled.',
                    });
                  }}
                />
              </div>
            </div>

            <h6 className="fw-bold text-dark mb-2" style={{ fontSize: 13 }}>
              Authorized Active Sessions
            </h6>
            <div className="d-flex flex-column gap-2 mb-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between bg-white"
                >
                  <div className="min-w-0">
                    <div className="fw-semibold text-dark small text-truncate">{sess.device}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      {sess.location}
                    </div>
                    <div className="text-primary" style={{ fontSize: 10.5 }}>
                      {sess.lastActive}
                    </div>
                  </div>
                  {!sess.isCurrent && (
                    <button
                      type="button"
                      className="ins-action-btn is-delete"
                      onClick={() => handleTerminateSession(sess.id)}
                      title="Revoke session"
                    >
                      <i className="feather-log-out" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="ins-btn ins-btn-ghost w-100 justify-content-center"
              onClick={() => {
                setSessions(sessions.filter((s) => s.isCurrent));
                setMessage({ type: 'success', text: 'All remote sessions terminated.' });
              }}
            >
              <i className="feather-power me-1 text-danger" /> Sign Out All Other Devices
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default InstructorChangePassword;
