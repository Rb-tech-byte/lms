import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { courseService, PublicCatalogCourse } from '../../../core/api/courseService';

const Notification: React.FC = () => {
  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);
  const [readIds, setReadIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    courseService
      .getPublicCatalog()
      .then((res) => {
        if (mounted) setCourses(res.courses || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const markAllRead = () => {
    setReadIds(courses.map((c) => c.id));
  };

  return (
    <>
      <Breadcrumb title="Academic Notifications & System Alerts" />
      <div className="content">
        <div className="container">
          <div className="notification-content">
            <div className="notification-head">
              <div className="row align-items-center row-gap-3">
                <div className="col-lg-8">
                  <h2 className="fs-32 fw-bold">OUT Moodle Notifications</h2>
                  <p>
                    Real-time academic updates, course releases, and assessment alerts from The Open University of Tanzania
                  </p>
                </div>
                <div className="col-lg-4">
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="btn mark-all-btn btn-light rounded-pill"
                    >
                      <i className="isax isax-tick-square me-2" /> Mark All as Read
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : (
              <div>
                <h6 className="fs-18 fw-semibold mb-3">Latest Course &amp; Assessment Activity</h6>
                {courses.map((c) => {
                  const isRead = readIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      className={`notification-item mb-3 ${isRead ? 'opacity-75' : ''}`}
                    >
                      <div className="row align-items-center">
                        <div className="col-md-9">
                          <div className="d-flex align-items-center">
                            <Link
                              to={`${all_routes.instructorDetails}?id=${c.instructor.id}`}
                              className="rounded-circle me-3"
                            >
                              <img
                                src={c.instructor.avatar}
                                alt={c.instructor.fullname}
                                className="img-fluid rounded-circle"
                                style={{ width: 48, height: 48, objectFit: 'cover' }}
                              />
                            </Link>
                            <div>
                              <h6 className="fs-16 fw-medium mb-1">
                                <Link to={`${all_routes.courseDetails}?id=${c.id}`}>
                                  {c.fullname} ({c.shortname})
                                </Link>{' '}
                                — {c.lessonsCount} modules published by{' '}
                                <strong>{c.instructor.fullname}</strong>
                              </h6>
                              <p className="fs-14 mb-0 text-muted">
                                {c.categoryname} • {c.enrolledCount} enrolled students
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 text-md-end mt-2 mt-md-0">
                          <Link
                            to={`${all_routes.courseDetails}?id=${c.id}`}
                            className="btn btn-sm btn-outline-primary rounded-pill"
                          >
                            Open Course
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notification;
