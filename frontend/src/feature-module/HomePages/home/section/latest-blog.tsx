import React from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';
import { useCmsConfig } from '../../../../core/api/cmsService';

const Latestblog: React.FC = () => {
  const { cms } = useCmsConfig();
  const bulCfg = cms.sections.bulletins;

  if (!bulCfg.visible) return null;

  return (
    <section className="py-4" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
      <div className="container">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
          <div>
            <div
              className="text-uppercase fw-bold mb-1"
              style={{ fontSize: '11px', color: '#0171BB', letterSpacing: '0.06em' }}
            >
              {bulCfg.eyebrow}
            </div>
            <h3 className="fw-bold mb-1" style={{ fontSize: '20px', color: '#0f172a' }}>
              {bulCfg.title}
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
              {bulCfg.subtitle}
            </p>
          </div>
          <Link
            to={bulCfg.ctaRoute || all_routes.blogGrid}
            className="btn btn-sm btn-outline-primary rounded-2 px-3 fw-semibold"
            style={{ fontSize: '12.5px' }}
          >
            {bulCfg.ctaText} →
          </Link>
        </div>

        <div className="row g-3">
          {(bulCfg.items || []).map((item) => (
            <div key={item.id} className="col-lg-4 col-md-6">
              <div
                className="card h-100 border shadow-sm overflow-hidden"
                style={{ borderRadius: '12px', borderTop: '3px solid #0171BB', borderBottom: '3px solid #FFD200', borderColor: '#93C5FD' }}
              >
                {item.coverImage && (
                  <div style={{ height: '115px', overflow: 'hidden', background: '#F0F8FF', borderBottom: '2px solid #FFD200' }}>
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="card-body p-3 d-flex flex-column">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span
                      className="badge rounded-pill px-2 py-1 fw-bold"
                      style={{
                        background: '#FFD200',
                        color: '#003B66',
                        fontSize: '10.5px',
                      }}
                    >
                      {item.category}
                    </span>
                    <span className="text-muted" style={{ fontSize: '11.5px' }}>
                      <i className="isax isax-calendar-1 me-1 text-primary" />
                      {item.date}
                    </span>
                  </div>

                  <h6 className="fw-bold mb-2" style={{ fontSize: '14.5px', lineHeight: 1.38 }}>
                    <Link
                      to={item.route || all_routes.blogDetails}
                      className="text-decoration-none"
                      style={{ color: '#003B66' }}
                    >
                      {item.title}
                    </Link>
                  </h6>

                  <p className="text-muted mb-3 flex-grow-1" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
                    {item.summary}
                  </p>

                  <Link
                    to={item.route || all_routes.blogDetails}
                    className="text-decoration-none fw-bold mt-auto"
                    style={{ fontSize: '12px', color: '#0171BB' }}
                  >
                    Read Official Notice →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Latestblog;
