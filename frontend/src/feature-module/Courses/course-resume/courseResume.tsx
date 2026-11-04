import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { all_routes } from '../../router/all_routes';
import { courseService, MoodleCourse } from '../../../core/api/courseService';
import { useAuth } from '../../../core/auth/authContext';

const CourseResume: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<MoodleCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadEnrolled = async () => {
      setLoading(true);
      try {
        const uid = Number(user?.id || 4);
        const enrolled = await courseService.getUserEnrolledCourses(uid);
        if (!mounted) return;
        if (enrolled && enrolled.length > 0) {
          setCourses(enrolled);
        } else {
          const all = await courseService.getCourses();
          if (mounted) setCourses(all.filter((c) => c.id !== 1));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadEnrolled();
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <>
      <Breadcrumb title="Resume Active Courses" />
      <div className="content">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h4 className="mb-1 fw-bold">Continue Learning</h4>
              <p className="text-muted small mb-0">
                Pick up right where you left off in your enrolled Open University of Tanzania courses.
              </p>
            </div>
            <Link to={all_routes.studentDashboard} className="btn btn-outline-primary btn-sm">
              <i className="isax isax-element-4 me-1" /> Student Portal
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="text-muted mt-2 mb-0">Synchronizing Moodle course progress...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="card border-0 shadow-sm p-5 text-center">
              <h5>No enrolled courses yet</h5>
              <p className="text-muted">Browse the OUT course catalog to enroll in a course.</p>
              <div>
                <Link to={all_routes.courseGrid} className="btn btn-primary btn-sm">
                  Explore Course Catalog
                </Link>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {courses.map((course) => {
                const pct = Math.min(100, Math.max(0, Math.round(course.progress || 0)));
                return (
                  <div className="col-lg-6" key={course.id}>
                    <div className="card border-0 shadow-sm h-100 p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-primary-transparent text-primary">
                          {course.shortname}
                        </span>
                        <span className="badge bg-light text-dark border">{pct}% Complete</span>
                      </div>
                      <h5 className="fw-bold mb-2">
                        <Link to={`${all_routes.courseWatch}?id=${course.id}`}>
                          {course.fullname}
                        </Link>
                      </h5>
                      <div className="progress mb-3" style={{ height: 8 }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${pct}%` }}
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                        <Link
                          to={`${all_routes.courseDetails}?id=${course.id}`}
                          className="text-muted small text-decoration-underline"
                        >
                          View Course Details
                        </Link>
                        <Link
                          to={`${all_routes.courseWatch}?id=${course.id}`}
                          className="btn btn-secondary btn-sm rounded-pill px-3"
                        >
                          <i className="isax isax-play-circle me-1" />
                          Resume Classroom
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
    </>
  );
};

export default CourseResume;
