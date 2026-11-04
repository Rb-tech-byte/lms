import React from 'react';
import { Link } from 'react-router-dom';
import { useCmsConfig } from '../../../../core/api/cmsService';

const Knowledge: React.FC = () => {
  const { cms } = useCmsConfig();
  const pathwayCfg = cms.sections.pathway;
  const ctaCfg = cms.sections.ctaBanner;

  if (!pathwayCfg.visible && !ctaCfg.visible) return null;

  return (
    <section className="py-4" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
      <div className="container">
        {pathwayCfg.visible && (
          <div className="mb-4">
            <div className="mb-3">
              <div
                className="text-uppercase fw-bold mb-1"
                style={{ fontSize: '11px', color: '#0171BB', letterSpacing: '0.06em' }}
              >
                {pathwayCfg.eyebrow}
              </div>
              <h3 className="fw-bold mb-1" style={{ fontSize: '20px', color: '#0f172a' }}>
                {pathwayCfg.title}
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                {pathwayCfg.subtitle}
              </p>
            </div>

            <div className="row g-3">
              {(pathwayCfg.steps || []).map((st, idx) => (
                <div key={idx} className="col-lg-3 col-md-6">
                  <div
                    className="card h-100 border shadow-sm overflow-hidden"
                    style={{ borderRadius: '12px', borderTop: '3px solid #0171BB', borderBottom: '3px solid #FFD200', borderColor: '#93C5FD' }}
                  >
                    {st.coverImage && (
                      <div style={{ height: '95px', overflow: 'hidden' }}>
                        <img
                          src={st.coverImage}
                          alt={st.title}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div className="card-body p-3 d-flex flex-column">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span
                          className="badge rounded-2 px-2 py-1 fw-bold"
                          style={{ background: '#FFD200', color: '#003B66', fontSize: '11.5px' }}
                        >
                          STEP {st.step}
                        </span>
                        <i className="isax isax-arrow-right-1 text-primary fs-14" />
                      </div>
                      <h6 className="fw-bold mb-1" style={{ fontSize: '14.5px', color: '#0f172a' }}>
                        {st.title}
                      </h6>
                      <p className="text-muted mb-2 flex-grow-1" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
                        {st.description}
                      </p>
                      <Link
                        to={st.route || '/register'}
                        className="text-decoration-none fw-semibold"
                        style={{ fontSize: '12px', color: '#0171BB' }}
                      >
                        Proceed →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Native Call-To-Action Card */}
        {ctaCfg.visible && (
          <div
            className="p-4 rounded-3 shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3"
            style={{
              background: ctaCfg.bgImage
                ? `linear-gradient(135deg, rgba(1, 113, 187, 0.90) 0%, rgba(0, 130, 214, 0.86) 55%, rgba(0, 149, 242, 0.84) 100%), url(${ctaCfg.bgImage}) center/cover no-repeat`
                : 'linear-gradient(135deg, #0171BB 0%, #0082D6 55%, #0095F2 100%)',
              color: '#ffffff',
              border: '3px solid #FFD200',
              boxShadow: '0 12px 28px rgba(1, 113, 187, 0.22)',
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <h5 className="fw-bold text-white mb-1" style={{ fontSize: '18px' }}>
                {ctaCfg.title}
              </h5>
              <p className="mb-0" style={{ color: '#FFFDE7', fontSize: '13px' }}>
                {ctaCfg.subtitle}
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link
                to={ctaCfg.primaryRoute || '/register'}
                className="btn btn-sm px-3 py-2 fw-bold rounded-2"
                style={{ background: '#FFD200', border: '1.5px solid #FEF207', color: '#003B66', fontSize: '13px' }}
              >
                {ctaCfg.primaryText}
              </Link>
              <Link
                to={ctaCfg.secondaryRoute || '/pages/become-an-instructor'}
                className="btn btn-sm px-3 py-2 fw-semibold rounded-2"
                style={{
                  background: 'rgba(255,253,231,0.16)',
                  border: '1.5px solid #FFD200',
                  color: '#FFFDE7',
                  fontSize: '13px',
                }}
              >
                {ctaCfg.secondaryText}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Knowledge;
