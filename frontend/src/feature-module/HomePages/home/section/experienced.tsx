import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';
import { courseService, PublicInstructor } from '../../../../core/api/courseService';
import { useCmsConfig } from '../../../../core/api/cmsService';

const Experienced: React.FC = () => {
  const { cms } = useCmsConfig();
  const instCfg = cms.sections.instructors;
  const [instructors, setInstructors] = useState<PublicInstructor[]>([]);

  useEffect(() => {
    let active = true;
    courseService.getPublicInstructors().then((list) => {
      if (active) setInstructors(list || []);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!instCfg.visible) return null;

  return (
    <section className="py-4" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
      <div className="container">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
          <div>
            <div
              className="text-uppercase fw-bold mb-1"
              style={{ fontSize: '11px', color: '#0171BB', letterSpacing: '0.06em' }}
            >
              {instCfg.eyebrow}
            </div>
            <h3 className="fw-bold mb-1" style={{ fontSize: '20px', color: '#0f172a' }}>
              {instCfg.title}
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
              {instCfg.subtitle}
            </p>
          </div>
          <Link
            to={instCfg.ctaRoute || all_routes.instructorGrid}
            className="btn btn-sm btn-outline-primary rounded-2 px-3 fw-semibold"
            style={{ fontSize: '12.5px' }}
          >
            {instCfg.ctaText} →
          </Link>
        </div>

        <div className="row g-3">
          {instructors.slice(0, 4).map((inst, idx) => {
            const deptCover = instCfg.covers?.[idx];
            return (
              <div key={inst.id} className="col-lg-3 col-md-6">
                <div
                  className="card h-100 border shadow-sm overflow-hidden"
                  style={{ borderRadius: '12px', border: '1.5px solid #93C5FD', borderTop: '3px solid #0171BB', borderBottom: '3px solid #FFD200' }}
                >
                  {deptCover && (
                    <div style={{ height: '70px', overflow: 'hidden', borderBottom: '2px solid #FFD200' }}>
                      <img
                        src={deptCover}
                        alt={inst.department}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="card-body p-3 d-flex flex-column" style={{ marginTop: deptCover ? '-20px' : '0' }}>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <img
                        src={inst.avatar}
                        alt={inst.fullname}
                        className="rounded-circle border border-2 border-white shadow-sm flex-shrink-0"
                        width={46}
                        height={46}
                        style={{ objectFit: 'cover', background: '#ffffff' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                        }}
                      />
                      <div className="min-w-0">
                        <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '14px', color: '#0f172a' }}>
                          <Link
                            to={`${all_routes.instructorDetails}?id=${inst.id}`}
                            className="text-decoration-none"
                            style={{ color: '#0f172a' }}
                          >
                            {inst.fullname}
                          </Link>
                        </h6>
                        <div className="text-primary fw-medium text-truncate" style={{ fontSize: '11.5px' }}>
                          {inst.role}
                        </div>
                        <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                          {inst.department}
                        </div>
                      </div>
                    </div>

                  <p
                    className="text-muted mb-2 flex-grow-1"
                    style={{
                      fontSize: '12px',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {inst.bio}
                  </p>

                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {(inst.skills || []).slice(0, 2).map((sk, idx) => (
                      <span
                        key={idx}
                        className="badge bg-light text-secondary border"
                        style={{ fontSize: '10.5px', fontWeight: 500 }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto" style={{ fontSize: '11.5px', color: '#475569' }}>
                    <span>
                      <i className="isax isax-book-1 me-1 text-primary" />
                      {inst.coursesCount} Courses
                    </span>
                    <span>
                      <i className="isax isax-profile-2user me-1 text-success" />
                      {inst.studentsCount} Scholars
                    </span>
                    <Link
                      to={`${all_routes.instructorDetails}?id=${inst.id}`}
                      className="text-decoration-none fw-semibold"
                      style={{ color: '#0171BB' }}
                    >
                      Profile →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
};

export default Experienced;
