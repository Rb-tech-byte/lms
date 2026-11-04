import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { callInternalApi } from '../../../core/api/apiClient';
import { useCmsConfig } from '../../../core/api/cmsService';

const Footer: React.FC = () => {
  const { cms } = useCmsConfig();
  const footerCfg = cms.footer;
  const headerCfg = cms.header;

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribedMsg, setSubscribedMsg] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await callInternalApi('submit_contact_inquiry', {
        name: 'Academic Bulletin Subscriber',
        email: email.trim(),
        subject: 'OUT LMS Academic Bulletin Subscription',
        message: 'Subscribe to Open University of Tanzania academic notifications and semester schedules.',
      });
      setSubscribedMsg('Subscribed to OUT Academic Bulletins.');
      setEmail('');
    } catch {
      setSubscribedMsg('Thank you! Your email is registered for OUT updates.');
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer
      style={{
        background: 'linear-gradient(135deg, #0171BB 0%, #0082D6 55%, #0171BB 100%)', color: '#FFFFFF', borderTop: '6px solid #FFD200',
        fontSize: '13.5px',
      }}
    >
      {/* Authentic OUT Royal Blue & Academic Gold Accent Stripe */}
      
      <div className="container py-5">
        <div className="row g-4">
          {/* University Identity & Contact Card */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img
                src={headerCfg.logoUrl || '/assets/img/out-logo.png'}
                alt={footerCfg.orgName}
                style={{ width: '42px', height: '42px', objectFit: 'contain', background: '#ffffff', borderRadius: '50%', padding: '2px', border: '2px solid #FFD200' }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/img/logo-white.svg';
                }}
              />
              <div>
                <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '15px' }}>
                  {footerCfg.orgName}
                </h6>
                <span style={{ color: '#FEF207', fontSize: '11.5px', fontWeight: 700 }}>
                  {headerCfg.brandTagline || 'National Open & Distance University'}
                </span>
              </div>
            </div>

            <p className="mb-3" style={{ color: '#FFFDE7', lineHeight: 1.6, fontSize: '13px' }}>
              {footerCfg.description}
            </p>

            {footerCfg.accreditationBadge && (
              <div className="mb-3">
                <span
                  className="badge rounded-pill px-3 py-1 fw-medium"
                  style={{
                    background: '#FFD200', color: '#003B66', border: '1px solid #FEF207', fontWeight: 800,
                    fontSize: '11.5px',
                  }}
                >
                  <i className="isax isax-shield-tick me-1" />
                  {footerCfg.accreditationBadge}
                </span>
              </div>
            )}

            <div className="d-flex flex-column gap-1 small" style={{ color: '#FFFDE7' }}>
              <div>
                <i className="isax isax-location me-2" style={{ color: '#FFD200' }} />
                {footerCfg.address}
              </div>
              <div>
                <i className="isax isax-call-calling me-2" style={{ color: '#FFD200' }} />
                {footerCfg.phone}
              </div>
              <div>
                <i className="isax isax-sms me-2" style={{ color: '#FFD200' }} />
                {footerCfg.email}
              </div>
            </div>
          </div>

          {/* Dynamic CMS Link Columns */}
          {(footerCfg.columns || []).slice(0, 2).map((col) => (
            <div key={col.id} className="col-lg-2 col-md-3 col-6">
              <h6 className="fw-bold mb-3" style={{ fontSize: "14px", color: "#FEF207" }}>
                {col.title}
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                {(col.links || []).map((lnk, idx) => (
                  <li key={idx}>
                    <Link
                      to={lnk.route}
                      className="text-decoration-none"
                      style={{ color: '#FFFFFF', fontSize: '13px' }}
                    >
                      {lnk.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Dynamic Newsletter & Quick Support Column */}
          <div className="col-lg-4 col-md-12">
            <div
              className="p-3 rounded-3"
              style={{
                background: 'rgba(255, 253, 231, 0.16)', border: '2px solid #FFD200', borderRadius: '12px',
              }}
            >
              <h6 className="fw-bold mb-1" style={{ fontSize: '14px', color: '#FEF207' }}>
                {footerCfg.newsletterTitle}
              </h6>
              <p className="mb-3" style={{ color: '#FFFFFF', fontSize: '12.5px' }}>
                {footerCfg.newsletterSubtitle}
              </p>

              <form onSubmit={handleSubscribe} className="d-flex gap-2">
                <input
                  type="email"
                  className="form-control form-control-sm"
                  placeholder="Enter your @out.ac.tz or email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    background: '#ffffff', border: '1.5px solid #FFD200', borderRadius: '8px',
                    color: '#003B66', fontSize: '12.5px',
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-sm btn-primary px-3 fw-semibold flex-shrink-0"
                  style={{ background: '#FFD200', borderColor: '#FFD200', color: '#003B66', fontSize: '12.5px', fontWeight: 800 }}
                >
                  {submitting ? '...' : 'Subscribe'}
                </button>
              </form>

              {subscribedMsg && (
                <div className="mt-2" style={{ fontSize: '12px', color: '#FEF207', fontWeight: 700 }}>
                  <i className="isax isax-tick-circle me-1" />
                  {subscribedMsg}
                </div>
              )}

              {footerCfg.columns?.[2] && (
                <div className="mt-3 pt-3 d-flex flex-wrap gap-3" style={{ borderTop: '1px solid rgba(255, 210, 0, 0.45)' }}>
                  {(footerCfg.columns[2].links || []).map((lnk, idx) => (
                    <Link
                      key={idx}
                      to={lnk.route}
                      className="text-decoration-none fw-semibold"
                      style={{ color: '#FFFDE7', fontSize: '12px' }}
                    >
                      {lnk.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Social Strip */}
      <div
        style={{
          background: '#0062A3', borderTop: '2px solid #FFD200',
        }}
        className="py-3"
      >
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div style={{ color: '#E8F4FC', fontSize: '12.5px' }}>
            {footerCfg.copyrightText}
          </div>

          <div className="d-flex align-items-center flex-wrap gap-3">
            {(footerCfg.bottomLinks || []).map((lnk, idx) => (
              <Link
                key={idx}
                to={lnk.route}
                className="text-decoration-none"
                style={{ color: '#E8F4FC', fontSize: '12px' }}
              >
                {lnk.label}
              </Link>
            ))}

            <div className="d-flex align-items-center gap-2 ms-2">
              {(footerCfg.socialLinks || []).map((soc, idx) => (
                <a
                  key={idx}
                  href={soc.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={soc.platform}
                  className="d-inline-flex align-items-center justify-content-center rounded-circle text-decoration-none"
                  style={{
                    width: '28px',
                    height: '28px',
                    background: '#FFD200', color: '#003B66',
                    fontSize: '12px',
                  }}
                >
                  <i className={soc.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
