import React from 'react';
import { useCmsConfig } from '../../../../core/api/cmsService';

const Testimonials: React.FC = () => {
  const { cms } = useCmsConfig();
  const revCfg = cms.sections.reviews;

  if (!revCfg.visible) return null;

  return (
    <section className="py-4" style={{ background: 'linear-gradient(180deg, #FFFDF4 0%, #F0F8FF 100%)', borderTop: '1.5px solid #CBE4F9' }}>
      <div className="container">
        <div className="mb-3">
          <div
            className="text-uppercase fw-bold mb-1"
            style={{ fontSize: '11px', color: '#0171BB', letterSpacing: '0.06em' }}
          >
            {revCfg.eyebrow}
          </div>
          <h3 className="fw-bold mb-1" style={{ fontSize: '20px', color: '#003B66' }}>
            {revCfg.title}
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
            {revCfg.subtitle}
          </p>
        </div>

        <div className="row g-3">
          {(revCfg.items || []).map((item) => (
            <div key={item.id} className="col-lg-4 col-md-6">
              <div
                className="card h-100 border shadow-sm overflow-hidden"
                style={{ borderRadius: '12px', borderTop: '3px solid #0171BB', borderBottom: '3px solid #FFD200', borderColor: '#93C5FD' }}
              >
                {item.coverImage && (
                  <div style={{ height: '64px', overflow: 'hidden', borderBottom: '2px solid #FFD200' }}>
                    <img
                      src={item.coverImage}
                      alt={item.name}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div className="card-body p-3 d-flex flex-column">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span
                      className="badge rounded-pill px-2 py-1 fw-bold"
                      style={{ background: '#FFD200', color: '#003B66', fontSize: '10.5px' }}
                    >
                      {item.course}
                    </span>
                    <span className="fw-bold" style={{ fontSize: '12px', color: '#D97706' }}>
                      ★ {item.rating}
                    </span>
                  </div>

                  <p className="text-secondary mb-3 flex-grow-1" style={{ fontSize: '12.5px', lineHeight: 1.55 }}>
                    “{item.comment}”
                  </p>

                  <div className="d-flex align-items-center gap-2 pt-2 border-top mt-auto">
                    <img
                      src={item.avatar || '/assets/img/user/user-02.jpg'}
                      alt={item.name}
                      className="rounded-circle"
                      width={32}
                      height={32}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/assets/img/user/user-02.jpg';
                      }}
                    />
                    <div>
                      <div className="fw-bold" style={{ fontSize: '13px', color: '#0f172a' }}>
                        {item.name}
                      </div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        {item.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
