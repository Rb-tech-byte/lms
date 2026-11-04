import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';
import { courseService, PublicCatalogCourse } from '../../../../core/api/courseService';
import { useCmsConfig } from '../../../../core/api/cmsService';

const Featuredcourse: React.FC = () => {
  const { cms } = useCmsConfig();
  const sectionCfg = cms.sections.courses;
  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);
  const [activeFaculty, setActiveFaculty] = useState<string>('ALL');

  useEffect(() => {
    let active = true;
    courseService.getPublicCatalog().then((res) => {
      if (active) setCourses(res.courses || []);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!sectionCfg.visible) return null;

  const facultyFilters = ['ALL', ...Array.from(new Set(courses.map((c) => c.categoryName)))];
  const visibleCourses =
    activeFaculty === 'ALL'
      ? courses
      : courses.filter((c) => c.categoryName === activeFaculty);

  return (
    <section className="py-4" style={{ background: 'linear-gradient(180deg, #F0F7FF 0%, #FFFFFF 100%)', borderTop: '2px solid #CBE4F9', borderBottom: '2px solid #CBE4F9' }}>
      <div className="container">
        {/* Compact Header + Faculty Filter Pills */}
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

          <div className="d-flex flex-wrap align-items-center gap-1">
            {facultyFilters.map((fac) => (
              <button
                key={fac}
                type="button"
                onClick={() => setActiveFaculty(fac)}
                className="btn btn-sm rounded-pill px-3 py-1 fw-medium"
                style={{
                  fontSize: '12px',
                  background: activeFaculty === fac ? '#0171BB' : '#ffffff',
                  color: activeFaculty === fac ? '#ffffff' : '#334155',
                  border: activeFaculty === fac ? '1px solid #0171BB' : '1px solid #cbd5e1',
                }}
              >
                {fac === 'ALL' ? 'All Programmes' : fac.replace('Faculty of ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Native Course Cards Grid */}
        <div className="row g-3">
          {visibleCourses.map((course) => (
            <div key={course.id} className="col-xl-3 col-lg-4 col-md-6">
              <div
                className="card h-100 border shadow-sm d-flex flex-column"
                style={{
                  borderRadius: '12px',
                  border: '1.5px solid #E2E8F0',
                  borderTop: `3.5px solid ${course.accentColor || '#0171BB'}`,
                  borderBottom: '3px solid #FFD200',
                  overflow: 'hidden',
                }}
              >
                {/* Authentic Thematic Course Thumbnail Banner with Badges */}
                <div
                  className="position-relative overflow-hidden"
                  style={{
                    height: '140px',
                    background: course.accentColor ? `${course.accentColor}12` : '#F0F8FF',
                    borderBottom: '3px solid #FFD200',
                  }}
                >
                  <Link to={`${all_routes.courseDetails}?id=${course.id}`}>
                    <img
                      src={course.courseImage}
                      alt={course.fullname}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        const ownSlug = (course.shortname || `course-${course.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-');
                        const ownThumbnail = `/assets/img/course/thumbnails/course-${course.id}-${ownSlug}.svg`;
                        if (target.src !== ownThumbnail && !target.src.endsWith(ownThumbnail)) {
                          target.src = ownThumbnail;
                        }
                      }}
                    />
                  </Link>
                  <span
                    className="badge rounded-pill position-absolute top-0 start-0 m-2 px-2.5 py-1 fw-bold"
                    style={{
                      background: course.accentColor || '#0171BB',
                      color: '#ffffff',
                      border: '1px solid #FFD200',
                      fontSize: '0.68rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
                    }}
                  >
                    {course.shortname}
                  </span>
                  <span
                    className="badge rounded-pill position-absolute top-0 end-0 m-2 px-2.5 py-1 fw-bold"
                    style={{
                      background: '#FFD200',
                      color: '#003B66',
                      fontSize: '0.72rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    }}
                  >
                    {course.priceFormatted}
                  </span>
                </div>

                <div className="card-body p-3 d-flex flex-column flex-grow-1">
                  <div className="text-muted mb-1 text-truncate" style={{ fontSize: '11.5px' }}>
                    <i className="isax isax-courthouse me-1" style={{ color: course.accentColor || '#0171BB' }} />
                    {course.categoryName}
                  </div>

                  <h6 className="fw-bold mb-2" style={{ fontSize: '14.5px', lineHeight: 1.35 }}>
                    <Link
                      to={`${all_routes.courseDetails}?id=${course.id}`}
                      className="text-decoration-none"
                      style={{ color: '#0f172a' }}
                    >
                      {course.fullname}
                    </Link>
                  </h6>

                  <p
                    className="text-muted mb-3 flex-grow-1"
                    style={{
                      fontSize: '12.5px',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.summary || 'Accredited distance-learning module with interactive lectures and quizzes.'}
                  </p>

                  {/* Compact Meta Strip */}
                  <div
                    className="d-flex align-items-center justify-content-between py-2 px-2 rounded-2 mb-3"
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '11.5px', color: '#334155' }}
                  >
                    <span>
                      <i className="isax isax-book-1 me-1 text-primary" />
                      {course.sectionsCount} Sections
                    </span>
                    <span>
                      <i className="isax isax-note-2 me-1 text-success" />
                      {course.modulesCount} Units
                    </span>
                    <span>
                      <i className="isax isax-profile-2user me-1 text-info" />
                      {course.enrolledCount}
                    </span>
                  </div>

                  {/* Instructor & Action Footer */}
                  <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                    <div className="d-flex align-items-center gap-2 min-w-0">
                      <img
                        src={course.instructorAvatar}
                        alt={course.instructorName}
                        className="rounded-circle flex-shrink-0"
                        width={24}
                        height={24}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                        }}
                      />
                      <span className="text-muted text-truncate" style={{ fontSize: '12px' }}>
                        {course.instructorName}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-1 flex-shrink-0">
                      <Link
                        to={`${all_routes.courseDetails}?id=${course.id}`}
                        className="btn btn-sm btn-light border py-1 px-2"
                        style={{ fontSize: '11.5px' }}
                      >
                        Syllabus
                      </Link>
                      <Link
                        to={`${all_routes.courseCheckout}?courseId=${course.id}`}
                        className="btn btn-sm btn-primary py-1 px-2 fw-semibold"
                        style={{
                          background: course.accentColor || '#0171BB',
                          borderColor: course.accentColor || '#0171BB',
                          fontSize: '11.5px',
                        }}
                      >
                        Enrol
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-3">
          <Link
            to={sectionCfg.ctaRoute || all_routes.courseGrid}
            className="btn btn-sm btn-primary rounded-pill px-4 fw-bold"
            style={{ fontSize: '12.5px' }}
          >
            {sectionCfg.ctaText} ({courses.length} Active Programmes) →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Featuredcourse;
