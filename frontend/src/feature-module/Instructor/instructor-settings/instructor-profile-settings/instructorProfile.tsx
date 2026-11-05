import React, { useEffect, useState } from 'react';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import { useAuth } from '../../../../core/auth/authContext';
import {
  instructorService,
  InstructorProfileSettings,
} from '../../../../core/api/instructorService';
import { SectionCard } from '../../common/instructorUi';

const DEPARTMENTS = [
  'Department of Computer Science & Educational Technology',
  'Department of Physical Sciences & Mathematics',
  'Department of Life Sciences',
  'Department of Educational Psychology & Curriculum Studies',
  'Department of Educational Foundations & Management',
  'Department of Private & Public Law',
  'Department of Finance & Accounting',
  'Department of Leadership & Governance',
  'Institute of Continuing Education (ICE)',
];

const REGIONAL_CENTRES = [
  'Kinondoni Regional Centre (Dar es Salaam - Primary)',
  'Ilala Regional Centre (Dar es Salaam)',
  'Temeke Regional Centre (Dar es Salaam)',
  'Arusha Regional Centre (Northern Zone)',
  'Mwanza Regional Centre (Lake Zone)',
  'Dodoma Regional Centre (Capital Zone)',
  'Mbeya Regional Centre (Southern Highlands)',
  'Zanzibar Learning Centre',
  'Kilimanjaro Regional Centre (Moshi)',
  'Tanga Regional Centre',
  'Morogoro Regional Centre',
  'Iringa Regional Centre',
  'Kigoma Regional Centre',
];

const InstructorProfile: React.FC = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<InstructorProfileSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    instructorService.fetchProfileSettings().then((data) => {
      if (mounted) {
        setProfile(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleChange = (field: keyof InstructorProfileSettings, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      const url = URL.createObjectURL(file);
      setProfile({ ...profile, avatar: url });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await instructorService.updateProfileSettings(profile);
      updateUser({
        name: profile.fullname,
        email: profile.email,
        title: profile.title,
        bio: profile.bio,
      });
      setMessage({ type: 'success', text: res.message || 'Faculty profile synchronized with Moodle database.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save profile changes.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="ins-content p-4">
        <InstructorSettingsLink />
        <div className="ins-empty">
          <span className="spinner-border spinner-border-sm text-primary me-2" />
          Loading faculty profile...
        </div>
      </div>
    );
  }

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

      <SectionCard
        title="Faculty Profile & Academic Identity"
        subtitle="Manage your official Open University of Tanzania staff directory details and Moodle identity."
      >
        <form onSubmit={handleSubmit}>
          {/* Avatar & Staff ID banner */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 mb-4 rounded-3 border bg-light">
            <div className="d-flex align-items-center gap-3">
              <div className="position-relative">
                <img
                  src={profile.avatar || '/assets/img/user/user-01.jpg'}
                  alt={profile.fullname}
                  className="rounded-circle border border-primary border-2 shadow-sm"
                  style={{ width: 72, height: 72, objectFit: 'cover' }}
                />
                <label
                  htmlFor="avatar-upload"
                  className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-1 shadow-sm d-flex align-items-center justify-content-center"
                  style={{ width: 26, height: 26, cursor: 'pointer' }}
                  title="Upload new photo"
                >
                  <i className="feather-camera" style={{ fontSize: 12 }} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="d-none"
                  />
                </label>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">{profile.fullname}</h6>
                <div className="text-muted small mb-1">{profile.title}</div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5">
                    {profile.staffId}
                  </span>
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5">
                    OUT Tenured Faculty
                  </span>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="ins-btn ins-btn-ghost ins-btn-sm"
                onClick={() => handleChange('avatar', '/assets/img/user/user-01.jpg')}
              >
                Reset Default Photo
              </button>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                Full Name &amp; Academic Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={profile.fullname}
                onChange={(e) => handleChange('fullname', e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                Official OUT Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                Academic Designation &amp; Rank
              </label>
              <input
                type="text"
                className="form-control"
                value={profile.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                Primary Contact Telephone (MSISDN)
              </label>
              <input
                type="text"
                className="form-control"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+255 7XX XXX XXX"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                Faculty / Academic Department
              </label>
              <select
                className="form-select"
                value={profile.department}
                onChange={(e) => handleChange('department', e.target.value)}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                Primary Regional Learning Centre
              </label>
              <select
                className="form-select"
                value={profile.regionalCenter}
                onChange={(e) => handleChange('regionalCenter', e.target.value)}
              >
                {REGIONAL_CENTRES.map((center) => (
                  <option key={center} value={center}>
                    {center}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-dark small mb-1">
                Scholarly Biography &amp; Research Focus
              </label>
              <textarea
                rows={4}
                className="form-control"
                value={profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Describe your teaching philosophy, research publications, and distance learning specialisations..."
              />
              <small className="text-muted">
                Displayed to enrolled scholars and fellow faculty members on course syllabus pages.
              </small>
            </div>

            <div className="col-12 pt-3 border-top d-flex justify-content-end gap-2">
              <button
                type="button"
                className="ins-btn ins-btn-ghost"
                onClick={() => {
                  instructorService.fetchProfileSettings().then(setProfile);
                  setMessage(null);
                }}
              >
                Revert Changes
              </button>
              <button type="submit" className="ins-btn ins-btn-primary" disabled={saving}>
                {saving && <span className="spinner-border spinner-border-sm me-1" />}
                {saving ? 'Synchronizing...' : 'Save & Sync Moodle Profile'}
              </button>
            </div>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default InstructorProfile;
