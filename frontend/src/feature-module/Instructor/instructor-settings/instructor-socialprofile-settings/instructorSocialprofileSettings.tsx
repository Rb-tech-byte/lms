import React, { useEffect, useState } from 'react';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import {
  instructorService,
  InstructorSocialSettings,
} from '../../../../core/api/instructorService';
import { SectionCard } from '../../common/instructorUi';

const InstructorSocialprofileSettings: React.FC = () => {
  const [social, setSocial] = useState<InstructorSocialSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    instructorService.fetchSocialSettings().then((data) => {
      if (mounted) {
        setSocial(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleChange = (field: keyof InstructorSocialSettings, value: string) => {
    if (!social) return;
    setSocial({ ...social, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!social) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await instructorService.updateSocialSettings(social);
      setMessage({ type: 'success', text: res.message || 'Scholarly links updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update links.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !social) {
    return (
      <div className="ins-content p-4">
        <InstructorSettingsLink />
        <div className="ins-empty">
          <span className="spinner-border spinner-border-sm text-primary me-2" />
          Loading scholarly profiles...
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
        title="Scholarly & Academic Profiles"
        subtitle="Connect your research repositories and scholarly IDs to enhance institutional discovery and academic citations."
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* ORCID */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                ORCID iD (Open Researcher &amp; Contributor ID)
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-success">
                  <i className="feather-check-circle" />
                </span>
                <input
                  type="url"
                  className="form-control"
                  value={social.orcid}
                  onChange={(e) => handleChange('orcid', e.target.value)}
                  placeholder="https://orcid.org/0000-0000-0000-0000"
                />
              </div>
              <small className="text-muted">Unique identifier for publications &amp; citations.</small>
            </div>

            {/* Google Scholar */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                Google Scholar Citations URL
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-primary">
                  <i className="feather-book-open" />
                </span>
                <input
                  type="url"
                  className="form-control"
                  value={social.googleScholar}
                  onChange={(e) => handleChange('googleScholar', e.target.value)}
                  placeholder="https://scholar.google.com/citations?user=..."
                />
              </div>
              <small className="text-muted">Displays your h-index and citation metrics.</small>
            </div>

            {/* ResearchGate */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                ResearchGate Profile URL
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-info">
                  <i className="feather-share-2" />
                </span>
                <input
                  type="url"
                  className="form-control"
                  value={social.researchGate}
                  onChange={(e) => handleChange('researchGate', e.target.value)}
                  placeholder="https://www.researchgate.net/profile/..."
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                LinkedIn Professional Profile
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-primary">
                  <i className="feather-linkedin" />
                </span>
                <input
                  type="url"
                  className="form-control"
                  value={social.linkedIn}
                  onChange={(e) => handleChange('linkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            {/* X (Twitter) */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                X (Twitter) Academic Handle
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-dark">
                  <i className="feather-twitter" />
                </span>
                <input
                  type="url"
                  className="form-control"
                  value={social.twitter}
                  onChange={(e) => handleChange('twitter', e.target.value)}
                  placeholder="https://x.com/..."
                />
              </div>
            </div>

            {/* Staff Directory / Personal Website */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                OUT Staff Directory / Personal Academic Website
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-secondary">
                  <i className="feather-globe" />
                </span>
                <input
                  type="url"
                  className="form-control"
                  value={social.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://staff.out.ac.tz/..."
                />
              </div>
            </div>

            <div className="col-12 pt-3 border-top d-flex justify-content-end gap-2">
              <button
                type="button"
                className="ins-btn ins-btn-ghost"
                onClick={() => {
                  instructorService.fetchSocialSettings().then(setSocial);
                  setMessage(null);
                }}
              >
                Reset
              </button>
              <button type="submit" className="ins-btn ins-btn-primary" disabled={saving}>
                {saving && <span className="spinner-border spinner-border-sm me-1" />}
                {saving ? 'Saving...' : 'Save Scholarly Links'}
              </button>
            </div>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default InstructorSocialprofileSettings;
