import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import {
  instructorService,
  InstructorCourseItem,
  EnrolledStudentItem,
} from '../../../core/api/instructorService';

const InstructorCourse: React.FC = () => {
  const [courses, setCourses] = useState<InstructorCourseItem[]>(instructorService.getFallbackCourses());
  const [selectedCourse, setSelectedCourse] = useState<InstructorCourseItem | null>(instructorService.getFallbackCourses()[0]);
  const [courseStudents, setCourseStudents] = useState<EnrolledStudentItem[]>(instructorService.getFallbackStudents(2));
  const [loading, setLoading] = useState<boolean>(false);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await instructorService.getInstructorCourses();
        if (isMounted) {
          setCourses(data);
          if (data.length > 0) setSelectedCourse(data[0]);
        }
      } catch (err) {
        console.error("Failed to load instructor courses", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCourses();
    return () => { isMounted = false; };
  }, []);

  const handleOpenStudentsModal = async (course: InstructorCourseItem) => {
    setSelectedCourse(course);
    setStudentsLoading(true);
    try {
      const students = await instructorService.getCourseStudents(course.id);
      setCourseStudents(students);
    } catch (err) {
      console.error("Failed to load course students", err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'science') return c.categoryName?.includes('Science');
    if (filter === 'business') return c.categoryName?.includes('Business');
    return true;
  });

  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledusercount, 0);

  return (
    <>
      <Breadcrumb title="Assigned Academic Courses" />
      <div className="content">
        <div className="container">
          <ProfileCard />

          <div className="row">
            {/* Sidebar */}
            <InstructorSidebar />

            <div className="col-lg-9">
              {/* Metric Summary Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm bg-primary text-white h-100">
                    <div className="card-body p-3">
                      <span className="fs-12 text-white-50 text-uppercase fw-semibold">
                        Assigned Courses
                      </span>
                      <h3 className="fw-bold text-white mb-0 mt-1">
                        {courses.length}
                      </h3>
                      <span className="fs-11 text-white-50">Taught in Moodle</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card border-0 shadow-sm bg-success text-white h-100">
                    <div className="card-body p-3">
                      <span className="fs-12 text-white-50 text-uppercase fw-semibold">
                        Active Courses
                      </span>
                      <h3 className="fw-bold text-white mb-0 mt-1">
                        {courses.length}
                      </h3>
                      <span className="fs-11 text-white-50">Published & Live</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card border-0 shadow-sm bg-info text-white h-100">
                    <div className="card-body p-3">
                      <span className="fs-12 text-white-50 text-uppercase fw-semibold">
                        Total Enrolled
                      </span>
                      <h3 className="fw-bold text-white mb-0 mt-1">
                        {totalStudents}
                      </h3>
                      <span className="fs-11 text-white-50">Active Scholars</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card border-0 shadow-sm bg-dark text-white h-100">
                    <div className="card-body p-3">
                      <span className="fs-12 text-white-50 text-uppercase fw-semibold">
                        Faculty Quizzes
                      </span>
                      <h3 className="fw-bold text-white mb-0 mt-1">3</h3>
                      <span className="fs-11 text-white-50">Assessments Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Filters & Management Card */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                    <div>
                      <h5 className="fw-bold text-dark mb-1">Courses You Direct & Teach</h5>
                      <p className="text-muted small mb-0">
                        Manage academic modules, review enrolled students, and inspect performance
                      </p>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className={`btn btn-sm rounded-pill px-3 ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFilter('all')}
                      >
                        All Courses ({courses.length})
                      </button>
                      <button
                        className={`btn btn-sm rounded-pill px-3 ${filter === 'science' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFilter('science')}
                      >
                        Science & Tech
                      </button>
                      <button
                        className={`btn btn-sm rounded-pill px-3 ${filter === 'business' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFilter('business')}
                      >
                        Business Mgmt
                      </button>
                    </div>
                  </div>

                  {/* Course Table */}
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Course Name & Code</th>
                          <th>Faculty Department</th>
                          <th>Enrolled Scholars</th>
                          <th>Class Average</th>
                          <th>Curriculum Units</th>
                          <th className="text-end">Management Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.map((course) => (
                          <tr key={course.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div
                                  className="avatar avatar-lg rounded-3 bg-primary-subtle text-primary fw-bold me-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{ width: "48px", height: "48px" }}
                                >
                                  {course.shortname.substring(0, 3)}
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-0 fs-14 text-dark">
                                    {course.fullname}
                                  </h6>
                                  <span className="badge bg-light text-secondary border mt-1">
                                    {course.shortname} • {course.idnumber}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="text-muted small fw-medium">
                                {course.categoryName}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1">
                                <i className="isax isax-profile-2user text-primary fs-14" />
                                <span className="fw-bold text-dark fs-13">
                                  {course.enrolledusercount} Scholars
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-success-subtle text-success border border-success px-2 py-1 fs-12">
                                {course.averageGrade}
                              </span>
                            </td>
                            <td>
                              <span className="text-muted small">
                                {course.lessonsCount} Modules • {course.quizzesCount} Quiz
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="d-inline-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-info rounded-pill px-3"
                                  data-bs-toggle="modal"
                                  data-bs-target="#course_students_modal"
                                  onClick={() => handleOpenStudentsModal(course)}
                                >
                                  <i className="isax isax-user me-1" />
                                  Scholars
                                </button>
                                <Link
                                  to={`/course/course-watch?courseId=${course.id}`}
                                  className="btn btn-sm btn-primary rounded-pill px-3"
                                >
                                  <i className="isax isax-play me-1" />
                                  Classroom
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Teaching Resources Callout */}
              <div className="card border-0 bg-primary-subtle p-4 rounded-3 shadow-sm">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <span className="avatar avatar-xl rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
                      <i className="isax isax-teacher fs-28" />
                    </span>
                    <div>
                      <h5 className="fw-bold text-primary mb-1">Directorate of Academic Quality Assurance</h5>
                      <p className="text-muted small mb-0">
                        Course syllabi and grading rubrics are synchronized in accordance with OUT Senate regulations.
                      </p>
                    </div>
                  </div>
                  <Link to={all_routes.studentQuiz} className="btn btn-primary rounded-pill px-4">
                    Inspect Question Bank
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Course Enrolled Scholars Modal */}
      <div
        className="modal fade"
        id="course_students_modal"
        tabIndex={-1}
        aria-labelledby="courseStudentsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-primary text-white py-3">
              <div>
                <h5 className="modal-title text-white fw-bold" id="courseStudentsModalLabel">
                  Enrolled Scholars: {selectedCourse?.fullname} ({selectedCourse?.shortname})
                </h5>
                <span className="small text-white-50">
                  Moodle Course ID: {selectedCourse?.id} • Active Course Roster
                </span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body p-4">
              {studentsLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="text-muted small mt-2">Loading enrolled scholars from Moodle...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Scholar Name</th>
                        <th>Registration No.</th>
                        <th>Progress</th>
                        <th>Grade Standing</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseStudents.map((stu) => (
                        <tr key={stu.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="avatar avatar-sm avatar-rounded me-2 border">
                                <img src={stu.avatar} alt={stu.fullname} className="img-fluid" />
                              </span>
                              <div>
                                <h6 className="fs-13 fw-bold mb-0 text-dark">{stu.fullname}</h6>
                                <span className="text-muted small" style={{ fontSize: "11px" }}>
                                  {stu.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {stu.regNumber}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2" style={{ width: "120px" }}>
                              <div className="progress flex-grow-1" style={{ height: "6px" }}>
                                <div
                                  className="progress-bar bg-success"
                                  style={{ width: `${stu.progressPercent}%` }}
                                />
                              </div>
                              <span className="fs-12 fw-bold text-dark">{stu.progressPercent}%</span>
                            </div>
                          </td>
                          <td>
                            <span className="fw-bold text-success fs-13">{stu.grade}</span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                stu.status === 'Completed'
                                  ? 'bg-success-subtle text-success border border-success'
                                  : 'bg-primary-subtle text-primary border border-primary'
                              } px-2 py-1`}
                            >
                              {stu.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer bg-light py-2">
              <button type="button" className="btn btn-secondary rounded-pill btn-sm px-4" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorCourse;
