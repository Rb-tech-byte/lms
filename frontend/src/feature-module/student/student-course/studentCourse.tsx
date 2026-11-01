import React, { useState, useEffect, useMemo } from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import StudentSidebar from "../common/studentSidebar";
import ProfileCard from "../common/profileCard";
import { all_routes } from "../../router/all_routes";
import { useAuth } from "../../../core/auth/authContext";
import { courseService, EnrolledCourse, getMoodleUserId } from "../../../core/api/courseService";

type TabFilter = "all" | "active" | "completed";

const StudentCourse: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
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
          setError(err?.message || "Failed to load enrolled courses from Moodle");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCourses();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const allCount = courses.length;
  const completedCount = courses.filter((c) => (c.progress ?? 0) >= 100).length;
  const activeCount = courses.filter((c) => (c.progress ?? 0) < 100).length;

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const progress = c.progress ?? 0;
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "active" && progress < 100) ||
        (activeTab === "completed" && progress >= 100);

      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        c.fullname.toLowerCase().includes(query) ||
        c.shortname.toLowerCase().includes(query) ||
        (c.summary && c.summary.toLowerCase().includes(query));

      return matchesTab && matchesQuery;
    });
  }, [courses, activeTab, searchQuery]);

  const getCourseImage = (index: number) => {
    const images = [
      "assets/img/course/course-01.jpg",
      "assets/img/course/course-02.jpg",
      "assets/img/course/course-03.jpg",
      "assets/img/course/course-04.jpg",
    ];
    return images[index % images.length];
  };

  return (
    <>
      <Breadcrumb title="My Enrolled Courses" />

      <div className="content">
        <div className="container">
          {/* Dynamic Profile Header Box */}
          <ProfileCard />

          <div className="row">
            {/* Student Sidebar */}
            <StudentSidebar />

            {/* Enrolled Courses Main Content */}
            <div className="col-lg-9">
              {/* Header and Filter Tabs */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-3 pb-3 border-bottom">
                    <div>
                      <h4 className="fs-20 fw-bold mb-1 text-dark">Enrolled Courses</h4>
                      <p className="text-muted small mb-0">
                        Track your academic progress and access interactive lecture classrooms.
                      </p>
                    </div>

                    {/* Search Field */}
                    <div className="position-relative" style={{ minWidth: "240px" }}>
                      <input
                        type="text"
                        className="form-control rounded-pill pe-5 ps-3"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <i className="isax isax-search-normal-1 position-absolute top-50 end-0 translate-middle-y me-3 text-muted" />
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                    <ul className="nav nav-pills gap-2" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button
                          type="button"
                          className={`nav-link rounded-pill px-3 py-2 small fw-semibold ${
                            activeTab === "all" ? "active bg-primary text-white" : "bg-light text-muted"
                          }`}
                          onClick={() => setActiveTab("all")}
                        >
                          All Courses ({allCount})
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          type="button"
                          className={`nav-link rounded-pill px-3 py-2 small fw-semibold ${
                            activeTab === "active" ? "active bg-primary text-white" : "bg-light text-muted"
                          }`}
                          onClick={() => setActiveTab("active")}
                        >
                          In Progress / Active ({activeCount})
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          type="button"
                          className={`nav-link rounded-pill px-3 py-2 small fw-semibold ${
                            activeTab === "completed" ? "active bg-primary text-white" : "bg-light text-muted"
                          }`}
                          onClick={() => setActiveTab("completed")}
                        >
                          Completed ({completedCount})
                        </button>
                      </li>
                    </ul>

                    <span className="text-muted small">
                      Showing <strong>{filteredCourses.length}</strong> of {courses.length} courses
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Cards Container */}
              {loading ? (
                <div className="text-center py-5 bg-white rounded-3 shadow-sm mb-4">
                  <div className="spinner-border text-primary mb-3" role="status" />
                  <p className="text-muted small mb-0">Synchronizing your enrolments with Moodle...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger mb-4" role="alert">
                  <i className="isax isax-danger me-2" />
                  {error}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 shadow-sm mb-4">
                  <div className="avatar avatar-xxl rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3">
                    <i className="isax isax-book fs-32 text-muted" />
                  </div>
                  <h5 className="fw-bold text-dark">No Courses Found</h5>
                  <p className="text-muted small mb-4">
                    {searchQuery
                      ? `No enrolled courses matched "${searchQuery}".`
                      : activeTab === "completed"
                      ? "You haven't completed any courses yet. Keep learning!"
                      : "You are not enrolled in any active courses."}
                  </p>
                  <Link to={all_routes.courseGrid} className="btn btn-primary rounded-pill px-4 shadow-sm">
                    Browse All Courses
                  </Link>
                </div>
              ) : (
                <div className="row g-4">
                  {filteredCourses.map((course, idx) => {
                    const progressVal = Math.round(course.progress ?? 0);
                    const isDone = progressVal >= 100;
                    const hasStarted = progressVal > 0;

                    return (
                      <div key={course.id} className="col-xl-4 col-md-6">
                        <div className="course-item-two course-item mx-0 h-100 d-flex flex-column bg-white rounded-3 border shadow-sm overflow-hidden">
                          {/* Course Thumbnail Image */}
                          <div className="course-img position-relative overflow-hidden">
                            <Link to={`/course/course-watch?courseId=${course.id}`}>
                              <ImageWithBasePath
                                src={getCourseImage(idx)}
                                alt={course.fullname}
                                className="img-fluid w-100 object-fit-cover"
                                height={180}
                              />
                            </Link>
                            <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3">
                              <span className="badge bg-dark-subtle text-dark border fw-bold">
                                {course.shortname}
                              </span>
                              <span
                                className={`badge ms-auto ${
                                  isDone
                                    ? "bg-success"
                                    : hasStarted
                                    ? "bg-primary"
                                    : "bg-secondary"
                                }`}
                              >
                                {isDone ? "Completed" : hasStarted ? `${progressVal}% Complete` : "Not Started"}
                              </span>
                            </div>
                          </div>

                          {/* Course Card Body */}
                          <div className="course-content p-3 flex-grow-1 d-flex flex-column justify-content-between">
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="badge badge-light rounded-pill bg-light text-muted fs-12 fw-medium">
                                  {course.category === 2 ? "Faculty of Science & IT" : "Business Management"}
                                </span>
                                <span className="small text-muted">
                                  <i className="isax isax-profile-2user me-1" />
                                  {course.enrolledusercount || 1} Enrolled
                                </span>
                              </div>

                              <h6 className="title mb-2 fs-16 fw-bold line-clamp-2">
                                <Link
                                  to={`/course/course-watch?courseId=${course.id}`}
                                  className="text-dark text-decoration-none"
                                >
                                  {course.fullname.replace(/&amp;/g, "&")}
                                </Link>
                              </h6>

                              <p className="text-muted small line-clamp-2 mb-3">
                                {course.summary
                                  ? course.summary.replace(/<[^>]*>?/gm, "")
                                  : "Comprehensive undergraduate syllabus at the Open University of Tanzania."}
                              </p>
                            </div>

                            {/* Progress & Bottom Controls */}
                            <div>
                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="text-muted small" style={{ fontSize: "12px" }}>
                                    Progress
                                  </span>
                                  <span className="fw-bold small" style={{ fontSize: "12px" }}>
                                    {progressVal}%
                                  </span>
                                </div>
                                <div className="progress" style={{ height: "6px" }}>
                                  <div
                                    className={`progress-bar ${isDone ? "bg-success" : "bg-primary"}`}
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
                                  Moodle 5.x
                                </span>
                                <Link
                                  to={`/course/course-watch?courseId=${course.id}`}
                                  className={`btn btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1 ${
                                    isDone
                                      ? "btn-outline-success"
                                      : hasStarted
                                      ? "btn-primary"
                                      : "btn-dark"
                                  }`}
                                >
                                  <span>{isDone ? "Review" : hasStarted ? "Continue" : "Start"}</span>
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

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentCourse;
