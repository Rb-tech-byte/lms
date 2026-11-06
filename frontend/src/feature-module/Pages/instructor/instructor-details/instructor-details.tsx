import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';
import {
  courseService,
  PublicInstructor,
  PublicCatalogCourse,
} from '../../../../core/api/courseService';

const InstructorDetails: React.FC = () => {
  const route = all_routes;
  const [searchParams, setSearchParams] = useSearchParams();
  const targetId = Number(searchParams.get('id') || 0);

  const [instructors, setInstructors] = useState<PublicInstructor[]>([]);
  const [instructor, setInstructor] = useState<PublicInstructor | null>(null);
  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      setLoading(true);
      try {
        const [instList, catalog] = await Promise.all([
          courseService.getPublicInstructors(),
          courseService.getPublicCatalog(),
        ]);
        if (!mounted) return;
        setInstructors(instList || []);
        const found =
          instList.find((i) => i.id === targetId) || instList[0] || null;
        setInstructor(found);
        if (found) {
          const taught = (catalog.courses || []).filter(
            (c) =>
              c.instructor.id === found.id ||
              found.courses.some((fc) => fc.id === c.id)
          );
          setCourses(taught.length > 0 ? taught : (catalog.courses || []).slice(0, 3));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadProfile();
    return () => {
      mounted = false;
    };
  }, [targetId]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '82vh' }}>
      {/* Compact Dark-Navy Lecturer Header Card */}
      <section
        className="py-4"
        style={{
          background: 'linear-gradient(135deg, #013BA6 0%, #013BA6 55%, #228DDD 100%)',
          borderBottom: '3px solid #F4ED2D',
        }}
      >
        <div className="container">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="d-flex align-items-center gap-2 small" style={{ color: '#cbd5e1' }}>
              <Link to={route.home} className="text-decoration-none" style={{ color: '#cbd5e1' }}>
                Home
              </Link>
              <span>/</span>
              <Link to={route.instructorGrid} className="text-decoration-none" style={{ color: '#cbd5e1' }}>
                Lecturers
              </Link>
              <span>/</span>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>{instructor?.fullname || 'Profile'}</span>
            </div>

            {instructors.length > 1 && (
              <div className="d-flex align-items-center gap-1 flex-wrap">
                {instructors.map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => setSearchParams({ id: String(inst.id) })}
                    className="btn btn-sm rounded-pill px-2.5 py-0.5 fw-semibold"
                    style={{
                      fontSize: '0.72rem',
                      background: inst.id === instructor?.id ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                      color: inst.id === instructor?.id ? '#0f172a' : '#e2e8f0',
                      border: 'none',
                    }}
                  >
                    {inst.fullname.split(' ').slice(0, 2).join(' ')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading || !instructor ? (
            <div className="text-center py-4 text-white">
              <div className="spinner-border spinner-border-sm text-warning me-2" role="status" />
              <span className="small">Loading academic lecturer profile...</span>
            </div>
          ) : (
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <div className="d-sm-flex align-items-center gap-3">
                  <img
                    src={instructor.avatar}
                    alt={instructor.fullname}
                    className="rounded-4 border border-2 border-warning flex-shrink-0"
                    style={{ width: 96, height: 96, objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                    }}
                  />
                  <div className="mt-3 mt-sm-0">
                    <span
                      className="badge rounded-pill px-3 py-1 fw-bold mb-1"
                      style={{ background: '#F4ED2D', color: '#051426', fontSize: '0.72rem' }}
                    >
                      {instructor.role}
                    </span>
                    <h1 className="fw-bold text-white mb-1" style={{ fontSize: '1.55rem' }}>
                      {instructor.fullname}
                    </h1>
                    <p className="mb-2 small" style={{ color: '#cbd5e1' }}>
                      {instructor.department} • {instructor.city}, {instructor.country}
                    </p>
                    <div className="d-flex flex-wrap gap-1.5">
                      {(instructor.skills || []).map((s) => (
                        <span
                          key={s}
                          className="badge rounded-pill"
                          style={{
                            background: 'rgba(255,255,255,0.12)',
                            color: '#e2e8f0',
                            fontSize: '0.7rem',
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div
                  className="row g-2 text-center p-3 rounded-4"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div className="col-4">
                    <h5 className="fw-bold text-warning mb-0">{instructor.courseCount}</h5>
                    <small style={{ color: '#cbd5e1', fontSize: '0.72rem' }}>Programmes</small>
                  </div>
                  <div className="col-4 border-start border-end border-light border-opacity-10">
                    <h5 className="fw-bold text-white mb-0">{instructor.studentCount}</h5>
                    <small style={{ color: '#cbd5e1', fontSize: '0.72rem' }}>Scholars</small>
                  </div>
                  <div className="col-4">
                    <h5 className="fw-bold text-warning mb-0">
                      <i className="fas fa-star me-1" />
                      {instructor.rating}
                    </h5>
                    <small style={{ color: '#cbd5e1', fontSize: '0.72rem' }}>Evaluation</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      {instructor && (
        <section className="py-4">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-3">
                  <h6 className="fw-bold text-dark mb-2">Academic Biography & Research Profile</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>
                    {instructor.bio}
                  </p>
                </div>

                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="fw-bold text-dark mb-0">
                      Programmes Coordinated by {instructor.fullname}
                    </h6>
                    <span className="badge bg-primary-subtle text-primary rounded-pill">
                      {courses.length} Active Courses
                    </span>
                  </div>
                  <div className="row g-3">
                    {courses.map((course) => (
                      <div className="col-md-6 d-flex" key={course.id}>
                        <div className="border rounded-4 p-3 w-100 d-flex flex-column justify-content-between bg-light bg-opacity-50">
                          <div>
                            <img
                              src={course.image}
                              alt={course.fullname}
                              className="img-fluid rounded-3 w-100 mb-2"
                              style={{ height: 125, objectFit: 'cover' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const ownSlug = (course.shortname || `course-${course.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-');
                                const ownThumbnail = `/assets/img/course/thumbnails/course-${course.id}-${ownSlug}.svg`;
                                if (target.src !== ownThumbnail && !target.src.endsWith(ownThumbnail)) {
                                  target.src = ownThumbnail;
                                }
                              }}
                            />
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <span className="badge bg-primary-subtle text-primary rounded-pill" style={{ fontSize: '0.68rem' }}>
                                {course.shortname}
                              </span>
                              <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                                {course.lessonsCount} Units • {course.enrolledCount} Scholars
                              </small>
                            </div>
                            <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
                              <Link to={`${route.courseDetails}?id=${course.id}`} className="text-dark text-decoration-none">
                                {course.fullname}
                              </Link>
                            </h6>
                          </div>
                          <div className="d-flex justify-content-between align-items-center pt-2 mt-2 border-top">
                            <span className="fw-bold text-primary small">
                              {course.priceFormatted}
                            </span>
                            <Link
                              to={`${route.courseDetails}?id=${course.id}`}
                              className="btn btn-sm btn-primary rounded-pill px-3"
                              style={{ fontSize: '0.74rem' }}
                            >
                              View Syllabus
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-3">
                  <h6 className="fw-bold text-dark mb-3">Academic Credentials</h6>
                  <div className="d-flex align-items-center mb-3">
                    <span
                      className="rounded-3 d-inline-flex align-items-center justify-content-center me-3"
                      style={{ width: 40, height: 40, background: '#eff6ff', color: '#013BA6' }}
                    >
                      <i className="isax isax-teacher fs-5" />
                    </span>
                    <div>
                      <div className="fw-semibold text-dark small">{instructor.faculty}</div>
                      <small className="text-muted">{instructor.department}</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span
                      className="rounded-3 d-inline-flex align-items-center justify-content-center me-3"
                      style={{ width: 40, height: 40, background: '#ecfdf5', color: '#059669' }}
                    >
                      <i className="isax isax-verify fs-5" />
                    </span>
                    <div>
                      <div className="fw-semibold text-dark small">Accredited University Lecturer</div>
                      <small className="text-muted">Staff ID: {instructor.staffId}</small>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h6 className="fw-bold text-dark mb-3">Academic Office & Contact</h6>
                  <p className="mb-2 small">
                    <i className="isax isax-sms text-primary me-2" />
                    <a href={`mailto:${instructor.email}`} className="text-decoration-none">
                      {instructor.email}
                    </a>
                  </p>
                  <p className="mb-3 small text-muted">
                    <i className="isax isax-location text-secondary me-2" />
                    Kawawa Road, Kinondoni, Dar es Salaam
                  </p>
                  <Link to={route.instructorGrid} className="btn btn-outline-secondary btn-sm rounded-pill w-100">
                    <i className="isax isax-arrow-left-2 me-1" /> Back to Lecturers Directory
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default InstructorDetails;
