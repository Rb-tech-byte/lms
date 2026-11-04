import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link, useSearchParams } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { courseService, PublicCatalogCourse } from '../../../core/api/courseService';

const BlogDetails: React.FC = () => {
  const route = all_routes;
  const [searchParams] = useSearchParams();
  const targetId = Number(searchParams.get('id') || 0);

  const [course, setCourse] = useState<PublicCatalogCourse | null>(null);
  const [related, setRelated] = useState<PublicCatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    courseService
      .getPublicCatalog()
      .then((res) => {
        if (!mounted) return;
        const list = res.courses || [];
        const found = list.find((c) => c.id === targetId) || list[0] || null;
        setCourse(found);
        setRelated(list.filter((c) => c.id !== found?.id).slice(0, 3));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [targetId]);

  return (
    <>
      <Breadcrumb title="OUT Academic Bulletin & Research Update" />
      <div className="blog-sec blog-details py-5">
        <div className="container">
          {loading || !course ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <div className="row justify-content-center g-4">
              <div className="col-lg-8">
                <img
                  className="img-fluid rounded-3 w-100 mb-4"
                  style={{ maxHeight: 360, objectFit: 'cover' }}
                  src={course.image}
                  alt={course.fullname}
                />
                <div className="blog-info my-3">
                  <ul className="d-flex align-items-center flex-wrap list-unstyled gap-3">
                    <li>
                      <div className="d-flex align-items-center">
                        <img
                          className="rounded-circle me-2"
                          style={{ width: 32, height: 32, objectFit: 'cover' }}
                          src={course.instructor.avatar}
                          alt={course.instructor.fullname}
                        />
                        <span>{course.instructor.fullname}</span>
                      </div>
                    </li>
                    <li>
                      <i className="isax isax-calendar-1 me-1 text-primary" />
                      {new Date((course.startdate || 1735689600) * 1000).toLocaleDateString()}
                    </li>
                    <li>
                      <span className="badge bg-primary-transparent text-primary">
                        {course.categoryname}
                      </span>
                    </li>
                  </ul>
                </div>

                <h3 className="mb-3 fw-bold">
                  Academic Bulletin: {course.fullname} ({course.shortname})
                </h3>
                <p>
                  {course.summary ||
                    `The Open University of Tanzania Directorate of Academic Services announces updated study materials, virtual lecture schedules, and assessment guidelines for ${course.fullname}.`}
                </p>
                <p>
                  This module comprises <strong>{course.lessonsCount} structured learning units</strong>{' '}
                  delivered through the Moodle 5.3 Headless digital classroom. Registered learners
                  across all 30 OUT Regional Centres can access lecture recordings, interactive
                  quizzes, and coursework submission portals directly from their Student Dashboard.
                </p>

                <div className="p-4 bg-light rounded-3 border my-4">
                  <h6 className="fw-bold mb-2">Key Module Highlights</h6>
                  <ul className="mb-0">
                    <li>Course Code: {course.shortname}</li>
                    <li>Faculty Category: {course.categoryname}</li>
                    <li>Module Coordinator: {course.instructor.fullname}</li>
                    <li>
                      Tuition Structure:{' '}
                      {course.fee > 0
                        ? `${course.currency} ${course.fee.toLocaleString()}`
                        : 'Open Access (Free)'}
                    </li>
                  </ul>
                </div>

                <div className="d-flex gap-2 flex-wrap mt-4">
                  <Link
                    to={`${route.courseDetails}?id=${course.id}`}
                    className="btn btn-primary rounded-pill px-4"
                  >
                    View Full Course Syllabus
                  </Link>
                  <Link
                    to={`${route.courseCheckout}?courseId=${course.id}`}
                    className="btn btn-secondary rounded-pill px-4"
                  >
                    Enroll in {course.shortname}
                  </Link>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card border-0 shadow-sm p-4">
                  <h5 className="fw-bold mb-3">Related Academic Bulletins</h5>
                  {related.map((item) => (
                    <div key={item.id} className="border-bottom pb-3 mb-3 last-border-0">
                      <span className="badge bg-light text-dark border mb-1">{item.shortname}</span>
                      <h6 className="mb-1">
                        <Link to={`${route.blogDetails}?id=${item.id}`}>{item.fullname}</Link>
                      </h6>
                      <small className="text-muted">{item.instructor.fullname}</small>
                    </div>
                  ))}
                  <Link to={route.blogGrid} className="btn btn-outline-primary btn-sm w-100 mt-2">
                    All Academic Bulletins
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogDetails;
