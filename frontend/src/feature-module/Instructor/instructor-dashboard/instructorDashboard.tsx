import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import ReactApexChart from "react-apexcharts";
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import {
  instructorService,
  InstructorCourseItem,
  InstructorStats,
  RecentSubmissionItem,
} from '../../../core/api/instructorService';

const InstructorDashboard: React.FC = () => {
  const [courses, setCourses] = useState<InstructorCourseItem[]>(instructorService.getFallbackCourses());
  const [stats, setStats] = useState<InstructorStats>({
    totalCourses: 3,
    activeCourses: 3,
    completedCourses: 2,
    totalStudents: 6,
    pendingSubmissions: 2,
    averageRating: '4.9 / 5.0',
    totalQuizzes: 3,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmissionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [courseList, statsData, submissionsData] = await Promise.all([
          instructorService.getInstructorCourses(),
          instructorService.getInstructorStats(),
          instructorService.getRecentSubmissions(),
        ]);
        if (isMounted) {
          setCourses(courseList);
          setStats(statsData);
          setRecentSubmissions(submissionsData);
        }
      } catch (err) {
        console.error("Failed to load instructor dashboard data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  const performanceChart = {
    chart: {
      height: 290,
      type: 'bar' as const,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '45%',
      },
    },
    colors: ['#0d3b66', '#028090'],
    series: [
      {
        name: 'Average Quiz Score (%)',
        data: [85, 88.5, 96],
      },
      {
        name: 'Student Completion Rate (%)',
        data: [100, 75, 100],
      },
    ],
    xaxis: {
      categories: ['CS101 (Python)', 'CS202 (Cloud)', 'BBA301 (Finance)'],
      labels: {
        style: {
          colors: '#4D4D4D',
          fontSize: '12px',
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (val: number) => `${val}%`,
        style: { colors: '#4D4D4D', fontSize: '12px' },
      },
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 4,
    },
    dataLabels: { enabled: false },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
    },
  };

  return (
    <>
      <Breadcrumb title="Instructor Teaching Dashboard" />
      <div className="content">
        <div className="container">
          <ProfileCard />

          <div className="row">
            {/* Instructor Sidebar */}
            <InstructorSidebar />

            <div className="col-lg-9">
              {/* Teaching Metric KPI Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-6 col-xl-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-primary-subtle text-primary me-3 flex-shrink-0 rounded-3 p-3">
                          <i className="isax isax-book-1 fs-24" />
                        </span>
                        <div>
                          <span className="text-muted small d-block">Directed Courses</span>
                          <h4 className="fs-22 fw-bold text-dark mt-1 mb-0">
                            {stats.totalCourses} Courses
                          </h4>
                          <span className="text-success small fw-semibold">
                            <i className="isax isax-tick-circle me-1" />
                            All Published in Moodle
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-info-subtle text-info me-3 flex-shrink-0 rounded-3 p-3">
                          <i className="isax isax-profile-2user fs-24" />
                        </span>
                        <div>
                          <span className="text-muted small d-block">Total Enrolled Students</span>
                          <h4 className="fs-22 fw-bold text-dark mt-1 mb-0">
                            {stats.totalStudents} Active Scholars
                          </h4>
                          <span className="text-info small fw-semibold">
                            Across 3 Faculty Departments
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-warning-subtle text-warning me-3 flex-shrink-0 rounded-3 p-3">
                          <i className="isax isax-task-square fs-24" />
                        </span>
                        <div>
                          <span className="text-muted small d-block">Pending Grade Reviews</span>
                          <h4 className="fs-22 fw-bold text-dark mt-1 mb-0">
                            {stats.pendingSubmissions} Submissions
                          </h4>
                          <span className="text-warning small fw-semibold">
                            Requires Rubric Evaluation
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-success-subtle text-success me-3 flex-shrink-0 rounded-3 p-3">
                          <i className="isax isax-ranking fs-24" />
                        </span>
                        <div>
                          <span className="text-muted small d-block">Average Class Mark</span>
                          <h4 className="fs-22 fw-bold text-dark mt-1 mb-0">89.8% (Grade A)</h4>
                          <span className="text-success small fw-semibold">
                            High Academic Standing
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-secondary-subtle text-secondary me-3 flex-shrink-0 rounded-3 p-3">
                          <i className="isax isax-star1 fs-24" />
                        </span>
                        <div>
                          <span className="text-muted small d-block">Instructor Rating</span>
                          <h4 className="fs-22 fw-bold text-dark mt-1 mb-0">{stats.averageRating}</h4>
                          <span className="text-muted small">Dean's Teaching Commendation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-dark-subtle text-dark me-3 flex-shrink-0 rounded-3 p-3">
                          <i className="isax isax-award fs-24" />
                        </span>
                        <div>
                          <span className="text-muted small d-block">Conferred Certificates</span>
                          <h4 className="fs-22 fw-bold text-dark mt-1 mb-0">2 Conferred</h4>
                          <span className="text-muted small">OUT Academic Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
                    <div>
                      <h5 className="fw-bold text-dark mb-1">Course Performance & Completion Analytics</h5>
                      <p className="text-muted small mb-0">
                        Average assessment scores and curriculum completion rates across assigned courses
                      </p>
                    </div>
                    <span className="badge bg-light text-dark border px-3 py-2">
                      <i className="isax isax-chart-2 me-1 text-primary" />
                      Moodle Analytics Engine
                    </span>
                  </div>
                  <ReactApexChart
                    options={performanceChart}
                    series={performanceChart.series}
                    type="bar"
                    height={290}
                  />
                </div>
              </div>

              {/* Courses Taught by Instructor */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h5 className="fw-bold text-dark mb-1">Assigned Courses & Enrolment Status</h5>
                      <p className="text-muted small mb-0">
                        Official academic courses directed by Dr. Amina Kilindo
                      </p>
                    </div>
                    <Link to={all_routes.instructorCourse} className="btn btn-outline-primary btn-sm rounded-pill">
                      View All Courses
                    </Link>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Course</th>
                          <th>Faculty / Code</th>
                          <th>Enrolled Scholars</th>
                          <th>Average Grade</th>
                          <th>Status</th>
                          <th className="text-end">Classroom Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => (
                          <tr key={course.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div
                                  className="avatar avatar-md rounded-2 bg-primary-subtle text-primary fw-bold me-3 d-flex align-items-center justify-content-center"
                                  style={{ width: "42px", height: "42px" }}
                                >
                                  {course.shortname.substring(0, 3)}
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-0 fs-14 text-dark">
                                    {course.fullname}
                                  </h6>
                                  <span className="text-muted small">
                                    {course.lessonsCount} Modules • {course.quizzesCount} Assessment
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-secondary border">
                                {course.shortname}
                              </span>
                              <span className="d-block text-muted small mt-1" style={{ fontSize: "11px" }}>
                                {course.categoryName}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1">
                                <i className="isax isax-profile-2user text-muted fs-14" />
                                <span className="fw-semibold text-dark fs-13">
                                  {course.enrolledusercount} Students
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="fw-bold text-success fs-13">
                                {course.averageGrade}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-success-subtle text-success border border-success px-2 py-1">
                                {course.status}
                              </span>
                            </td>
                            <td className="text-end">
                              <Link
                                to={`/course/course-watch?courseId=${course.id}`}
                                className="btn btn-sm btn-primary rounded-pill px-3"
                              >
                                Open Classroom
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Recent Student Submissions & Grading Queue */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h5 className="fw-bold text-dark mb-1">Recent Student Submissions & Grading Oversight</h5>
                      <p className="text-muted small mb-0">
                        Assessment attempts and lab deliverables submitted for your review
                      </p>
                    </div>
                    <span className="badge bg-warning-subtle text-warning border px-3 py-1">
                      {stats.pendingSubmissions} Awaiting Review
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Student Scholar</th>
                          <th>Course</th>
                          <th>Assessment Activity</th>
                          <th>Score / Mark</th>
                          <th>Status</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSubmissions.map((sub) => (
                          <tr key={sub.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="avatar avatar-sm avatar-rounded me-2 border">
                                  <ImageWithBasePath src={sub.studentAvatar} alt={sub.studentName} />
                                </span>
                                <div>
                                  <h6 className="fs-13 fw-bold mb-0 text-dark">{sub.studentName}</h6>
                                  <span className="text-muted small" style={{ fontSize: "11px" }}>
                                    {sub.id}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {sub.courseCode}
                              </span>
                            </td>
                            <td>
                              <span className="fw-medium text-dark fs-13 d-block">
                                {sub.assessmentName}
                              </span>
                              <span className="text-muted small" style={{ fontSize: "11px" }}>
                                {sub.feedback}
                              </span>
                            </td>
                            <td>
                              {sub.status === 'Graded' ? (
                                <span className="fw-bold text-success fs-13">
                                  {sub.score}%
                                </span>
                              ) : (
                                <span className="text-muted small fst-italic">
                                  Unmarked
                                </span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  sub.status === 'Graded'
                                    ? 'bg-success-subtle text-success border border-success'
                                    : 'bg-warning-subtle text-warning border border-warning'
                                } px-2 py-1`}
                              >
                                {sub.status}
                              </span>
                            </td>
                            <td className="text-muted small">{sub.submittedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default InstructorDashboard;
