import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';
import { courseService, PublicCatalogCategory, PublicCatalogCourse } from '../../../../core/api/courseService';
import { useCmsConfig } from '../../../../core/api/cmsService';
import { useAuth } from '../../../../core/auth/authContext';

const Banner: React.FC = () => {
  const navigate = useNavigate();
  const { cms } = useCmsConfig();
  const { isAuthenticated, user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<PublicCatalogCategory[]>([]);
  const [spotlightCourses, setSpotlightCourses] = useState<PublicCatalogCourse[]>([]);

  useEffect(() => {
    let active = true;
    courseService.getPublicCatalog().then((res) => {
      if (!active) return;
      setCategories(res.categories || []);
      setSpotlightCourses((res.courses || []).slice(0, 3));
    });
    return () => {
      active = false;
    };
  }, []);

  if (!cms.hero.visible) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`${all_routes.courseGrid}?${params.toString()}`);
  };

  return (
    <section
      style={{
        background: cms.hero.bgImage
          ? `linear-gradient(135deg, rgba(1, 59, 166, 0.88) 0%, rgba(0, 130, 214, 0.84) 55%, rgba(0, 149, 242, 0.82) 100%), url(${cms.hero.bgImage}) center/cover no-repeat`
          : 'linear-gradient(135deg, #013BA6 0%, #228DDD 55%, #0095F2 100%)',
        color: '#ffffff',
        padding: '38px 0 34px',
        borderTop: '4px solid #F4ED2D',
        borderBottom: '5px solid #F4ED2D',
      }}
    >
      <div className="container">
        <div className="row align-items-center g-4">
          {/* Left Column: Compact Hero & Search Card */}
          <div className="col-lg-7">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3"
              style={{
                background: '#F4ED2D', border: '1.5px solid #FEF207', color: '#003B66',
                fontSize: '12px',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(0, 59, 102, 0.16)',
              }}
            >
              <i className="isax isax-verify" />
              <span>{cms.hero.eyebrow}</span>
            </div>

            <h1
              className="fw-bold text-white mb-2"
              style={{ fontSize: 'clamp(1.65rem, 2.8vw, 2.35rem)', lineHeight: 1.22, letterSpacing: '-0.02em' }}
            >
              {cms.hero.title}
            </h1>

            <p
              className="mb-3"
              style={{ color: '#FFFDE7', fontSize: '14.5px', lineHeight: 1.6, maxWidth: '620px' }}
            >
              {cms.hero.subtitle}
            </p>

            {/* Compact Native Search Card */}
            <form
              onSubmit={handleSearch}
              className="p-2 rounded-3 mb-3 shadow-sm"
              style={{
                background: '#ffffff', border: '2.5px solid #F4ED2D', boxShadow: '0 8px 24px rgba(1, 59, 166, 0.22)',
              }}
            >
              <div className="row g-2 align-items-center">
                <div className="col-md-6">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-transparent border-0 text-primary">
                      <i className="isax isax-search-normal-1" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 shadow-none"
                      placeholder={cms.hero.searchPlaceholder}
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      style={{ fontSize: '13px', color: '#003B66' }}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select form-select-sm border-start border-0 rounded-0 shadow-none"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ fontSize: '12.5px', color: '#003B66' }}
                  >
                    <option value="">All Academic Faculties</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 d-grid">
                  <button
                    type="submit"
                    className="btn btn-sm btn-primary fw-semibold py-2 rounded-2"
                    style={{ background: '#013BA6', borderColor: '#013BA6', borderBottom: '2px solid #F4ED2D', color: '#ffffff', fontSize: '13px', fontWeight: 700 }}
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Compact Highlight Badges & Quick CTAs */}
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              {(cms.hero.highlights || []).map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-2 d-inline-flex align-items-center gap-1"
                  style={{
                    background: 'rgba(255, 253, 231, 0.18)', border: '1px solid #F4ED2D', color: '#ffffff',
                    fontSize: '11.5px', fontWeight: 600,
                  }}
                >
                  <i className="isax isax-tick-circle" style={{ color: '#FEF207' }} />
                  <span>{item}</span>
                </span>
              ))}
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <Link
                to={cms.hero.primaryCtaRoute || all_routes.courseGrid}
                className="btn btn-sm px-3 py-2 fw-bold rounded-2 d-inline-flex align-items-center gap-2"
                style={{ background: '#F4ED2D', border: '1.5px solid #FEF207', color: '#003B66', fontSize: '13px', boxShadow: '0 4px 12px rgba(0, 59, 102, 0.18)' }}
              >
                <i className="isax isax-book-1" />
                <span>{cms.hero.primaryCtaText}</span>
              </Link>
              <Link
                to={isAuthenticated && user ? user.dashboardUrl : cms.hero.secondaryCtaRoute || all_routes.login}
                className="btn btn-sm px-3 py-2 fw-semibold rounded-2 d-inline-flex align-items-center gap-2"
                style={{
                  background: 'rgba(255, 253, 231, 0.16)',
                  border: '1.5px solid #F4ED2D',
                  color: '#FFFDE7',
                  fontSize: '13px',
                }}
              >
                <i className="isax isax-login-1" />
                <span>
                  {isAuthenticated && user ? 'Open My Dashboard' : cms.hero.secondaryCtaText}
                </span>
              </Link>
            </div>
          </div>

          {/* Right Column: Bright OUT Logo White & Warm Map-Yellow Spotlight Card */}
          <div className="col-lg-5">
            <div
              className="p-3 rounded-3 shadow"
              style={{
                background: 'linear-gradient(145deg, #FFFFFF 0%, #FFFDE7 100%)',
                border: '3px solid #F4ED2D',
                borderBottom: '5px solid #013BA6',
                boxShadow: '0 14px 32px rgba(0, 59, 102, 0.22)',
              }}
            >
              {cms.hero.spotlightCover && (
                <div className="mb-2 rounded-2 overflow-hidden" style={{ height: '74px', border: '1.5px solid #013BA6' }}>
                  <img
                    src={cms.hero.spotlightCover}
                    alt="Featured Modules"
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
              <div className="d-flex align-items-center justify-content-between pb-2 mb-2" style={{ borderBottom: '1.5px solid #CBE4F9' }}>
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="d-inline-block rounded-circle"
                    style={{ width: '9px', height: '9px', background: '#013BA6', border: '2px solid #F4ED2D' }}
                  />
                  <span className="fw-bold" style={{ fontSize: '13px', color: '#003B66' }}>
                    Featured Degree Modules
                  </span>
                </div>
                <Link
                  to={all_routes.courseGrid}
                  className="text-decoration-none fw-bold"
                  style={{ fontSize: '12px', color: '#013BA6' }}
                >
                  All Courses →
                </Link>
              </div>

              <div className="d-flex flex-column gap-2">
                {spotlightCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-2 rounded-2 d-flex align-items-center justify-content-between gap-2"
                    style={{
                      background: '#F0F8FF',
                      border: '1px solid #93C5FD',
                      borderLeft: '4px solid #013BA6',
                    }}
                  >
                    <div className="min-w-0">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span
                          className="badge px-2 py-0"
                          style={{
                            background: '#F4ED2D', color: '#003B66', fontWeight: 800,
                            fontSize: '10.5px',
                          }}
                        >
                          {course.shortname}
                        </span>
                        <span className="fw-bold text-truncate" style={{ fontSize: '12.5px', color: '#003B66' }}>
                          {course.fullname}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-3" style={{ color: '#334155', fontSize: '11px' }}>
                        <span>
                          <i className="isax isax-teacher me-1 text-primary" />
                          {course.instructorName}
                        </span>
                        <span>
                          <i className="isax isax-book me-1 text-primary" />
                          {course.modulesCount} Units
                        </span>
                        <span className="fw-bold" style={{ color: '#013BA6' }}>{course.priceFormatted}</span>
                      </div>
                    </div>

                    <Link
                      to={`${all_routes.courseDetails}?id=${course.id}`}
                      className="btn btn-sm py-1 px-2.5 flex-shrink-0 fw-bold"
                      style={{
                        background: '#013BA6',
                        borderBottom: '2px solid #F4ED2D',
                        color: '#ffffff',
                        fontSize: '11.5px',
                      }}
                    >
                      Open
                    </Link>
                  </div>
                ))}
              </div>

              {/* Quick Role Portal Pills */}
              <div className="mt-3 pt-2 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ borderTop: '1.5px solid #CBE4F9' }}>
                <span className="fw-semibold" style={{ color: '#003B66', fontSize: '11.5px' }}>Quick Access:</span>
                <div className="d-flex gap-1">
                  <Link
                    to={all_routes.studentDashboard}
                    className="badge text-decoration-none px-2 py-1 fw-bold"
                    style={{ background: '#013BA6', color: '#ffffff', fontSize: '11px' }}
                  >
                    Scholar Portal
                  </Link>
                  <Link
                    to={all_routes.instructorDashboard}
                    className="badge text-decoration-none px-2 py-1 fw-bold"
                    style={{ background: '#F4ED2D', color: '#003B66', fontSize: '11px' }}
                  >
                    Lecturer Console
                  </Link>
                  <Link
                    to={all_routes.adminDashboard}
                    className="badge text-decoration-none px-2 py-1 fw-bold"
                    style={{ background: '#E8F4FC', color: '#013BA6', border: '1px solid #013BA6', fontSize: '11px' }}
                  >
                    Admin Governance
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
