import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';
import { courseService, PublicCatalogCategory } from '../../../../core/api/courseService';
import { useCmsConfig } from '../../../../core/api/cmsService';

const FACULTY_ACCENTS = ['#0171BB', '#005B97', '#0082D6', '#D97706', '#0171BB', '#005B97'];
const FACULTY_ICONS = ['isax-cpu-setting', 'isax-chart-21', 'isax-courthouse', 'isax-teacher', 'isax-book-1', 'isax-global'];

const Categories: React.FC = () => {
  const { cms } = useCmsConfig();
  const sectionCfg = cms.sections.faculties;
  const [categories, setCategories] = useState<PublicCatalogCategory[]>([]);

  useEffect(() => {
    let active = true;
    courseService.getPublicCatalog().then((res) => {
      if (active) setCategories(res.categories || []);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!sectionCfg.visible) return null;

  return (
    <section className="py-4" style={{ background: '#ffffff' }}>
      <div className="container">
        {/* Compact Section Header */}
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
          <div>
            <div
              className="text-uppercase fw-bold mb-1"
              style={{ fontSize: '11px', color: '#0171BB', letterSpacing: '0.06em' }}
            >
              {sectionCfg.eyebrow}
            </div>
            <h3 className="fw-bold mb-1" style={{ fontSize: '20px', color: '#0f172a' }}>
              {sectionCfg.title}
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
              {sectionCfg.subtitle}
            </p>
          </div>
          <Link
            to={sectionCfg.ctaRoute || all_routes.courseCategory}
            className="btn btn-sm btn-outline-primary rounded-2 px-3 fw-semibold"
            style={{ fontSize: '12.5px' }}
          >
            {sectionCfg.ctaText} →
          </Link>
        </div>

        {/* Native Faculty Cards Grid */}
        <div className="row g-3">
          {categories.map((cat, idx) => {
            const accent = cat.accentColor || FACULTY_ACCENTS[idx % FACULTY_ACCENTS.length];
            const iconImg = cat.icon || cat.categoryIcon;
            const coverImg = cat.cover || cat.categoryCover;
            const fallbackIcon = FACULTY_ICONS[idx % FACULTY_ICONS.length];

            return (
              <div key={cat.id} className="col-lg-4 col-md-6">
                <Link
                  to={`${all_routes.courseGrid}?category=${encodeURIComponent(cat.name)}`}
                  className="card h-100 text-decoration-none border shadow-sm overflow-hidden"
                  style={{
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                    borderTop: `3.5px solid ${accent}`,
                    borderBottom: '3px solid #FFD200',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  {/* Category Cover Banner */}
                  {coverImg && (
                    <div
                      className="position-relative overflow-hidden"
                      style={{
                        height: '95px',
                        background: `${accent}15`,
                        borderBottom: '3px solid #FFD200',
                      }}
                    >
                      <img
                        src={coverImg}
                        alt={cat.name}
                        className="w-100 h-100 object-fit-cover"
                        style={{ opacity: 1 }}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          const fallback = `/assets/img/category/covers/cat-cover-${cat.id}-fstes.svg`;
                          if (target.src !== fallback && !target.src.endsWith(fallback)) {
                            target.src = fallback;
                          } else {
                            target.src = '/assets/img/category/covers/cat-cover-2-fstes.svg';
                          }
                        }}
                      />
                      <span
                        className="badge position-absolute top-2 end-2 px-2.5 py-1 rounded-pill fw-bold"
                        style={{
                          backgroundColor: accent,
                          color: '#ffffff',
                          border: '1px solid #FFD200',
                          fontSize: '10px',
                          letterSpacing: '0.04em',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        }}
                      >
                        {cat.badgeText || cat.idnumber || `OUT-FAC-0${cat.id}`}
                      </span>
                    </div>
                  )}

                  <div className="card-body p-3 d-flex align-items-start gap-3">
                    <div
                      className="rounded-3 d-inline-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                      style={{
                        width: '46px',
                        height: '46px',
                        background: `${accent}14`,
                        color: accent,
                        border: `1px solid ${accent}33`,
                      }}
                    >
                      {iconImg ? (
                        <img
                          src={iconImg}
                          alt=""
                          className="w-100 h-100 object-fit-contain p-1"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <i className={`isax ${fallbackIcon} fs-20`} />
                      )}
                    </div>
                    <div className="min-w-0 flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                        {!coverImg && (
                          <span
                            className="badge rounded-pill px-2 py-0"
                            style={{
                              background: `${accent}14`,
                              color: accent,
                              fontSize: '10.5px',
                            }}
                          >
                            {cat.badgeText || cat.idnumber || `OUT-FAC-0${cat.id}`}
                          </span>
                        )}
                        <span className="text-muted fw-semibold ms-auto" style={{ fontSize: '11.5px' }}>
                          {cat.coursecount} {cat.coursecount === 1 ? 'Course' : 'Courses'}
                        </span>
                      </div>
                      <h6
                        className="fw-bold mb-1 text-truncate"
                        style={{ fontSize: '14.5px', color: '#0f172a', lineHeight: 1.35 }}
                        title={cat.name}
                      >
                        {cat.name}
                      </h6>
                      <p
                        className="text-muted mb-0"
                        style={{
                          fontSize: '12px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4,
                        }}
                      >
                        {cat.description ||
                          `Accredited undergraduate and postgraduate modules under ${cat.name}.`}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
