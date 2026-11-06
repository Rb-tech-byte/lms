import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/authContext';
import { courseService, EnrolledCourse, getMoodleUserId } from '../../../core/api/courseService';
import { quizService, MoodleQuiz, QuizAttempt } from '../../../core/api/quizService';
import { certificateService, StudentCertificate } from '../../../core/api/certificateService';
import {
  studentService,
  LearnerXpData,
  LeaderboardEntry,
  LiveSession,
  CompletionTimelineCourse,
} from '../../../core/api/studentService';
import { all_routes } from '../../router/all_routes';
import CorporateStudentSidebar from '../common/corporateStudentSidebar';
import CorporateStudentHeader from '../common/corporateStudentHeader';
import { useStudentIdentity } from '../common/useStudentIdentity';
import '../common/studentPortal.css';

interface AcademicLectureItem {
  id: number;
  dateBadge: string;
  monthBadge: string;
  title: string;
  courseCode: string;
  timeString: string;
  duration: string;
  lecturerName: string;
  roomName: string;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const student = useStudentIdentity();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<string>(urlTab || 'dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Enrolled Courses State
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);

  // Quizzes State
  const [quizzes, setQuizzes] = useState<(MoodleQuiz & { courseCode: string; latestAttempt?: QuizAttempt | null })[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState<boolean>(false);

  // Certificates State
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState<boolean>(false);

  // IEMT Gamification (Level Up! XP), Completion Timeline & Live Webinars
  const [learnerXp, setLearnerXp] = useState<LearnerXpData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [completionTimeline, setCompletionTimeline] = useState<CompletionTimelineCourse[]>([]);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);

  // Course Filter
  const [courseFilter, setCourseFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Chart view metric
  const [chartMetric, setChartMetric] = useState<'lessons' | 'hours'>('lessons');

  // Interactive Modals
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [selectedLecture, setSelectedLecture] = useState<AcademicLectureItem | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<StudentCertificate | null>(null);

  // Pure student persona: Always represents the enrolled scholar Baraka Mkwawa
  const studentName = student.displayName;
  const regNumber = student.regNumber;
  const studentEmail = student.email;
  const facultyName = student.faculty;

  // Academic Lectures
  const upcomingLectures: AcademicLectureItem[] = [
    {
      id: 301,
      dateBadge: '06',
      monthBadge: 'NOV',
      title: 'BBA301: Financial Strategy & Capital Markets Review',
      courseCode: 'BBA301',
      timeString: '04:00 PM EAT',
      duration: '60 min',
      lecturerName: 'Dr. M. Mwamwaja',
      roomName: 'Virtual Lecture Theatre 1',
    },
    {
      id: 302,
      dateBadge: '09',
      monthBadge: 'NOV',
      title: 'CS101: Algorithmic Complexity & Graph Traversal Seminar',
      courseCode: 'CS101',
      timeString: '02:30 PM EAT',
      duration: '90 min',
      lecturerName: 'Prof. K. Lyimo',
      roomName: 'Main Campus ICT Lab',
    },
    {
      id: 303,
      dateBadge: '14',
      monthBadge: 'NOV',
      title: 'CS202: Cloud Native Microservices Architecture Workshop',
      courseCode: 'CS202',
      timeString: '10:00 AM EAT',
      duration: '75 min',
      lecturerName: 'Eng. J. Kibona',
      roomName: 'Online WebRTC Suite',
    },
  ];

  // Sync tab with URL
  useEffect(() => {
    if (urlTab) {
      setActiveView(urlTab);
    }
  }, [urlTab]);

  const handleSelectView = (view: string) => {
    setActiveView(view);
    if (view === 'dashboard') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: view });
    }
  };

  // Fetch enrolled courses from Moodle Web Services
  useEffect(() => {
    let isMounted = true;
    const fetchEnrolled = async () => {
      setLoadingCourses(true);
      try {
        const uid = getMoodleUserId(user);
        const data = await courseService.getUserEnrolledCourses(uid);
        if (isMounted) {
          setCourses(data);
        }
      } catch (err: any) {
        console.warn('Failed to load courses:', err);
      } finally {
        if (isMounted) {
          setLoadingCourses(false);
        }
      }
    };

    fetchEnrolled();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Fetch quizzes and certificates from Moodle Web Services
  useEffect(() => {
    let isMounted = true;
    const loadAcademicData = async () => {
      try {
        setLoadingQuizzes(true);
        const uid = getMoodleUserId(user);
        const moodleQuizzes = await quizService.getQuizzesByCourses([2, 3, 4]);
        const courseCodes: Record<number, string> = { 2: 'CS101', 3: 'CS202', 4: 'BBA301' };

        const mappedQuizzes = await Promise.all(
          moodleQuizzes.map(async (q) => {
            const attempts = await quizService.getUserAttempts(q.id, uid);
            return {
              ...q,
              courseCode: courseCodes[q.course] || 'OUT',
              latestAttempt: attempts[0] || null,
            };
          })
        );
        if (isMounted) {
          setQuizzes(mappedQuizzes);
        }
      } catch (e) {
        console.warn('Failed to load quizzes', e);
      } finally {
        if (isMounted) setLoadingQuizzes(false);
      }

      try {
        setLoadingCertificates(true);
        const uid = getMoodleUserId(user);
        const certs = await certificateService.getUserCertificates(uid, studentName, regNumber);
        if (isMounted) {
          setCertificates(certs);
        }
      } catch (e) {
        console.warn('Failed to load certificates', e);
      } finally {
        if (isMounted) setLoadingCertificates(false);
      }

      // Fetch Gamification (Level Up! XP), Live Sessions, Leaderboard & Timeline
      try {
        const uid = getMoodleUserId(user) || 3;
        const [xpData, boardData, sessionsData, timelineData] = await Promise.all([
          studentService.getLearnerXp(uid),
          studentService.getLeaderboard(10),
          studentService.getLiveSessions(),
          studentService.getCompletionTimeline(uid),
        ]);
        if (isMounted) {
          if (xpData) setLearnerXp(xpData);
          if (boardData && boardData.length > 0) setLeaderboard(boardData);
          if (sessionsData && sessionsData.length > 0) setLiveSessions(sessionsData);
          if (timelineData && timelineData.length > 0) setCompletionTimeline(timelineData);
        }
      } catch (e) {
        console.warn('Failed to load IEMT gamification or timeline:', e);
      }
    };

    loadAcademicData();
    return () => {
      isMounted = false;
    };
  }, [user, studentName, regNumber]);

  // Calculations
  const inProgressCourses = courses.filter((c) => (c.progress ?? 0) < 100);
  const completedCourses = courses.filter((c) => (c.progress ?? 0) >= 100);

  const currentFocusCourse =
    courses.find((c) => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100) ||
    courses[0] || {
      id: 4,
      shortname: 'BBA301',
      fullname: 'Financial Management & Strategic Planning',
      progress: 0,
      summary: 'Comprehensive corporate finance, capital budgeting, and asset pricing models.',
    };

  // Overall progress percentage
  const overallProgress = courses.length
    ? Math.round(courses.reduce((acc, c) => acc + (c.progress ?? 0), 0) / courses.length)
    : 0;

  // Filter and paginate courses for Enrolled Courses tab (6 per page)
  const [coursePage, setCoursePage] = useState<number>(1);
  const COURSE_PAGE_SIZE = 6;

  useEffect(() => {
    setCoursePage(1);
  }, [courseFilter, searchQuery]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const p = c.progress ?? 0;
      const matchesFilter =
        courseFilter === 'all' ||
        (courseFilter === 'active' && p < 100) ||
        (courseFilter === 'completed' && p >= 100);
      const matchesSearch =
        searchQuery === '' ||
        c.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.shortname.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [courses, courseFilter, searchQuery]);

  const totalCourseItems = filteredCourses.length;
  const totalCoursePages = Math.ceil(totalCourseItems / COURSE_PAGE_SIZE) || 1;

  const paginatedStudentCourses = useMemo(() => {
    const start = (coursePage - 1) * COURSE_PAGE_SIZE;
    return filteredCourses.slice(start, start + COURSE_PAGE_SIZE);
  }, [filteredCourses, coursePage]);

  // Weekly study activity chart data
  const weeklyData = [
    { day: 'Mon', lessons: 2, hours: 2.5, heightPct: 40 },
    { day: 'Tue', lessons: 4, hours: 4.0, heightPct: 75 },
    { day: 'Wed', lessons: 3, hours: 3.2, heightPct: 60 },
    { day: 'Thu', lessons: 5, hours: 5.0, heightPct: 90 },
    { day: 'Fri', lessons: 3, hours: 3.5, heightPct: 65 },
    { day: 'Sat', lessons: 2, hours: 2.0, heightPct: 45 },
    { day: 'Sun', lessons: 4, hours: 4.2, heightPct: 80 },
  ];

  return (
    <div className={`sp-shell ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
      {/* 1. FIXED DARK SIDEBAR (width: 240px) */}
      <CorporateStudentSidebar
        activeView={activeView}
        onSelectView={handleSelectView}
      />

      {/* 2. MAIN COLUMN NEXT TO SIDEBAR */}
      <div className="sp-main">
        {/* SLIM STICKY WHITE TOPBAR */}
        <CorporateStudentHeader
          pageTitle={
            activeView === 'dashboard'
              ? 'Dashboard'
              : activeView.charAt(0).toUpperCase() + activeView.slice(1)
          }
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectTab={handleSelectView}
          notifications={[
            {
              id: 1,
              title: 'SARIS Registration Verified for 2026/2027',
              time: '10m ago',
              icon: 'feather-check-circle',
              tone: 'green',
            },
            {
              id: 2,
              title: 'Upcoming: BBA301 Financial Strategy Review',
              time: '1h ago',
              icon: 'feather-calendar',
              tone: 'sky',
            },
            {
              id: 3,
              title: 'CS202 Continuous Assessment deadline in 4 days',
              time: '3h ago',
              icon: 'feather-alert-circle',
              tone: 'amber',
            },
          ]}
        />

        {/* SCROLLABLE CONTENT BODY */}
        <main className="sp-content">
          {/* VIEW: DASHBOARD */}
          {activeView === 'dashboard' && (
            <>
              {/* (A) TOP TCU / ACADEMIC COMPLIANCE BANNER */}
              <div className="sp-notice">
                <div className="sp-notice-icon">
                  <i className="ti ti-shield-check fs-24" />
                </div>
                <div className="sp-notice-body">
                  <div className="sp-notice-title">
                    <span>The Open University of Tanzania • Academic Compliance Engine Active</span>
                    <span className="sp-chip">AUDIT TRACKING</span>
                  </div>
                  <div className="sp-notice-text">
                    SARIS Continuous Assessment &amp; Moodle Web Services automated verification active for Academic Year 2026/2027.
                  </div>
                </div>
                <button
                  type="button"
                  className="sp-btn-cyan"
                  onClick={() => setShowCalendarModal(true)}
                >
                  <i className="ti ti-calendar" /> Academic Calendar
                </button>
              </div>

              {/* (B) HERO WELCOME BANNER WITH RADIAL PROGRESS DIAL */}
              <div className="sp-hero">
                <div>
                  <span className="sp-hero-badge">
                    <i className="ti ti-bookmark" /> OUT LEARNER HUB
                  </span>
                  <h2>Welcome Back, {student.firstName}!</h2>
                  <p>
                    You have {inProgressCourses.length || 2} courses in progress and 3 upcoming academic milestones this semester.
                  </p>
                  <div className="sp-hero-actions">
                    <Link
                      to={`/course/course-watch?courseId=${currentFocusCourse?.id || 2}`}
                      className="sp-btn-cyan"
                    >
                      <i className="ti ti-player-play" /> Continue Learning
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleSelectView('courses')}
                      className="sp-btn-ghost"
                    >
                      <i className="ti ti-layout-grid" /> Enrolled Courses
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectView('certificates')}
                      className="sp-btn-ghost"
                    >
                      <i className="ti ti-award" /> Certificates
                    </button>
                  </div>
                </div>

                <div className="sp-hero-progress">
                  <div className="sp-ring">
                    <svg width="96" height="96" viewBox="0 0 96 96">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="rgba(255, 255, 255, 0.12)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#F4ED2D"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * (overallProgress || 25)) / 100}
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <div className="sp-ring-value">
                      <span>{overallProgress || 25}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="sp-hero-progress-title">Overall Degree Progress</div>
                    <div className="sp-hero-progress-sub">Based on Continuous Assessment</div>
                    <div className="sp-hero-progress-meta">
                      <i className="ti ti-circle-check" /> SARIS Verified
                    </div>
                  </div>
                </div>
              </div>

              {/* (C) 4 METRIC STAT CARDS */}
              <div className="row g-3 mb-4">
                <div className="col-xl-3 col-sm-6">
                  <div className="sp-stat">
                    <div
                      className="sp-stat-icon"
                      style={{ background: '#061838', color: '#fff' }}
                    >
                      <i className="ti ti-book-2 fs-22" />
                    </div>
                    <div>
                      <div className="sp-stat-label">ENROLLED</div>
                      <div className="sp-stat-value">{courses.length || 3}</div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-sm-6">
                  <div className="sp-stat">
                    <div
                      className="sp-stat-icon"
                      style={{ background: '#E8F4FC', color: '#013BA6' }}
                    >
                      <i className="ti ti-clock-hour-4 fs-22" />
                    </div>
                    <div>
                      <div className="sp-stat-label">IN PROGRESS</div>
                      <div className="sp-stat-value">
                        {courses.filter((c) => (c.progress ?? 0) < 100).length || 2}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-sm-6">
                  <div className="sp-stat">
                    <div
                      className="sp-stat-icon"
                      style={{ background: '#F0F9FF', color: '#228DDD' }}
                    >
                      <i className="ti ti-circle-check fs-22" />
                    </div>
                    <div>
                      <div className="sp-stat-label">COMPLETED</div>
                      <div className="sp-stat-value">
                        {courses.filter((c) => (c.progress ?? 0) >= 100).length || 1}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-sm-6">
                  <div className="sp-stat">
                    <div
                      className="sp-stat-icon"
                      style={{ background: 'rgba(244, 237, 45, 0.22)', color: '#061838' }}
                    >
                      <i className="ti ti-award fs-22" />
                    </div>
                    <div>
                      <div className="sp-stat-label">CERTIFICATES</div>
                      <div className="sp-stat-value">{certificates.length || 1}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* LEVEL UP! XP GAMIFICATION & SCHOLAR RANKING */}
              <div
                className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #061838 0%, #013BA6 100%)',
                  color: '#fff',
                }}
              >
                <div className="card-body p-4">
                  <div className="row align-items-center g-3">
                    <div className="col-lg-8">
                      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                        <span
                          className="badge rounded-pill px-3 py-1 fw-bold"
                          style={{ background: '#F4ED2D', color: '#061838', fontSize: '0.74rem' }}
                        >
                          <i className="ti ti-flame me-1" /> LEVEL {learnerXp?.level || 3}
                        </span>
                        <span
                          className="badge bg-white bg-opacity-25 text-white rounded-pill px-3 py-1 fw-semibold"
                          style={{ fontSize: '0.74rem' }}
                        >
                          {learnerXp?.levelTitle || 'Proficient Scholar'}
                        </span>
                        <span
                          className="badge border rounded-pill px-2.5 py-1"
                          style={{ fontSize: '0.74rem', background: 'rgba(34, 141, 221, 0.2)', color: '#fff', borderColor: '#228DDD' }}
                        >
                          <i className="ti ti-trophy me-1" /> Cohort Rank #{learnerXp?.rank || 5}
                        </span>
                        <span
                          className="badge border rounded-pill px-2.5 py-1"
                          style={{ fontSize: '0.74rem', background: 'rgba(244, 237, 45, 0.2)', color: '#F4ED2D', borderColor: '#F4ED2D' }}
                        >
                          <i className="ti ti-medal me-1" /> {learnerXp?.badgesEarned || 5} Digital Badges
                        </span>
                      </div>

                      <h4 className="fw-bold text-white mb-1" style={{ fontSize: '1.25rem' }}>
                        Scholar Engagement &amp; Mastery Progression
                      </h4>
                      <p className="mb-3 text-light text-opacity-75 small">
                        Earn Experience Points (XP) through active reading, quiz completion, interactive H5P labs, and faculty webinar attendance.
                      </p>

                      <div>
                        <div
                          className="d-flex align-items-center justify-content-between mb-1"
                          style={{ fontSize: '0.78rem' }}
                        >
                          <span className="text-light text-opacity-75">
                            Level {learnerXp?.level || 3} ({learnerXp?.totalXp?.toLocaleString() || '6,750'} XP)
                          </span>
                          <span className="fw-bold" style={{ color: '#F4ED2D' }}>
                            {learnerXp?.percentage || 70}% to Level {(learnerXp?.level || 3) + 1} (
                            {learnerXp?.nextLevelTarget?.toLocaleString() || '7,500'} XP)
                          </span>
                        </div>
                        <div
                          className="progress"
                          style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 999 }}
                        >
                          <div
                            className="progress-bar"
                            style={{
                              width: `${learnerXp?.percentage || 70}%`,
                              background: 'linear-gradient(90deg, #228DDD 0%, #F4ED2D 100%)',
                              borderRadius: 999,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4 text-lg-end">
                      <div className="d-inline-flex flex-column align-items-lg-end gap-2 w-100">
                        <button
                          type="button"
                          onClick={() => setShowLeaderboardModal(true)}
                          className="btn rounded-pill px-4 py-2 fw-bold shadow-sm d-inline-flex align-items-center justify-content-center gap-2"
                          style={{ background: '#F4ED2D', color: '#061838', border: 'none', fontSize: '0.84rem' }}
                        >
                          <i className="ti ti-chart-arrows" /> View Cohort Leaderboard
                        </button>
                        <span className="small text-light text-opacity-75" style={{ fontSize: '0.75rem' }}>
                          Top 5 scholars earn IEMT Honours Micro-Credentials
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* (D) CONTINUE LEARNING COURSE CARDS */}
              <div className="mb-4">
                <div className="sp-section-head">
                  <h3 className="sp-section-title">
                    <i className="ti ti-player-play text-primary fs-18" /> Continue Learning
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleSelectView('courses')}
                    className="sp-link"
                  >
                    View All Courses <i className="ti ti-chevron-right" />
                  </button>
                </div>

                <div className="row g-3">
                  {(courses.length > 0
                    ? courses.slice(0, 3)
                    : [
                        {
                          id: 2,
                          shortname: 'CS202',
                          fullname: 'Cloud Computing & Distributed Systems',
                          categoryname: 'Faculty of Science & Technology',
                          progress: 0,
                        },
                        {
                          id: 3,
                          shortname: 'CS101',
                          fullname: 'Introduction to Algorithms & Data Structures',
                          categoryname: 'Faculty of Science & Technology',
                          progress: 0,
                        },
                        {
                          id: 4,
                          shortname: 'BBA301',
                          fullname: 'Financial Management & Strategic Planning',
                          categoryname: 'Faculty of Business Management',
                          progress: 100,
                        },
                      ]
                  ).map((course: any, idx: number) => {
                    const isCompleted = (course.progress ?? 0) >= 100;
                    const courseCode = course.shortname || (idx === 0 ? 'CS202' : idx === 1 ? 'CS101' : 'BBA301');
                    const courseSlug = courseCode.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    const courseImg = course.courseImage || course.courseimage || course.image || `/assets/img/course/thumbnails/course-${course.id || (idx === 0 ? 3 : idx === 1 ? 2 : 4)}-${courseSlug}.svg`;
                    const instructor =
                      idx === 0
                        ? 'Eng. J. Kibona'
                        : idx === 1
                        ? 'Prof. K. Lyimo'
                        : 'Dr. M. Mwamwaja';
                    const category =
                      course.categoryname ||
                      (idx === 2
                        ? 'Faculty of Business Management'
                        : 'Faculty of Science & Technology');

                    return (
                      <div key={course.id || idx} className="col-md-6 col-lg-4">
                        <div className="sp-course">
                          <div className="sp-course-media">
                            <img
                              src={courseImg}
                              alt={course.fullname}
                              onError={(e: any) => {
                                const ownFallback = `/assets/img/course/thumbnails/course-${course.id || (idx === 0 ? 3 : idx === 1 ? 2 : 4)}-${courseSlug}.svg`;
                                if (e.target.src !== ownFallback && !e.target.src.endsWith(ownFallback)) {
                                  e.target.src = ownFallback;
                                }
                              }}
                            />
                            <span className="sp-course-tag">
                              {course.shortname || (idx === 0 ? 'CS202' : idx === 1 ? 'CS101' : 'BBA301')}
                            </span>
                            <span
                              className="sp-course-status"
                              style={{
                                background: isCompleted ? '#013BA6' : '#F4ED2D',
                                color: isCompleted ? '#FFFFFF' : '#061838',
                              }}
                            >
                              {isCompleted ? 'Completed' : 'In Progress'}
                            </span>
                          </div>

                          <div className="sp-course-body">
                            <div className="sp-course-meta">
                              <span>{category}</span>
                              <span>•</span>
                              <span>{instructor}</span>
                            </div>

                            <h4
                              className="sp-course-title"
                              title={course.fullname}
                            >
                              {course.fullname?.replace(/&amp;/g, '&')}
                            </h4>

                            <div className="sp-progress">
                              <span
                                style={{
                                  width: `${Math.max(5, course.progress ?? 0)}%`,
                                  background: isCompleted
                                    ? 'linear-gradient(90deg, #228DDD, #013BA6)'
                                    : 'linear-gradient(90deg, #228DDD, #F4ED2D)',
                                }}
                              />
                            </div>

                            <div className="sp-course-foot">
                              <small>
                                {Math.round(course.progress ?? 0)}% Complete
                              </small>
                              {isCompleted ? (
                                <button
                                  type="button"
                                  onClick={() => handleSelectView('certificates')}
                                  className="sp-btn-green"
                                  style={{
                                    background: 'linear-gradient(135deg, #013BA6, #228DDD)',
                                  }}
                                >
                                  <span>Certificate</span>
                                  <i className="ti ti-award" />
                                </button>
                              ) : (
                                <Link
                                  to={`/course/course-watch?courseId=${course.id}`}
                                  className="sp-btn-green"
                                >
                                  <span>Resume</span>
                                  <i className="ti ti-player-play" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTIVITY COMPLETION PROGRESS BAR & MILESTONES */}
              {completionTimeline.length > 0 && (
                <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white p-3 border">
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <i className="ti ti-progress-check text-success fs-18" />
                      <h4 className="fw-bold text-dark mb-0 fs-15">
                        Modular Completion Progress &amp; Study Milestones
                      </h4>
                    </div>
                    <span
                      className="badge bg-success-subtle text-success border border-success rounded-pill px-3 py-1 fw-bold"
                      style={{ fontSize: '0.74rem' }}
                    >
                      Completion Progress Active
                    </span>
                  </div>

                  <div className="row g-3">
                    {completionTimeline.slice(0, 2).map((ct) => (
                      <div className="col-md-6" key={ct.courseId}>
                        <div className="p-3 rounded-3 bg-light border">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-bold text-dark small text-truncate" style={{ maxWidth: '70%' }}>
                              {ct.courseCode} — {ct.courseName}
                            </span>
                            <span className="fw-bold text-primary small">
                              {ct.completedActivities} / {ct.totalActivities} Completed ({ct.progressPercentage}%)
                            </span>
                          </div>

                          <div className="progress mb-2" style={{ height: 6, borderRadius: 999 }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${ct.progressPercentage}%`, borderRadius: 999 }}
                            />
                          </div>

                          <div className="d-flex align-items-center gap-1.5 flex-wrap" style={{ fontSize: '0.72rem' }}>
                            {ct.activities.slice(0, 5).map((act) => (
                              <span
                                key={act.cmId}
                                className={`badge rounded-pill px-2 py-0.5 ${
                                  act.completed
                                    ? 'bg-success text-white'
                                    : 'bg-secondary bg-opacity-25 text-dark'
                                }`}
                                title={`${act.sectionName}: ${act.status}`}
                              >
                                <i className={`ti ${act.completed ? 'ti-check' : 'ti-clock'} me-1`} />
                                Unit {act.section}
                              </span>
                            ))}
                            {ct.activities.length > 5 && (
                              <span className="text-muted small">+{ct.activities.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. LOWER TWO-COLUMN SECTION */}
              <div className="row g-4 mb-4">
                {/* LEFT: WEEKLY STUDY ACTIVITY (7-DAY BAR CHART) */}
                <div className="col-lg-7">
                  <div className="sp-panel">
                    <div className="sp-panel-head">
                      <div className="d-flex align-items-center gap-2">
                        <i className="ti ti-chart-bar text-primary fs-18" />
                        <h4 className="fw-bold text-dark mb-0 fs-15">
                          Weekly Study &amp; Learning Activity
                        </h4>
                      </div>

                      <button
                        type="button"
                        className="sp-pill-toggle"
                        onClick={() =>
                          setChartMetric(chartMetric === 'lessons' ? 'hours' : 'lessons')
                        }
                      >
                        {chartMetric === 'lessons' ? 'Lessons Completed' : 'Hours Spent'}
                      </button>
                    </div>

                    <div className="sp-chart">
                      {weeklyData.map((d) => {
                        const val =
                          chartMetric === 'lessons' ? `${d.lessons} lessons` : `${d.hours} hrs`;
                        return (
                          <div key={d.day} className="sp-chart-col" title={`${d.day}: ${val}`}>
                            <div className="sp-chart-track">
                              <div
                                className="sp-chart-bar"
                                style={{ height: `${d.heightPct}%` }}
                              />
                            </div>
                            <span>{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RIGHT: UPCOMING ACADEMIC LECTURES & DEGREE CERTIFICATION */}
                <div className="col-lg-5">
                  <div className="sp-panel d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <i className="ti ti-video text-primary fs-18" />
                          <h4 className="fw-bold text-dark mb-0 fs-15">
                            Upcoming Academic Lectures
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowCalendarModal(true)}
                          className="sp-link"
                          style={{ fontSize: '12px' }}
                        >
                          View all
                        </button>
                      </div>

                      {liveSessions.length > 0 ? (
                        liveSessions.slice(0, 3).map((sess) => {
                          const dateObj = new Date(sess.scheduledTimestamp * 1000);
                          const dayNum = dateObj.getDate().toString().padStart(2, '0');
                          const monthStr = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                          return (
                            <div className="sp-event" key={sess.id}>
                              <div className="sp-event-date">
                                <b>{dayNum}</b>
                                <small>{monthStr}</small>
                              </div>
                              <div className="sp-event-body">
                                <div className="sp-event-title" title={sess.title}>
                                  {sess.courseCode}: {sess.title}
                                </div>
                                <div className="sp-event-time">
                                  <i className="ti ti-clock fs-11" />
                                  <span>{sess.scheduledTimeFormatted} • {sess.durationMinutes} min</span>
                                  {sess.status === 'LIVE_NOW' && (
                                    <span className="badge bg-danger text-white rounded-pill ms-1 px-1.5 py-0.2" style={{ fontSize: '0.65rem' }}>
                                      LIVE
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Link
                                to={sess.meetingUrl}
                                className={sess.status === 'LIVE_NOW' ? 'sp-btn-green' : 'sp-btn-blue'}
                              >
                                <span>{sess.status === 'LIVE_NOW' ? 'Join Now' : 'Join'}</span>
                                <i className="ti ti-video" />
                              </Link>
                            </div>
                          );
                        })
                      ) : (
                        upcomingLectures.map((item) => (
                          <div className="sp-event" key={item.id}>
                            <div className="sp-event-date">
                              <b>{item.dateBadge}</b>
                              <small>{item.monthBadge}</small>
                            </div>
                            <div className="sp-event-body">
                              <div className="sp-event-title" title={item.title}>
                                {item.title}
                              </div>
                              <div className="sp-event-time">
                                <i className="ti ti-clock fs-11" />
                                <span>{item.timeString} • {item.duration}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedLecture(item)}
                              className="sp-btn-blue"
                            >
                              <span>Join</span>
                              <i className="ti ti-external-link" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Degree & Certification Card */}
                    <div className="sp-callout mt-2">
                      <div className="sp-callout-icon">
                        <i className="ti ti-award" />
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="sp-callout-title">
                          OUT Degree &amp; Certification
                        </div>
                        <div style={{ fontSize: '11px', color: '#013BA6' }}>
                          Earn your verified university credentials upon 100% course completion.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectView('certificates')}
                        className="sp-btn-blue"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* VIEW: MY PROFILE                                               */}
          {/* ============================================================== */}
          {activeView === 'profile' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <img
                  src="/assets/img/user/user-02.jpg"
                  alt={studentName}
                  className="rounded-circle shadow-sm"
                  style={{ width: '72px', height: '72px', objectFit: 'cover', border: '3px solid #228DDD' }}
                  onError={(e: any) => {
                    e.target.src = '/assets/img/user/user-01.jpg';
                  }}
                />
                <div>
                  <h4 className="fw-bold text-dark mb-1">{studentName}</h4>
                  <div className="text-muted small">
                    Registration No: <span className="fw-semibold text-dark">{regNumber}</span> • Email: <span className="fw-semibold text-dark">{studentEmail}</span>
                  </div>
                  <div className="text-success small fw-semibold mt-0.5">
                    <i className="feather-check-circle me-1" />
                    Academic Standing: Active Undergraduate Scholar (Good Standing)
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <h6 className="fw-bold text-dark mb-3">Academic Department</h6>
                    <div className="mb-2">
                      <span className="text-muted small d-block">Faculty:</span>
                      <span className="fw-semibold text-dark">{facultyName}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted small d-block">Study Program:</span>
                      <span className="fw-semibold text-dark">Bachelor of Science in Information & Communication Technology</span>
                    </div>
                    <div>
                      <span className="text-muted small d-block">Admission Session:</span>
                      <span className="fw-semibold text-dark">2026/2027 Academic Intake</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <h6 className="fw-bold text-dark mb-3">Continuous Assessment & GPA Metrics</h6>
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="p-2.5 bg-white rounded-2 border text-center">
                          <span className="text-muted small d-block">Current GPA</span>
                          <span className="fw-bold fs-18 text-primary">3.8 / 5.0</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2.5 bg-white rounded-2 border text-center">
                          <span className="text-muted small d-block">Credits Earned</span>
                          <span className="fw-bold fs-18 text-success">48 Units</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2.5 bg-white rounded-2 border text-center">
                          <span className="text-muted small d-block">CA Completion</span>
                          <span className="fw-bold fs-18 text-dark">100%</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2.5 bg-white rounded-2 border text-center">
                          <span className="text-muted small d-block">Exam Status</span>
                          <span className="fw-bold fs-18" style={{ color: '#013BA6' }}>Eligible</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: ENROLLED COURSES                                         */}
          {/* ============================================================== */}
          {activeView === 'courses' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                <div>
                  <h5 className="fw-bold text-dark mb-1">Enrolled Courses</h5>
                  <p className="text-muted small mb-0">
                    Comprehensive undergraduate & professional curriculum enrolled on Moodle Web Services.
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCourseFilter('all')}
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                      courseFilter === 'all' ? 'btn-primary' : 'btn-light border text-muted'
                    }`}
                  >
                    All ({courses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseFilter('active')}
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                      courseFilter === 'active' ? 'btn-primary' : 'btn-light border text-muted'
                    }`}
                  >
                    In Progress ({inProgressCourses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseFilter('completed')}
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                      courseFilter === 'completed' ? 'btn-primary' : 'btn-light border text-muted'
                    }`}
                  >
                    Completed ({completedCourses.length})
                  </button>
                </div>
              </div>

              {loadingCourses ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-2" role="status" />
                  <p className="text-muted small">Loading academic courses...</p>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-3">
                  <i className="feather-book-open fs-32 text-muted mb-2 d-block" />
                  <h6 className="fw-bold text-dark">No Courses Found</h6>
                  <p className="text-muted small">No courses match your filter selection.</p>
                </div>
              ) : (
                <>
                  <div className="row g-3">
                    {paginatedStudentCourses.map((c) => {
                      const progressVal = Math.round(c.progress ?? 0);
                      const isCompleted = progressVal >= 100;
                      return (
                        <div key={c.id} className="col-md-6 col-lg-4">
                          <div className="card border shadow-sm rounded-3 overflow-hidden h-100 d-flex flex-column justify-content-between">
                            <div className="position-relative" style={{ height: '140px' }}>
                              <img
                                src={c.courseimage || (c as any).courseImage || `/assets/img/course/thumbnails/course-${c.id}-${(c.shortname || `course-${c.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`}
                                alt={c.fullname}
                                className="w-100 h-100 object-fit-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const ownFallback = `/assets/img/course/thumbnails/course-${c.id}-${(c.shortname || `course-${c.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`;
                                  if (target.src !== ownFallback && !target.src.endsWith(ownFallback)) {
                                    target.src = ownFallback;
                                  }
                                }}
                              />
                              <span className="position-absolute top-0 start-0 m-2 badge bg-dark text-white">
                                {c.shortname}
                              </span>
                              <span
                                className={`position-absolute top-0 end-0 m-2 badge ${
                                  isCompleted ? 'bg-success' : progressVal > 0 ? 'bg-primary' : 'bg-secondary'
                                }`}
                              >
                                {isCompleted ? 'Completed' : `${progressVal}% Done`}
                              </span>
                            </div>

                            <div className="p-3 flex-grow-1 d-flex flex-column justify-content-between">
                              <div>
                                <h6 className="fw-bold text-dark mb-1 line-clamp-2" style={{ fontSize: '14px' }}>
                                  {c.fullname?.replace(/&amp;/g, '&')}
                                </h6>
                                <p className="text-muted line-clamp-2 mb-3" style={{ fontSize: '12px' }}>
                                  {c.summary?.replace(/<[^>]*>?/gm, '') || 'Official OUT undergraduate module.'}
                                </p>
                              </div>

                              <div className="pt-2 border-top d-flex align-items-center justify-content-between">
                                <Link
                                  to={`/course/course-watch?courseId=${c.id}`}
                                  className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                                >
                                  <span>{progressVal > 0 ? 'Resume' : 'Start'}</span>
                                  <i className="feather-play fs-11" />
                                </Link>
                                <Link
                                  to={`/course/course-details?id=${c.id}`}
                                  className="btn btn-sm btn-light border rounded-pill px-2.5 py-1 text-muted"
                                  style={{ fontSize: '11px' }}
                                >
                                  Syllabus
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalCoursePages > 1 && (
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-4 pt-3 border-top">
                      <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                        Showing <strong>{(coursePage - 1) * COURSE_PAGE_SIZE + 1}–{Math.min(coursePage * COURSE_PAGE_SIZE, totalCourseItems)}</strong> of <strong>{totalCourseItems}</strong> courses
                      </div>
                      <ul className="pagination pagination-sm mb-0 gap-1">
                        <li className={`page-item ${coursePage === 1 ? 'disabled' : ''}`}>
                          <button
                            type="button"
                            className="page-link rounded-2 px-2.5 py-1"
                            onClick={() => setCoursePage(coursePage - 1)}
                            disabled={coursePage === 1}
                            style={{ fontSize: '0.78rem' }}
                          >
                            Prev
                          </button>
                        </li>
                        {Array.from({ length: totalCoursePages }, (_, i) => i + 1).map((pageNum) => (
                          <li key={pageNum} className={`page-item ${coursePage === pageNum ? 'active' : ''}`}>
                            <button
                              type="button"
                              className={`page-link rounded-2 px-3 py-1 fw-semibold ${
                                coursePage === pageNum ? 'bg-primary text-white border-primary' : ''
                              }`}
                              onClick={() => setCoursePage(pageNum)}
                              style={{ fontSize: '0.78rem' }}
                            >
                              {pageNum}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${coursePage === totalCoursePages ? 'disabled' : ''}`}>
                          <button
                            type="button"
                            className="page-link rounded-2 px-2.5 py-1"
                            onClick={() => setCoursePage(coursePage + 1)}
                            disabled={coursePage === totalCoursePages}
                            style={{ fontSize: '0.78rem' }}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: CERTIFICATES                                             */}
          {/* ============================================================== */}
          {activeView === 'certificates' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h5 className="fw-bold text-dark mb-1">Official Academic Certificates</h5>
                  <p className="text-muted small mb-0">
                    The Open University of Tanzania verified university credentials with tamper-proof cryptographic verification codes.
                  </p>
                </div>
              </div>

              {loadingCertificates ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-2" role="status" />
                  <p className="text-muted small">Loading certified credentials...</p>
                </div>
              ) : certificates.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-3">
                  <i className="feather-award fs-32 text-muted mb-2 d-block" />
                  <h6 className="fw-bold text-dark">No Certificates Issued Yet</h6>
                  <p className="text-muted small">
                    Complete all modules and assignments with at least 50% score to receive your certified OUT credentials.
                  </p>
                </div>
              ) : (
                <div className="row g-3">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="col-md-6 col-lg-4">
                      <div className="card border shadow-sm rounded-3 p-3.5 h-100 d-flex flex-column justify-content-between bg-light">
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="badge bg-success text-white">Verified</span>
                            <span className="text-muted" style={{ fontSize: '11px' }}>
                              {cert.issueDate}
                            </span>
                          </div>

                          <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '14.5px' }}>
                            {cert.courseName}
                          </h6>
                          <div className="text-primary fw-semibold mb-2" style={{ fontSize: '12px' }}>
                            {cert.classification} • Grade: {cert.letterGrade}
                          </div>

                          <div className="p-2 rounded bg-white border text-center mb-3">
                            <span className="text-muted d-block" style={{ fontSize: '10px' }}>
                              Verification Code:
                            </span>
                            <span className="font-monospace fw-bold text-dark" style={{ fontSize: '12px' }}>
                              {cert.verificationCode}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedCertificate(cert)}
                          className="btn btn-sm btn-primary rounded-pill w-100 py-1.5 fw-semibold d-inline-flex align-items-center justify-content-center gap-1.5"
                        >
                          <i className="feather-eye fs-12" />
                          <span>View Official Certificate</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: MY QUIZ ATTEMPTS                                         */}
          {/* ============================================================== */}
          {activeView === 'quizzes' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h5 className="fw-bold text-dark mb-1">My Quiz Attempts</h5>
                  <p className="text-muted small mb-0">
                    Real-time Moodle Quiz grades and assessment checkpoints.
                  </p>
                </div>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 rounded-pill fw-semibold">
                  {quizzes.length} Quizzes Available
                </span>
              </div>

              {loadingQuizzes ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-2" role="status" />
                  <p className="text-muted small">Loading quiz records from Moodle...</p>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-3">
                  <i className="feather-help-circle fs-32 text-muted mb-2 d-block" />
                  <h6 className="fw-bold text-dark">No Quizzes Found</h6>
                  <p className="text-muted small">You currently have no active quizzes in your enrolled courses.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr style={{ fontSize: '12px' }}>
                        <th>Quiz Name</th>
                        <th>Course</th>
                        <th>Time Limit</th>
                        <th>Latest Score</th>
                        <th>Status</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '13px' }}>
                      {quizzes.map((q) => {
                        const hasAttempt = !!q.latestAttempt;
                        const score = q.latestAttempt?.sumgrades ?? 0;
                        const max = q.sumgrades || 10;
                        const pct = Math.round((score / max) * 100);
                        const passed = pct >= 50;

                        return (
                          <tr key={q.id}>
                            <td>
                              <div className="fw-semibold text-dark">{q.name}</div>
                              <div className="text-muted" style={{ fontSize: '11px' }}>
                                {q.intro?.replace(/<[^>]*>?/gm, '') || 'Mandatory academic checkpoint'}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {q.courseCode}
                              </span>
                            </td>
                            <td className="text-muted">
                              {q.timelimit ? `${Math.round(q.timelimit / 60)} mins` : 'Untimed'}
                            </td>
                            <td>
                              {hasAttempt ? (
                                <span className={`fw-bold ${passed ? 'text-success' : 'text-danger'}`}>
                                  {score}/{max} ({pct}%)
                                </span>
                              ) : (
                                <span className="text-muted">No attempts</span>
                              )}
                            </td>
                            <td>
                              {hasAttempt ? (
                                <span className={`badge ${passed ? 'bg-success' : 'bg-danger'}`}>
                                  {passed ? 'Passed' : 'Needs Review'}
                                </span>
                              ) : (
                                <span className="badge bg-warning text-dark">Pending</span>
                              )}
                            </td>
                            <td className="text-end">
                              <Link
                                to={`/student/student-quiz-questions?quizId=${q.id}`}
                                className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold"
                              >
                                {hasAttempt ? 'Retake' : 'Start'}
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: WISHLIST                                                 */}
          {/* ============================================================== */}
          {activeView === 'wishlist' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h5 className="fw-bold text-dark mb-1">Academic Wishlist & Electives</h5>
              <p className="text-muted small mb-4">
                Saved courses and future semester module electives at the Open University of Tanzania.
              </p>
              <div className="p-4 bg-light rounded-3 text-center">
                <i className="feather-heart fs-32 text-muted mb-2 d-block" />
                <h6 className="fw-bold text-dark">Your Wishlist is Empty</h6>
                <p className="text-muted small mb-3">Browse the university course catalog to save prospective electives.</p>
                <Link to="/course/course-category" className="btn btn-primary btn-sm rounded-pill px-4">
                  Explore Course Catalog
                </Link>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: REVIEWS                                                  */}
          {/* ============================================================== */}
          {activeView === 'reviews' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h5 className="fw-bold text-dark mb-1">Course Reviews & Feedback</h5>
              <p className="text-muted small mb-4">
                Your submitted academic evaluation feedback for completed lecturers and modules.
              </p>
              <div className="p-3.5 bg-light rounded-3 border mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-bold text-dark">BBA301: Financial Management & Strategic Planning</span>
                  <span className="text-warning">
                    <i className="feather-star me-1" />
                    5.0 / 5.0
                  </span>
                </div>
                <p className="text-muted small mb-0">
                  "Outstanding faculty delivery and practical capital budgeting problem sets. Very applicable to Tanzanian business environments."
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: ORDER HISTORY                                            */}
          {/* ============================================================== */}
          {activeView === 'orders' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h5 className="fw-bold text-dark mb-1">Order History & Tuition Payments</h5>
              <p className="text-muted small mb-4">
                Official payment records, Pesapal/Selcom mobile money receipts, and registration vouchers.
              </p>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr style={{ fontSize: '12px' }}>
                      <th>Reference ID</th>
                      <th>Module / Fee Description</th>
                      <th>Payment Gateway</th>
                      <th>Amount (TZS)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '13px' }}>
                    <tr>
                      <td className="font-monospace fw-bold">TZ-OUT-2026-904</td>
                      <td>Undergraduate Semester 1 Tuition Registration</td>
                      <td>Pesapal (M-Pesa)</td>
                      <td className="fw-bold text-dark">TZS 350,000</td>
                      <td><span className="badge bg-success">Confirmed</span></td>
                    </tr>
                    <tr>
                      <td className="font-monospace fw-bold">TZ-OUT-2026-781</td>
                      <td>Continuous Assessment Examination Sitting Fee</td>
                      <td>Selcom Gateway</td>
                      <td className="fw-bold text-dark">TZS 50,000</td>
                      <td><span className="badge bg-success">Confirmed</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: REFERRALS                                                */}
          {/* ============================================================== */}
          {activeView === 'referrals' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h5 className="fw-bold text-dark mb-1">Student Referrals & Campus Ambassador</h5>
              <p className="text-muted small mb-4">
                Invite fellow scholars to enroll at the Open University of Tanzania distance learning network.
              </p>
              <div className="p-3.5 bg-light rounded-3 border">
                <span className="text-muted small d-block mb-1">Your Personal University Referral Link:</span>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    className="form-control bg-white font-monospace"
                    value={`https://out.ac.tz/admissions?ref=${regNumber.replace(/\//g, '')}`}
                    style={{ fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary flex-shrink-0"
                    onClick={() => alert('Referral link copied to clipboard!')}
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: MESSAGES                                                 */}
          {/* ============================================================== */}
          {activeView === 'messages' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h5 className="fw-bold text-dark mb-1">Academic Messages & Faculty Advising</h5>
              <p className="text-muted small mb-4">
                Direct academic advisement from departmental lecturers and mentors.
              </p>
              <div className="list-group list-group-flush border rounded-3">
                <div className="list-group-item p-3 d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white bg-primary flex-shrink-0"
                    style={{ width: '42px', height: '42px' }}
                  >
                    <i className="feather-user fs-18" />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="fw-bold text-dark">Dr. M. Mwamwaja (Faculty of Business Management)</span>
                      <span className="text-muted small">Yesterday</span>
                    </div>
                    <p className="text-muted small mb-0 mt-0.5">
                      "Baraka, your submission for the Capital Budgeting model looks comprehensive. Please review the sensitivity analysis remarks."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: SUPPORT TICKETS                                          */}
          {/* ============================================================== */}
          {activeView === 'tickets' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h5 className="fw-bold text-dark mb-1">Support Tickets</h5>
                  <p className="text-muted small mb-0">
                    ICT Helpdesk, SARIS course registration assistance, and academic requests.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('New ticket modal: Please contact support@out.ac.tz')}
                  className="btn btn-primary btn-sm rounded-pill px-3 py-1.5 fw-semibold"
                >
                  + New Ticket
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr style={{ fontSize: '12px' }}>
                      <th>Ticket ID</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '13px' }}>
                    <tr>
                      <td className="font-monospace fw-bold">#OUT-8831</td>
                      <td>Course Material Video Stream Access Query</td>
                      <td>ICT Directorate</td>
                      <td><span className="badge bg-info">Medium</span></td>
                      <td><span className="badge bg-success">Resolved</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW: SETTINGS                                                 */}
          {/* ============================================================== */}
          {activeView === 'settings' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h5 className="fw-bold text-dark mb-1">Account & Academic Settings</h5>
              <p className="text-muted small mb-4">
                Manage notification digests, regional center preferences, and security passwords.
              </p>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <h6 className="fw-bold text-dark mb-2">Notification Preferences</h6>
                    <div className="form-check form-switch mb-2">
                      <input className="form-check-input" type="checkbox" defaultChecked id="notifCourse" />
                      <label className="form-check-label small" htmlFor="notifCourse">Email alerts for new lecture releases</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                      <input className="form-check-input" type="checkbox" defaultChecked id="notifQuiz" />
                      <label className="form-check-label small" htmlFor="notifQuiz">Continuous Assessment grading notifications</label>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <h6 className="fw-bold text-dark mb-2">Regional Center Jurisdiction</h6>
                    <div className="mb-2">
                      <span className="text-muted small d-block">Designated Regional Center:</span>
                      <span className="fw-semibold text-dark">Dar es Salaam Regional Centre (Kinondoni)</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                      onClick={() => alert('Regional Centre Transfer request submitted to Directorate of Regional Centres.')}
                    >
                      Request Regional Transfer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ============================================================== */}
        {/* ACADEMIC CALENDAR MODAL                                        */}
        {/* ============================================================== */}
        {showCalendarModal && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div
                  className="modal-header text-white p-3.5 border-0"
                  style={{ background: 'linear-gradient(90deg, #061838 0%, #013BA6 100%)' }}
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: 'rgba(34, 141, 221, 0.2)',
                        color: '#228DDD',
                      }}
                    >
                      <i className="feather-calendar fs-18" />
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold text-white fs-16 mb-0">
                        The Open University of Tanzania • Academic Calendar
                      </h5>
                      <span style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.65)' }}>
                        Academic Session 2026/2027 • Official University Deadlines
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowCalendarModal(false)}
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="list-group list-group-flush border rounded-3 mb-3">
                    <div className="list-group-item p-3 d-flex align-items-center justify-content-between">
                      <div>
                        <span className="fw-bold text-dark d-block">Continuous Assessment (CA) Submission Deadline</span>
                        <span className="text-muted small">Final date for assignments and quiz submissions for Semester 1</span>
                      </div>
                      <span className="badge bg-danger rounded-pill px-3 py-1.5">20 Nov 2026</span>
                    </div>
                    <div className="list-group-item p-3 d-flex align-items-center justify-content-between">
                      <div>
                        <span className="fw-bold text-dark d-block">Main Examination Registration Window</span>
                        <span className="text-muted small">Verification of regional exam center sittings</span>
                      </div>
                      <span className="badge bg-primary rounded-pill px-3 py-1.5">25 - 30 Nov 2026</span>
                    </div>
                    <div className="list-group-item p-3 d-flex align-items-center justify-content-between">
                      <div>
                        <span className="fw-bold text-dark d-block">University Examination Sittings</span>
                        <span className="text-muted small">Proctored in-person examinations across all regional centers</span>
                      </div>
                      <span className="badge bg-success rounded-pill px-3 py-1.5">01 - 15 Dec 2026</span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light p-3 border-top">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() => setShowCalendarModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LECTURE ROOM MODAL                                             */}
        {/* ============================================================== */}
        {selectedLecture && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-dark text-white p-3.5 border-0">
                  <h5 className="modal-title fw-bold fs-15 text-white mb-0">
                    Virtual Lecture Theatre: {selectedLecture.courseCode}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedLecture(null)}
                  />
                </div>

                <div className="modal-body p-4 text-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 text-primary"
                    style={{
                      width: '64px',
                      height: '64px',
                      backgroundColor: 'rgba(14, 165, 233, 0.12)',
                    }}
                  >
                    <i className="feather-video fs-28" />
                  </div>

                  <h6 className="fw-bold text-dark mb-1">{selectedLecture.title}</h6>
                  <p className="text-muted small mb-3">
                    Course: {selectedLecture.courseCode} • Lecturer: {selectedLecture.lecturerName}
                  </p>

                  <div className="p-3 bg-light rounded-3 border text-center mb-3">
                    <span className="text-muted d-block small">Scheduled Time:</span>
                    <span className="fw-bold text-dark">
                      {selectedLecture.dateBadge} {selectedLecture.monthBadge} • {selectedLecture.timeString} ({selectedLecture.duration})
                    </span>
                  </div>

                  <p className="text-success small fw-medium mb-0">
                    <i className="feather-check-circle me-1" />
                    Secure WebRTC Audio/Video Stream Initialized
                  </p>
                </div>

                <div className="modal-footer bg-light p-3 border-top d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-3"
                    onClick={() => setSelectedLecture(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4 fw-semibold"
                    onClick={() => {
                      alert('Entering Live Lecture Hall: ' + selectedLecture.title);
                      setSelectedLecture(null);
                    }}
                  >
                    Enter Lecture Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CERTIFICATE MODAL                                              */}
        {/* ============================================================== */}
        {selectedCertificate && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-dark text-white p-3 border-0">
                  <h5 className="modal-title fw-bold fs-15 text-white mb-0">
                    Official Academic Certificate
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedCertificate(null)}
                  />
                </div>

                <div className="modal-body p-4 text-center bg-white">
                  <div
                    className="p-4 rounded-3 border position-relative"
                    style={{
                      background: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)',
                      border: '3px double #d1d5db',
                    }}
                  >
                    <div className="mb-3">
                      <img
                        src="/assets/img/out-logo.png"
                        alt="OUT LMS"
                        style={{ height: '48px', objectFit: 'contain' }}
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <h4 className="fw-bold text-dark mt-2 mb-0" style={{ letterSpacing: '0.5px' }}>
                        THE OPEN UNIVERSITY OF TANZANIA
                      </h4>
                      <span className="text-muted small text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
                        Directorate of Undergraduate & Postgraduate Studies
                      </span>
                    </div>

                    <p className="text-muted small mb-1">This is to certify that</p>
                    <h3 className="fw-bold text-primary mb-2">
                      {selectedCertificate.studentName}
                    </h3>
                    <p className="text-muted small mb-3">
                      Registration Number: <strong>{selectedCertificate.regNumber}</strong>
                    </p>

                    <p className="text-muted small mb-1">has successfully completed the curriculum for</p>
                    <h5 className="fw-bold text-dark mb-2">
                      {selectedCertificate.courseName} ({selectedCertificate.courseCode})
                    </h5>

                    <p className="text-muted small mb-4">
                      with academic classification of <strong>{selectedCertificate.classification}</strong> (Grade: {selectedCertificate.letterGrade}).
                    </p>

                    <div className="d-flex align-items-center justify-content-between pt-4 border-top">
                      <div className="text-start">
                        <span className="d-block fw-bold text-dark small">{selectedCertificate.deanName}</span>
                        <span className="text-muted" style={{ fontSize: '11px' }}>Dean of Faculty</span>
                      </div>
                      <div className="text-center">
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 font-monospace">
                          SARIS VERIFIED • {selectedCertificate.verificationCode}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="d-block fw-bold text-dark small">{selectedCertificate.chancellorName}</span>
                        <span className="text-muted" style={{ fontSize: '11px' }}>Vice Chancellor</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light p-3 border-top d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() => setSelectedCertificate(null)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4 fw-semibold"
                    onClick={() => window.print()}
                  >
                    <i className="ti ti-printer me-1.5" />
                    Print / Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LEADERBOARD MODAL                                              */}
        {/* ============================================================== */}
        {showLeaderboardModal && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(15,23,42,0.7)', zIndex: 1060 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div
                  className="modal-header border-0 text-white p-3.5"
                  style={{ background: 'linear-gradient(135deg, #061838 0%, #013BA6 100%)' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className="ti ti-trophy fs-22" style={{ color: '#F4ED2D' }} />
                    <div>
                      <h5 className="modal-title fw-bold text-white mb-0">
                        Academic Cohort Leaderboard &amp; Badges
                      </h5>
                      <span className="small text-light text-opacity-75" style={{ fontSize: '0.74rem' }}>
                        Open University of Tanzania • IEMT Scholar Gamification Rankings
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowLeaderboardModal(false)}
                  />
                </div>

                <div className="modal-body p-4 bg-light">
                  <div className="alert alert-info border-0 shadow-sm d-flex align-items-center justify-content-between mb-3 py-2 px-3 rounded-3">
                    <span className="small">
                      <i className="ti ti-info-circle me-1" />
                      Scholars earn XP by completing readings, submitting quizzes, joining live labs, and participating in forums.
                    </span>
                    <span className="badge bg-warning text-dark fw-bold px-2 py-1">
                      Your Rank: #{learnerXp?.rank || 5}
                    </span>
                  </div>

                  <div className="table-responsive rounded-3 bg-white border">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light small text-uppercase">
                        <tr>
                          <th style={{ width: 60 }}>Rank</th>
                          <th>Scholar</th>
                          <th>Department / Track</th>
                          <th className="text-center">Level</th>
                          <th className="text-end">Total XP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((leader) => {
                          const isCurrentUser = leader.userId === (learnerXp?.userId || 3);
                          return (
                            <tr
                              key={leader.userId}
                              className={isCurrentUser ? 'table-warning fw-semibold' : ''}
                            >
                              <td>
                                {leader.rank === 1 ? (
                                  <span className="badge rounded-pill bg-warning text-dark px-2 py-1">
                                    🥇 1
                                  </span>
                                ) : leader.rank === 2 ? (
                                  <span className="badge rounded-pill bg-secondary text-white px-2 py-1">
                                    🥈 2
                                  </span>
                                ) : leader.rank === 3 ? (
                                  <span className="badge rounded-pill bg-danger text-white px-2 py-1">
                                    🥉 3
                                  </span>
                                ) : (
                                  <span className="badge rounded-pill bg-light text-dark border px-2 py-1">
                                    #{leader.rank}
                                  </span>
                                )}
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <img
                                    src={leader.avatar}
                                    alt={leader.name}
                                    className="rounded-circle"
                                    style={{ width: 32, height: 32, objectFit: 'cover' }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                                    }}
                                  />
                                  <div>
                                    <div className="fw-bold text-dark text-truncate" style={{ maxWidth: 180 }}>
                                      {leader.name} {isCurrentUser && <span className="badge bg-primary ms-1">You</span>}
                                    </div>
                                    <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                      {leader.title}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="small text-muted">{leader.department}</td>
                              <td className="text-center">
                                <span className="badge bg-primary-subtle text-primary border border-primary px-2 py-1">
                                  Lvl {leader.level}
                                </span>
                              </td>
                              <td className="text-end fw-bold text-dark">
                                {leader.totalXp.toLocaleString()} XP
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="modal-footer bg-white py-2 px-4 d-flex justify-content-between border-top">
                  <span className="small text-muted" style={{ fontSize: '0.74rem' }}>
                    Syncs in real-time with Moodle Level Up! XP engine
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary rounded-pill px-4"
                    onClick={() => setShowLeaderboardModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="sp-footer">
          <div className="sp-footer-copy">
            <span className="sp-dot" />
            <span>
              © {new Date().getFullYear()} The Open University of Tanzania (OUT). All rights reserved. • OUT Learning Management System
            </span>
          </div>
          <nav className="sp-footer-links">
            <Link to={all_routes.homeone}>Main Site</Link>
            <Link to="/course/course-category">Course Catalog</Link>
            <button type="button" onClick={() => handleSelectView('courses')}>Enrolled Courses</button>
            <button type="button" onClick={() => handleSelectView('certificates')}>Certificates</button>
            <button type="button" onClick={() => handleSelectView('settings')}>Settings</button>
            <Link to={all_routes.privacyPolicy}>Privacy Policy</Link>
          </nav>
        </footer>
      </div>

      <button
        type="button"
        className="sp-scrolltop"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to top"
        aria-label="Back to top"
      >
        <i className="ti ti-arrow-up" />
      </button>
    </div>
  );
};

export default StudentDashboard;