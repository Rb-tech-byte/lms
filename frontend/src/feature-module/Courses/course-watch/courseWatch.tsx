import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link, useLocation } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import {
  courseService,
  CourseSection,
  CourseModule,
  MoodleCourse,
  MoodlePageContent,
} from '../../../core/api/courseService';

/**
 * Extracts YouTube embed URL from various YouTube link formats
 */
function getYoutubeEmbedUrl(url?: string): string {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
  }
  return url;
}

const CourseWatch = () => {
  const route = all_routes;
  const location = useLocation();

  // Extract courseId from URL query (?courseId=2) or default to 2 (CS101)
  const searchParams = new URLSearchParams(location.search);
  const courseId = parseInt(searchParams.get('courseId') || '2', 10);

  // Component State
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<MoodleCourse | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [pagesMap, setPagesMap] = useState<Record<number, MoodlePageContent>>({});
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [updatingCompletion, setUpdatingCompletion] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'discussion'>('overview');

  // Load Course and Curriculum from Moodle Web Services
  useEffect(() => {
    let isMounted = true;

    async function loadClassroom() {
      setLoading(true);
      try {
        // 1. Fetch Course metadata
        const courses = await courseService.getCourses();
        const currentCourse = courses.find((c) => c.id === courseId) || courses[0] || null;

        // 2. Fetch Sections and Modules via core_course_get_contents
        const loadedSections = await courseService.getCourseContents(courseId);

        // Filter visible sections with modules
        const validSections = (loadedSections || []).filter(
          (s) => s.uservisible !== false && s.modules && s.modules.length > 0
        );

        // 3. Fetch Page readings via mod_page_get_pages_by_courses
        const pages = await courseService.getPagesByCourse(courseId);
        const pMap: Record<number, MoodlePageContent> = {};
        pages.forEach((p) => {
          pMap[p.coursemodule] = p;
        });

        if (isMounted) {
          setCourse(currentCourse);
          setSections(validSections);
          setPagesMap(pMap);

          // Expand all sections by default
          const exp: Record<number, boolean> = {};
          validSections.forEach((s) => {
            exp[s.id] = true;
          });
          setExpandedSections(exp);

          // Set initial active module (first non-forum module, or first module)
          if (validSections.length > 0) {
            let firstMod = validSections[0].modules[0];
            for (const s of validSections) {
              const candidate = s.modules.find((m) => m.modname !== 'forum');
              if (candidate) {
                firstMod = candidate;
                setActiveSectionId(s.id);
                break;
              }
            }
            setActiveModule(firstMod || validSections[0].modules[0] || null);
            if (!activeSectionId && validSections[0]) {
              setActiveSectionId(validSections[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load classroom course contents from Moodle:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadClassroom();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  // Compute live progress percentage from real Moodle module completion states
  const allModules = sections.flatMap((s) => s.modules);
  const trackableModules = allModules.filter((m) => m.completion > 0);
  const completedModules = trackableModules.filter((m) => m.completiondata?.state === 1);
  const progressPercent =
    trackableModules.length > 0
      ? Math.round((completedModules.length / trackableModules.length) * 100)
      : 0;

  // Toggle Section Collapse in Sidebar
  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Toggle Module Completion State via Moodle WS
  const handleToggleCompletion = async (module: CourseModule) => {
    if (module.completion === 0 || updatingCompletion) return;

    const isCurrentlyComplete = module.completiondata?.state === 1;
    const newState = isCurrentlyComplete ? 0 : 1;

    // Optimistic UI update
    setSections((prevSections) =>
      prevSections.map((sec) => ({
        ...sec,
        modules: sec.modules.map((m) => {
          if (m.id === module.id) {
            return {
              ...m,
              completiondata: {
                ...(m.completiondata || { state: 0 }),
                state: newState,
              },
            };
          }
          return m;
        }),
      }))
    );

    if (activeModule?.id === module.id) {
      setActiveModule((prev) =>
        prev
          ? {
              ...prev,
              completiondata: {
                ...(prev.completiondata || { state: 0 }),
                state: newState,
              },
            }
          : null
      );
    }

    setUpdatingCompletion(true);
    try {
      await courseService.updateActivityCompletion(module.id, !isCurrentlyComplete);
    } catch (err) {
      console.error('Failed to sync completion with Moodle WS:', err);
      // Revert on error
      setSections((prevSections) =>
        prevSections.map((sec) => ({
          ...sec,
          modules: sec.modules.map((m) => {
            if (m.id === module.id) {
              return {
                ...m,
                completiondata: {
                  ...(m.completiondata || { state: 0 }),
                  state: isCurrentlyComplete ? 1 : 0,
                },
              };
            }
            return m;
          }),
        }))
      );
    } finally {
      setUpdatingCompletion(false);
    }
  };

  // Navigation: Next and Previous Module
  const currentModuleIndex = allModules.findIndex((m) => m.id === activeModule?.id);

  const handleNextModule = () => {
    if (currentModuleIndex >= 0 && currentModuleIndex < allModules.length - 1) {
      const nextMod = allModules[currentModuleIndex + 1];
      setActiveModule(nextMod);
      // Auto expand next section if needed
      const parentSec = sections.find((s) => s.modules.some((m) => m.id === nextMod.id));
      if (parentSec) {
        setActiveSectionId(parentSec.id);
        setExpandedSections((prev) => ({ ...prev, [parentSec.id]: true }));
      }
    }
  };

  const handlePrevModule = () => {
    if (currentModuleIndex > 0) {
      const prevMod = allModules[currentModuleIndex - 1];
      setActiveModule(prevMod);
      const parentSec = sections.find((s) => s.modules.some((m) => m.id === prevMod.id));
      if (parentSec) {
        setActiveSectionId(parentSec.id);
        setExpandedSections((prev) => ({ ...prev, [parentSec.id]: true }));
      }
    }
  };

  // Helper to render module icon
  const getModuleIcon = (mod: CourseModule) => {
    switch (mod.modname) {
      case 'url':
        return <i className="isax isax-video-circle5 text-primary fs-20 me-2" />;
      case 'page':
        return <i className="isax isax-document-text5 text-info fs-20 me-2" />;
      case 'resource':
        return <i className="isax isax-folder-favorite5 text-warning fs-20 me-2" />;
      case 'quiz':
        return <i className="isax isax-task-square5 text-danger fs-20 me-2" />;
      case 'assign':
        return <i className="isax isax-edit-25 text-purple fs-20 me-2" />;
      case 'forum':
        return <i className="isax isax-messages-35 text-secondary fs-20 me-2" />;
      default:
        return <i className="isax isax-book5 text-primary fs-20 me-2" />;
    }
  };

  // Helper to extract video URL from URL module
  const getVideoUrl = (mod: CourseModule): string => {
    if (mod.contents && mod.contents.length > 0 && mod.contents[0].fileurl) {
      return mod.contents[0].fileurl;
    }
    return 'https://www.youtube.com/watch?v=1trvO6dqQUI';
  };

  return (
    <>
      <Breadcrumb title="Classroom & Course Player" />

      <div className="content pt-0 pb-5">
        <div className="container-fluid px-lg-4">
          <div className="course-watch-section">
            <div className="row g-4">
              {/* LEFT SIDEBAR: COURSE SYLLABUS & CURRICULUM ACCORDION */}
              <div className="col-lg-4 col-xl-3 border-end pe-lg-4">
                <div className="progress-overview-section bg-white p-3 rounded-4 shadow-xs border">
                  <div className="mb-3 d-flex align-items-center justify-content-between">
                    <Link
                      to={route.courseGrid}
                      className="back-to-course text-muted text-decoration-none small d-flex align-items-center"
                    >
                      <i className="isax isax-arrow-left me-1" />
                      Back to Catalog
                    </Link>
                    <span className="badge bg-primary-subtle text-primary fw-semibold">
                      {course?.shortname || 'CS101'}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2">
                    {course?.fullname || 'Data Structures & Algorithms in Python'}
                  </h5>
                  <p className="text-muted small mb-3">
                    Open University of Tanzania • Faculty of Science &amp; Technology
                  </p>

                  {/* REAL PROGRESS BAR */}
                  <div className="mb-4 p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small fw-semibold text-dark">Course Completion</span>
                      <span className="small fw-bold text-success">{progressPercent}%</span>
                    </div>
                    <div className="progress progress-xs mb-2" role="progressbar" style={{ height: '6px' }}>
                      <div
                        className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-muted small d-block" style={{ fontSize: '11px' }}>
                      {completedModules.length} of {trackableModules.length} required activities completed
                    </span>
                  </div>

                  {/* LOADING SKELETON */}
                  {loading && (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm mb-2" role="status" />
                      <p className="text-muted small mb-0">Loading course curriculum from Moodle...</p>
                    </div>
                  )}

                  {/* SECTIONS & MODULES LIST */}
                  {!loading && (
                    <div className="accordions-items-seperate">
                      {sections.map((section, sIndex) => {
                        const isExpanded = !!expandedSections[section.id];
                        const sectionCompleted = section.modules.filter(
                          (m) => m.completiondata?.state === 1
                        ).length;

                        return (
                          <div className="accordion-item mb-3 border rounded-3 overflow-hidden" key={section.id}>
                            <div
                              className="accordion-header p-3 bg-light d-flex align-items-center justify-content-between"
                              role="button"
                              onClick={() => toggleSection(section.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="pe-2">
                                <span className="d-block text-muted small" style={{ fontSize: '11px' }}>
                                  Section {sIndex + 1}
                                </span>
                                <h6 className="mb-0 fw-bold text-dark fs-14">{section.name}</h6>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-white text-muted border small" style={{ fontSize: '10px' }}>
                                  {sectionCompleted}/{section.modules.length}
                                </span>
                                <i
                                  className={`isax ${
                                    isExpanded ? 'isax-arrow-up-2' : 'isax-arrow-down-1'
                                  } text-muted`}
                                />
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="accordion-body p-0 bg-white">
                                {section.modules.map((mod) => {
                                  const isActive = activeModule?.id === mod.id;
                                  const isCompleted = mod.completiondata?.state === 1;

                                  return (
                                    <div
                                      key={mod.id}
                                      className={`d-flex align-items-center justify-content-between p-2 px-3 border-bottom transition-all ${
                                        isActive ? 'bg-primary-subtle border-start border-4 border-primary' : ''
                                      }`}
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => {
                                        setActiveModule(mod);
                                        setActiveSectionId(section.id);
                                      }}
                                    >
                                      <div className="d-flex align-items-center flex-grow-1 me-2 overflow-hidden">
                                        {getModuleIcon(mod)}
                                        <div className="overflow-hidden">
                                          <p
                                            className={`mb-0 text-truncate fs-13 ${
                                              isActive ? 'fw-bold text-primary' : 'text-dark'
                                            }`}
                                            title={mod.name}
                                          >
                                            {mod.name}
                                          </p>
                                          <span className="text-muted" style={{ fontSize: '10px' }}>
                                            {mod.modname.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>

                                      {/* COMPLETION CHECKBOX */}
                                      {mod.completion > 0 && (
                                        <button
                                          type="button"
                                          className="btn btn-link p-0 text-decoration-none flex-shrink-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleCompletion(mod);
                                          }}
                                          title={isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                                        >
                                          {isCompleted ? (
                                            <i className="isax isax-tick-circle5 text-success fs-18" />
                                          ) : (
                                            <i className="isax isax-record text-muted fs-18" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT STAGE: INTERACTIVE VIDEO / READING / RESOURCE / QUIZ PLAYER */}
              <div className="col-lg-8 col-xl-9">
                <div className="course-watch-content bg-white p-4 rounded-4 shadow-sm border">
                  {/* LESSON TOP BAR */}
                  <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 border-bottom mb-4 gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-primary text-white text-uppercase fs-12 px-2 py-1">
                          {activeModule?.modname || 'Lesson'}
                        </span>
                        {activeModule?.completiondata?.state === 1 && (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                            <i className="isax isax-tick-circle me-1" /> Completed
                          </span>
                        )}
                      </div>
                      <h4 className="fw-bold text-dark mb-0">
                        {activeModule?.name || 'Select a lesson from the syllabus sidebar'}
                      </h4>
                    </div>

                    {/* COMPLETION & NAVIGATION BUTTONS */}
                    <div className="d-flex align-items-center gap-2">
                      {activeModule && activeModule.completion > 0 && (
                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 d-flex align-items-center ${
                            activeModule.completiondata?.state === 1
                              ? 'btn-outline-success'
                              : 'btn-success text-white'
                          }`}
                          onClick={() => handleToggleCompletion(activeModule)}
                          disabled={updatingCompletion}
                        >
                          {activeModule.completiondata?.state === 1 ? (
                            <>
                              <i className="isax isax-tick-circle me-1" /> Mark Incomplete
                            </>
                          ) : (
                            <>
                              <i className="isax isax-tick-circle me-1" /> Mark as Completed
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                        onClick={handlePrevModule}
                        disabled={currentModuleIndex <= 0}
                      >
                        <i className="isax isax-arrow-left-2 me-1" /> Prev
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm rounded-pill px-3"
                        onClick={handleNextModule}
                        disabled={currentModuleIndex >= allModules.length - 1}
                      >
                        Next <i className="isax isax-arrow-right-3 ms-1" />
                      </button>
                    </div>
                  </div>

                  {/* ACTIVE MODULE VIEWER STAGE */}
                  <div className="lesson-stage mb-4">
                    {/* 1. VIDEO LECTURE (URL MODULE) */}
                    {activeModule?.modname === 'url' && (
                      <div className="video-player-container rounded-3 overflow-hidden bg-black shadow-sm">
                        <div className="ratio ratio-16x9">
                          <iframe
                            src={getYoutubeEmbedUrl(getVideoUrl(activeModule))}
                            title={activeModule.name}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ border: 'none' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 2. READING LESSON (PAGE MODULE) */}
                    {activeModule?.modname === 'page' && (
                      <div className="page-reading-container p-4 bg-light rounded-3 border">
                        <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-4">
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center me-3"
                              style={{ width: '48px', height: '48px' }}
                            >
                              <i className="isax isax-book-1 fs-24" />
                            </div>
                            <div>
                              <h5 className="fw-bold mb-0">Core Academic Reading</h5>
                              <small className="text-muted">Estimated reading time: 8-10 minutes</small>
                            </div>
                          </div>
                          <span className="badge bg-white text-dark border px-3 py-2">
                            📖 Lecture Material
                          </span>
                        </div>

                        {pagesMap[activeModule.id] ? (
                          <div
                            className="moodle-page-body bg-white p-4 rounded-3 border"
                            style={{ lineHeight: 1.7 }}
                            dangerouslySetInnerHTML={{ __html: pagesMap[activeModule.id].content }}
                          />
                        ) : (
                          <div
                            className="moodle-page-body bg-white p-4 rounded-3 border"
                            style={{ lineHeight: 1.7 }}
                          >
                            <h5>{activeModule.name}</h5>
                            <p className="text-muted">
                              Welcome to this learning module. In this reading lesson, review the theoretical foundations, code snippets, and analysis provided by the faculty.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. SYLLABUS / RESOURCE (PDF / FILE MODULE) */}
                    {activeModule?.modname === 'resource' && (
                      <div className="resource-container p-5 text-center bg-light rounded-3 border">
                        <div
                          className="rounded-circle bg-warning-subtle text-warning d-inline-flex align-items-center justify-content-center mb-3"
                          style={{ width: '80px', height: '80px' }}
                        >
                          <i className="isax isax-document-download text-warning" style={{ fontSize: '38px' }} />
                        </div>
                        <h4 className="fw-bold text-dark mb-2">{activeModule.name}</h4>
                        <p className="text-muted lead fs-6 mb-4 mx-auto" style={{ maxWidth: '540px' }}>
                          Official printable handout, assessment schedule, and reference guidelines published by the Department of Computer Science.
                        </p>

                        <div className="d-flex justify-content-center gap-3">
                          <a
                            href={
                              activeModule.contents && activeModule.contents[0]?.fileurl
                                ? activeModule.contents[0].fileurl
                                : '#'
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center"
                          >
                            <i className="isax isax-import me-2" /> Download Handout (PDF)
                          </a>
                          <button
                            type="button"
                            className="btn btn-outline-success rounded-pill px-4 py-2"
                            onClick={() => handleToggleCompletion(activeModule)}
                          >
                            <i className="isax isax-tick-circle me-1" /> Mark Handout Reviewed
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 4. QUIZ / ASSESSMENT MODULE */}
                    {(activeModule?.modname === 'quiz' || activeModule?.modname === 'assign') && (
                      <div className="quiz-container p-5 text-center bg-light rounded-3 border">
                        <div
                          className="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center mb-3"
                          style={{ width: '80px', height: '80px' }}
                        >
                          <i className="isax isax-task-square text-danger" style={{ fontSize: '38px' }} />
                        </div>
                        <h4 className="fw-bold text-dark mb-2">{activeModule.name}</h4>
                        <p className="text-muted lead fs-6 mb-4 mx-auto" style={{ maxWidth: '540px' }}>
                          Self-assessment checkpoint to verify your mastery of algorithmic complexity, Big-O notations, and sorting paradigms.
                        </p>

                        <div className="bg-white p-3 rounded-3 text-start mb-4 mx-auto border" style={{ maxWidth: '420px' }}>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Attempts Allowed:</span>
                            <span className="fw-semibold small">Unlimited (Graded Highest)</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small">Pass Grade:</span>
                            <span className="badge bg-success-subtle text-success">70% or higher</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted small">Grading Method:</span>
                            <span className="text-dark small fw-semibold">Automated Moodle Evaluation</span>
                          </div>
                        </div>

                        <div className="d-flex justify-content-center gap-3">
                          <button
                            type="button"
                            className="btn btn-danger rounded-pill px-4 py-2 fw-semibold"
                            onClick={() => handleToggleCompletion(activeModule)}
                          >
                            <i className="isax isax-play me-2" /> Start Knowledge Check
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 5. FORUM / DISCUSSION */}
                    {activeModule?.modname === 'forum' && (
                      <div className="forum-container p-5 text-center bg-light rounded-3 border">
                        <div
                          className="rounded-circle bg-secondary-subtle text-secondary d-inline-flex align-items-center justify-content-center mb-3"
                          style={{ width: '80px', height: '80px' }}
                        >
                          <i className="isax isax-messages-3 text-secondary" style={{ fontSize: '38px' }} />
                        </div>
                        <h4 className="fw-bold text-dark mb-2">{activeModule.name}</h4>
                        <p className="text-muted lead fs-6 mb-4 mx-auto" style={{ maxWidth: '540px' }}>
                          Ask questions, share algorithmic insights, and engage with your faculty instructor and peers across all regional centers.
                        </p>
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-pill px-4 py-2"
                        >
                          <i className="isax isax-message-add me-2" /> Open Class Forum
                        </button>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM TABS: OVERVIEW, NOTES, DISCUSSION */}
                  <ul className="nav nav-tabs border-bottom mb-4 nav-style-1">
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                      >
                        Overview &amp; Syllabus
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                      >
                        Lecture Notes
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${activeTab === 'discussion' ? 'active' : ''}`}
                        onClick={() => setActiveTab('discussion')}
                      >
                        Q&amp;A Discussion
                      </button>
                    </li>
                  </ul>

                  <div className="tab-content">
                    {activeTab === 'overview' && (
                      <div className="tab-pane active show">
                        <div className="mb-4">
                          <h6 className="fs-16 fw-bold mb-2">About This Course</h6>
                          <p className="text-muted" style={{ lineHeight: 1.7 }}>
                            {course?.summary ||
                              'This course covers algorithms and foundational data structures. Students will learn how to design, analyze, and optimize algorithms for performance in modern computing systems.'}
                          </p>
                        </div>

                        <div className="row g-3">
                          <div className="col-md-4">
                            <div className="p-3 bg-light rounded-3 border">
                              <span className="text-muted small d-block">Academic Department</span>
                              <strong className="text-dark">Computer Science &amp; IT</strong>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 bg-light rounded-3 border">
                              <span className="text-muted small d-block">Credits / Units</span>
                              <strong className="text-dark">15 Academic Units</strong>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 bg-light rounded-3 border">
                              <span className="text-muted small d-block">Accreditation</span>
                              <strong className="text-dark">TCU Regulated</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'notes' && (
                      <div className="tab-pane active show">
                        <div className="p-4 bg-light rounded-3 border">
                          <h6 className="fw-bold mb-2">Key Takeaways: {activeModule?.name}</h6>
                          <ul className="text-muted mb-0" style={{ lineHeight: 1.8 }}>
                            <li>Review the foundational axioms before attempting lab practical exercises.</li>
                            <li>Analyze both time complexity and auxiliary space overhead for every implementation.</li>
                            <li>Use Big-O notation to establish formal upper bounds on resource consumption.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeTab === 'discussion' && (
                      <div className="tab-pane active show">
                        <div className="p-4 bg-light rounded-3 border text-center">
                          <i className="isax isax-message-question text-primary fs-32 mb-2 d-block" />
                          <h6 className="fw-bold mb-1">Have a question about this lesson?</h6>
                          <p className="text-muted small mb-3">
                            Connect with teaching assistants and fellow students in the course forum.
                          </p>
                          <button type="button" className="btn btn-primary btn-sm rounded-pill px-4">
                            Post to Discussion
                          </button>
                        </div>
                      </div>
                    )}
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

export default CourseWatch;
