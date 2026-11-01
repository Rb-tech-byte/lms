import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import StudentSidebar from '../common/studentSidebar';
import CircleProgress from '../../Instructor/instructor-dashboard/circleProgress';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { all_routes } from '../../router/all_routes';
import { useAuth } from '../../../core/auth/authContext';
import { courseService, EnrolledCourse, getMoodleUserId } from '../../../core/api/courseService';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchEnrolled = async () => {
      setLoading(true);
      setError(null);
      try {
        const uid = getMoodleUserId(user);
        const data = await courseService.getUserEnrolledCourses(uid);
        if (isMounted) {
          setCourses(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load enrolled courses from Moodle');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEnrolled();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const totalEnrolled = courses.length;
  const completedCourses = courses.filter((c) => (c.progress ?? 0) >= 100).length;
  const activeCourses = courses.filter((c) => (c.progress ?? 0) < 100).length;

  // Find the primary in-progress course to feature in the top banner
  const currentFocusCourse =
    courses.find((c) => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100) ||
    courses[0] ||
    null;

  const getCourseImage = (index: number) => {
    const images = [
      'assets/img/course/course-01.jpg',
      'assets/img/course/course-02.jpg',
      'assets/img/course/course-03.jpg',
      'assets/img/course/course-04.jpg',
    ];
    return images[index % images.length];
  };

  return (
    <>
      <Breadcrumb title="Student Dashboard" />
      <div className="content">
        <div className="container">
          {/* Profile Header Box */}
          <ProfileCard />

          <div className="row">
            {/* Student Left Sidebar */}
            <StudentSidebar />

            {/* Main Dashboard Column */}
            <div className="col-lg-9">
              {/* Top Academic Focus Banner */}
              {currentFocusCourse && (
                <div className="card bg-light quiz-ans-card mb-4 border-0 shadow-sm overflow-hidden">
                  <ImageWithBasePath
                    src="./assets/img/shapes/withdraw-bg1.svg"
                    className="quiz-ans-bg1"
                    alt=""
                  />
                  <ImageWithBasePath
                    src="./assets/img/shapes/withdraw-bg2.svg"
                    className="quiz-ans-bg2"
                    alt=""
                  />
                  <div className="card-body p-4 position-relative z-index-2">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="badge bg-primary px-3 py-1 text-uppercase fw-semibold">
                              {currentFocusCourse.shortname}
                            </span>
                            <span className="badge bg-info-subtle text-info border border-info px-2">
                              Active Academic Focus
                            </span>
                          </div>
                          <h5 className="mb-2 text-dark fw-bold">
                            {currentFocusCourse.fullname.replace(/&amp;/g, '&')}
                          </h5>
                          <p className="text-muted small mb-2">
                            {Math.round(currentFocusCourse.progress ?? 0)}% Completed • Interactive Lecture Player & Moodle Web Services Ready
                          </p>
                          <div className="progress progress-sm w-75 bg-white border" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-primary"
                              role="progressbar"
                              style={{ width: `${Math.max(5, currentFocusCourse.progress ?? 0)}%` }}
                              aria-valuenow={currentFocusCourse.progress ?? 0}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 mt-3 mt-md-0">
                        <div className="text-md-end">
                          <Link
                            to={`/course/course-watch?courseId=${currentFocusCourse.id}`}
                            className="btn btn-primary rounded-pill px-4 shadow-sm d-inline-flex align-items-center gap-2"
                          >
                            <span>Resume Learning</span>
                            <i className="isax isax-play-circle" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3 Metric Summary Cards */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-primary-transparent me-3 flex-shrink-0 rounded-circle p-3">
                          <ImageWithBasePath src="assets/img/icon/graduation.svg" alt="" />
                        </span>
                        <div>
                          <span className="d-block text-muted small fw-medium">Enrolled Courses</span>
                          <h3 className="fs-24 fw-bold text-dark mt-1 mb-0">
                            {loading ? '...' : totalEnrolled}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-secondary-transparent me-3 flex-shrink-0 rounded-circle p-3">
                          <ImageWithBasePath src="assets/img/icon/book.svg" alt="" />
                        </span>
                        <div>
                          <span className="d-block text-muted small fw-medium">Active / In Progress</span>
                          <h3 className="fs-24 fw-bold text-dark mt-1 mb-0">
                            {loading ? '...' : activeCourses}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-success-transparent me-3 flex-shrink-0 rounded-circle p-3">
                          <ImageWithBasePath src="assets/img/icon/bookmark.svg" alt="" />
                        </span>
                        <div>
                          <span className="d-block text-muted small fw-medium">Completed Courses</span>
                          <h3 className="fs-24 fw-bold text-success mt-1 mb-0">
                            {loading ? '...' : completedCourses}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Courses Section */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fs-18 fw-bold mb-0 text-dark">
                  My Enrolled Courses ({courses.length})
                </h5>
                <Link to={all_routes.studentCourses} className="text-primary small fw-semibold d-inline-flex align-items-center gap-1">
                  View All Courses <i className="isax isax-arrow-right-3" />
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-5 bg-white rounded-3 shadow-sm mb-4">
                  <div className="spinner-border text-primary mb-3" role="status" />
                  <p className="text-muted small mb-0">Fetching your courses from Moodle Web Services...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger mb-4" role="alert">
                  <i className="isax isax-danger me-2" />
                  {error}
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 shadow-sm mb-4">
                  <i className="isax isax-book fs-32 text-muted mb-2 d-block" />
                  <h6>No Courses Enrolled Yet</h6>
                  <p className="text-muted small mb-3">Explore the OUT undergraduate catalog and enroll today.</p>
                  <Link to={all_routes.courseGrid} className="btn btn-primary btn-sm rounded-pill px-4">
                    Explore Catalog
                  </Link>
                </div>
              ) : (
                <div className="row g-3 mb-4">
                  {courses.map((course, idx) => {
                    const progressVal = Math.round(course.progress ?? 0);
                    const isDone = progressVal >= 100;
                    const hasStarted = progressVal > 0;

                    return (
                      <div key={course.id} className="col-xl-4 col-md-6">
                        <div className="course-item-two course-item mx-0 h-100 d-flex flex-column bg-white rounded-3 border shadow-sm overflow-hidden">
                          <div className="course-img position-relative overflow-hidden">
                            <Link to={`/course/course-watch?courseId=${course.id}`}>
                              <ImageWithBasePath
                                src={getCourseImage(idx)}
                                alt={course.fullname}
                                className="img-fluid w-100 object-fit-cover"
                                height={170}
                              />
                            </Link>
                            <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3">
                              <span className="badge bg-dark-subtle text-dark border">
                                {course.shortname}
                              </span>
                              <span className={`badge ${isDone ? 'bg-success' : hasStarted ? 'bg-primary' : 'bg-secondary'} ms-auto`}>
                                {isDone ? 'Completed' : hasStarted ? `${progressVal}% Done` : 'New'}
                              </span>
                            </div>
                          </div>

                          <div className="course-content p-3 flex-grow-1 d-flex flex-column justify-content-between">
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="badge badge-light rounded-pill bg-light text-muted fs-12 fw-medium">
                                  {course.category === 2 ? 'Computing & IT' : 'Business Management'}
                                </span>
                                <span className="small text-muted">
                                  <i className="isax isax-profile-2user me-1" />
                                  {course.enrolledusercount || 1} Learners
                                </span>
                              </div>

                              <h6 className="title mb-2 fs-15 fw-bold line-clamp-2">
                                <Link
                                  to={`/course/course-watch?courseId=${course.id}`}
                                  className="text-dark text-decoration-none"
                                >
                                  {course.fullname.replace(/&amp;/g, '&')}
                                </Link>
                              </h6>

                              <p className="text-muted small line-clamp-2 mb-3">
                                {course.summary ? course.summary.replace(/<[^>]*>?/gm, '') : 'Comprehensive course curriculum at OUT.'}
                              </p>
                            </div>

                            <div>
                              {/* Course Progress Meter */}
                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="text-muted small" style={{ fontSize: '11px' }}>Course Completion</span>
                                  <span className="fw-bold small" style={{ fontSize: '11px' }}>{progressVal}%</span>
                                </div>
                                <div className="progress" style={{ height: '5px' }}>
                                  <div
                                    className={`progress-bar ${isDone ? 'bg-success' : 'bg-primary'}`}
                                    role="progressbar"
                                    style={{ width: `${progressVal}%` }}
                                    aria-valuenow={progressVal}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  />
                                </div>
                              </div>

                              <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                                <span className="text-muted small">
                                  <i className="isax isax-verify5 text-success me-1" />
                                  Moodle Verified
                                </span>
                                <Link
                                  to={`/course/course-watch?courseId=${course.id}`}
                                  className={`btn btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1 ${
                                    isDone ? 'btn-outline-success' : hasStarted ? 'btn-primary' : 'btn-dark'
                                  }`}
                                >
                                  <span>{isDone ? 'Review' : hasStarted ? 'Continue' : 'Start'}</span>
                                  <i className="isax isax-arrow-right-3" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Row: Recent Milestones & Knowledge Checks */}
              <div className="row g-3">
                {/* Left Column: Academic Activity Feed */}
                <div className="col-xl-7">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                        <h5 className="mb-0 fs-16 fw-bold text-dark">
                          Recent Learning Activity
                        </h5>
                        <span className="badge bg-light text-muted border">Live Log</span>
                      </div>

                      <div className="d-flex align-items-start gap-3 mb-3 pb-3 border-bottom">
                        <div className="avatar avatar-md rounded-circle bg-success-transparent flex-shrink-0 d-flex align-items-center justify-content-center">
                          <i className="isax isax-tick-circle text-success fs-18" />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fs-14 fw-semibold text-dark">
                            Lecture 1: Introduction to Algorithms & Computational Thinking
                          </h6>
                          <p className="text-muted small mb-0">
                            Activity completed in <strong>CS101</strong> • Verified in Moodle DB
                          </p>
                        </div>
                        <span className="badge bg-success-subtle text-success small">Done</span>
                      </div>

                      <div className="d-flex align-items-start gap-3 mb-3 pb-3 border-bottom">
                        <div className="avatar avatar-md rounded-circle bg-primary-transparent flex-shrink-0 d-flex align-items-center justify-content-center">
                          <i className="isax isax-document-text text-primary fs-18" />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fs-14 fw-semibold text-dark">
                            CS101 Official Course Syllabus & Assessment Scheme (PDF)
                          </h6>
                          <p className="text-muted small mb-0">
                            Academic handout accessed in <strong>CS101</strong>
                          </p>
                        </div>
                        <span className="badge bg-primary-subtle text-primary small">Resource</span>
                      </div>

                      <div className="d-flex align-items-start gap-3">
                        <div className="avatar avatar-md rounded-circle bg-warning-transparent flex-shrink-0 d-flex align-items-center justify-content-center">
                          <i className="isax isax-task text-warning fs-18" />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fs-14 fw-semibold text-dark">
                            Module 1: Corporate Financial Governance & Policy
                          </h6>
                          <p className="text-muted small mb-0">
                            Course module 100% completed in <strong>BBA301</strong>
                          </p>
                        </div>
                        <span className="badge bg-success small">100%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Quiz & Assessment Performance */}
                <div className="col-xl-5">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                        <h5 className="mb-0 fs-16 fw-bold text-dark">
                          Knowledge Checks
                        </h5>
                        <Link to={all_routes.studentQuiz} className="text-primary small fw-semibold">
                          All Quizzes
                        </Link>
                      </div>

                      <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                        <div>
                          <h6 className="mb-1 fs-14 fw-semibold text-dark">
                            CS101 Mastery Assessment
                          </h6>
                          <p className="text-muted small mb-0">Module 3 Sorting & Complexity</p>
                        </div>
                        <CircleProgress value={85} />
                      </div>

                      <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                        <div>
                          <h6 className="mb-1 fs-14 fw-semibold text-dark">
                            BBA301 Governance Quiz
                          </h6>
                          <p className="text-muted small mb-0">Corporate Financial Policy</p>
                        </div>
                        <CircleProgress value={100} />
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="mb-1 fs-14 fw-semibold text-dark">
                            CS202 Cloud Architecture
                          </h6>
                          <p className="text-muted small mb-0">Containerization & Microservices</p>
                        </div>
                        <CircleProgress value={70} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;