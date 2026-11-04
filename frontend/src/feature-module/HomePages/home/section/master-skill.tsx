import React from 'react';
import { Link } from 'react-router-dom';
import { useCmsConfig } from '../../../../core/api/cmsService';

const Masterskill: React.FC = () => {
  const { cms } = useCmsConfig();
  const capCfg = cms.sections.capabilities;

  if (!capCfg.visible) return null;

  return (
    <section
      className="py-4"
      style={{
        background: capCfg.bgImage
          ? `url(${capCfg.bgImage}) center/cover no-repeat #ffffff`
          : '#ffffff',
      }}
    >
      <div className="container">
        <div className="mb-3">
          <div
            className="text-uppercase fw-bold mb-1"
            style={{ fontSize: '11px', color: '#0171BB', letterSpacing: '0.06em' }}
          >
            {capCfg.eyebrow}
          </div>
          <h3 className="fw-bold mb-1" style={{ fontSize: '20px', color: '#0f172a' }}>
            {capCfg.title}
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            {capCfg.subtitle}
          </p>
        </div>

        <div className="row g-3">
          {(capCfg.cards || []).map((card) => (
            <div key={card.id} className="col-lg-3 col-md-6">
              <div
                className="card h-100 border shadow-sm overflow-hidden"
                style={{
                  borderRadius: '12px',
                  borderColor: '#93C5FD',
                  borderTop: '3px solid #0171BB',
                  borderBottom: '3px solid #FFD200',
                }}
              >
                {card.coverImage && (
                  <div style={{ height: '110px', overflow: 'hidden', borderBottom: '2px solid #FFD200' }}>
                    <img
                      src={card.coverImage}
                      alt={card.title}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div className="card-body p-3 d-flex flex-column">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div
                      className="rounded-2 d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: '36px',
                        height: '36px',
                        background: '#FFFDE7',
                        border: '1.5px solid #FFD200',
                        color: '#0171BB',
                      }}
                    >
                      <i className={`isax ${card.icon || 'isax-flash'} fs-18`} />
                    </div>
                    <span
                      className="badge rounded-pill px-2 py-0 fw-bold"
                      style={{
                        background: '#FFD200',
                        color: '#003B66',
                        fontSize: '10.5px',
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h6 className="fw-bold mb-1" style={{ fontSize: '14.5px', color: '#003B66' }}>
                    {card.title}
                  </h6>

                  <p className="text-muted mb-3 flex-grow-1" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
                    {card.description}
                  </p>

                  <Link
                    to={card.route || '/course/course-grid'}
                    className="text-decoration-none fw-bold mt-auto d-inline-flex align-items-center gap-1"
                    style={{ fontSize: '12px', color: '#0171BB' }}
                  >
                    <span>Explore Feature</span>
                    <i className="isax isax-arrow-right-3" />
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

export default Masterskill;
