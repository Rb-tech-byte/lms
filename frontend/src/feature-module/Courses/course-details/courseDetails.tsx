import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { courseService, PublicCatalogCourse } from '../../../core/api/courseService';
import { adminService } from '../../../core/api/adminService';
import { useAuth } from '../../../core/auth/authContext';

interface DynamicModule {
  id: number;
  instance: number;
  modname: string;
  name: string;
  visible: number;
  completion: number;
}

interface DynamicSection {
  id: number;
  section: number;
  name: string;
  summary: string;
  visible: number;
  modules_count: number;
  modules: DynamicModule[];
}

interface DynamicCourseDetail {
  id: number;
  fullname: string;
  shortname: string;
  idnumber: string;
  category_id: number;
  category_name: string;
  summary: string;
  format: string;
  visible: number;
  startdate: number;
  enddate: number;
  tuitionFee: number;
  priceFormatted: string;
  courseImage: string;
  rating: string;
  reviewsCount: number;
  sections_count: number;
  modules_count: number;
  participants_count: number;
  instructor: {
    id: number;
    fullname: string;
    role: string;
    department: string;
    email: string;
    avatar: string;
    bio: string;
  };
  sections: DynamicSection[];
}

const getModuleMeta = (modname: string) => {
  switch (modname) {
    case 'quiz':
      return { icon: 'isax-clipboard-tick', color: '#dc2626', bg: '#fef2f2', label: 'Quiz Assessment' };
    case 'assign':
      return { icon: 'isax-document-upload', color: '#d97706', bg: '#fffbeb', label: 'Coursework' };
    case 'forum':
      return { icon: 'isax-messages-2', color: '#7c3aed', bg: '#f5f3ff', label: 'Discussion Forum' };
    case 'page':
      return { icon: 'isax-book-1', color: '#0171BB', bg: '#f0f9ff', label: 'Lecture Notes' };
    case 'resource':
      return { icon: 'isax-document-text', color: '#059669', bg: '#ecfdf5', label: 'Study Guide' };
    case 'url':
      return { icon: 'isax-link-21', color: '#2563eb', bg: '#eff6ff', label: 'Resource Link' };
    case 'vpl':
      return { icon: 'isax-code', color: '#0284c7', bg: '#e0f2fe', label: 'Virtual Programming Lab' };
    case 'attendance':
      return { icon: 'isax-calendar-tick', color: '#0d9488', bg: '#ccfbf1', label: 'Digital Attendance' };
    case 'customcert':
      return { icon: 'isax-award', color: '#b45309', bg: '#fef3c7', label: 'Verifiable Certificate' };
    case 'reengagement':
      return { icon: 'isax-notification-bing', color: '#9333ea', bg: '#f3e8ff', label: 'Retention Nudge' };
    default:
      return { icon: 'isax-teacher', color: '#475569', bg: '#f8fafc', label: 'Learning Activity' };
  }
};

const CourseDetails: React.FC = () => {
  const routes = all_routes;
  const { user, role } = useAuth();
  const isStaff = role === 'admin' || role === 'instructor';
  const resolvedUserId = useMemo(() => {
    if (!user) return 3;
    const raw = (user as any).userid || (user as any).id;
    const parsed = Number(String(raw).replace(/[^0-9]/g, ''));
    return parsed > 1 ? parsed : 3;
  }, [user]);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = Number(searchParams.get('id') || searchParams.get('course_id') || 8);

  const [courseId, setCourseId] = useState<number>(initialCourseId > 1 ? initialCourseId : 8);
  const [course, setCourse] = useState<DynamicCourseDetail | null>(null);
  const [allCourses, setAllCourses] = useState<PublicCatalogCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const initialTabParam = searchParams.get('tab');
  const validInitialTab =
    initialTabParam === 'labs' ||
    initialTabParam === 'tracking' ||
    initialTabParam === 'ai-media' ||
    initialTabParam === 'enterprise' ||
    initialTabParam === 'overview' ||
    initialTabParam === 'lecturer'
      ? initialTabParam
      : 'syllabus';
  const [activeTab, setActiveTab] = useState<'syllabus' | 'labs' | 'tracking' | 'ai-media' | 'enterprise' | 'overview' | 'lecturer'>(validInitialTab);
  const [activitySearch, setActivitySearch] = useState<string>('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Moodle Marketplace Plugin States (Course Formats, VPL, CodeRunner, Attendance, Completion Progress, XP, CustomCert, Reengagement)
  const [activeFormat, setActiveFormat] = useState<string>('tiles');
  const [availableFormats, setAvailableFormats] = useState<any[]>([]);
  const [selectedOneTopicIdx, setSelectedOneTopicIdx] = useState<number>(0);
  const [vplLabs, setVplLabs] = useState<any[]>([]);
  const [selectedVplId, setSelectedVplId] = useState<number>(0);
  const [vplCode, setVplCode] = useState<string>('');
  const [vplLanguage, setVplLanguage] = useState<string>('python');
  const [vplEvaluation, setVplEvaluation] = useState<any | null>(null);
  const [codeRunnerQuestions, setCodeRunnerQuestions] = useState<any[]>([]);
  const [selectedCrId, setSelectedCrId] = useState<number>(0);
  const [crAnswerCode, setCrAnswerCode] = useState<string>('');
  const [crEvaluation, setCrEvaluation] = useState<any | null>(null);
  const [attendanceData, setAttendanceData] = useState<any | null>(null);
  const [completionProgress, setCompletionProgress] = useState<any | null>(null);
  const [customCertData, setCustomCertData] = useState<any | null>(null);
  const [reengagementNudges, setReengagementNudges] = useState<any[]>([]);
  const [enterpriseSuites, setEnterpriseSuites] = useState<any[]>([]);
  const [enterpriseFeatures, setEnterpriseFeatures] = useState<any[]>([]);
  const [aiPromptInput, setAiPromptInput] = useState<string>(
    'Summarize Unit 1 core concepts in English & Kiswahili and generate 2 Socratic review questions.'
  );
  const [selectedEnterpriseSuiteFilter, setSelectedEnterpriseSuiteFilter] = useState<string>('all');
  const [pluginActionBusy, setPluginActionBusy] = useState<string | null>(null);

  // Staff inline curriculum management modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<DynamicSection | null>(null);
  const [sectionForm, setSectionForm] = useState({ name: '', summary: '', visible: 1 });
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [targetSectionNum, setTargetSectionNum] = useState<number>(1);
  const [moduleForm, setModuleForm] = useState({ modname: 'page', name: '', intro: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const paramId = Number(searchParams.get('id') || searchParams.get('course_id') || 0);
    if (paramId > 1 && paramId !== courseId) {
      setCourseId(paramId);
    }
    const tabParam = searchParams.get('tab');
    if (
      tabParam === 'syllabus' ||
      tabParam === 'labs' ||
      tabParam === 'tracking' ||
      tabParam === 'ai-media' ||
      tabParam === 'enterprise' ||
      tabParam === 'overview' ||
      tabParam === 'lecturer'
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams, courseId]);

  const loadCourseData = useCallback(async (targetId: number) => {
    setLoading(true);
    try {
      const [
        detailData,
        catalogData,
        formatRes,
        attRes,
        vplRes,
        crRes,
        compRes,
        certRes,
        reengRes,
        entRes,
      ] = await Promise.all([
        courseService.getPublicCourseDetails(targetId),
        courseService.getPublicCatalog(),
        courseService.getCourseFormats(targetId).catch(() => null),
        courseService.getAttendance(targetId, resolvedUserId).catch(() => null),
        courseService.getVplLabs(targetId, resolvedUserId).catch(() => null),
        courseService.getCodeRunnerQuestions(targetId).catch(() => null),
        courseService.getCompletionProgress(targetId, resolvedUserId).catch(() => null),
        courseService.getCustomCertTemplates(targetId, resolvedUserId).catch(() => null),
        courseService.getReengagementNudges(targetId).catch(() => null),
        courseService.getCourseEnterpriseSuites(targetId).catch(() => null),
      ]);
      setCourse(detailData);
      setAllCourses(catalogData.courses || []);

      if (formatRes?.success) {
        setActiveFormat(formatRes.current_format || detailData?.format || 'tiles');
        setAvailableFormats(formatRes.available_formats || []);
      } else if (detailData?.format) {
        setActiveFormat(detailData.format);
      }

      if (attRes?.success) {
        setAttendanceData(attRes);
      }
      if (vplRes?.success && Array.isArray(vplRes.labs)) {
        setVplLabs(vplRes.labs);
        if (vplRes.labs.length > 0) {
          setSelectedVplId(vplRes.labs[0].id);
          setVplCode(vplRes.labs[0].starterCode || '');
          setVplLanguage(vplRes.labs[0].language || 'python');
        }
        if (vplRes.evaluation) {
          setVplEvaluation(vplRes.evaluation);
        }
      }
      if (crRes?.success && Array.isArray(crRes.questions)) {
        setCodeRunnerQuestions(crRes.questions);
        if (crRes.questions.length > 0) {
          setSelectedCrId(crRes.questions[0].id);
          setCrAnswerCode(crRes.questions[0].starterCode || '');
        }
        if (crRes.evaluation) {
          setCrEvaluation(crRes.evaluation);
        }
      }
      if (compRes?.success) {
        setCompletionProgress(compRes);
      }
      if (certRes?.success && certRes.certificate) {
        setCustomCertData(certRes.certificate);
      }
      if (reengRes?.success && Array.isArray(reengRes.nudges)) {
        setReengagementNudges(reengRes.nudges);
      }
      if (entRes?.success) {
        setEnterpriseSuites(entRes.suites || []);
        setEnterpriseFeatures(entRes.features || []);
      }

      if (detailData?.sections?.length) {
        const initialExpanded: Record<number, boolean> = {};
        detailData.sections.forEach((s: DynamicSection, i: number) => {
          initialExpanded[s.id] = i < 2;
        });
        setExpandedSections(initialExpanded);
        setSelectedOneTopicIdx(0);
      }
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Unable to load programme details.' });
    } finally {
      setLoading(false);
    }
  }, [resolvedUserId]);

  useEffect(() => {
    loadCourseData(courseId);
  }, [courseId, loadCourseData]);

  const handleSwitchCourseFormat = async (newFormat: string) => {
    if (!course) return;
    setActiveFormat(newFormat);
    setPluginActionBusy('format');
    try {
      const res = await courseService.updateCourseFormat(course.id, newFormat);
      if (res?.success) {
        setFeedback({ type: 'success', message: `Adaptive curriculum layout switched to "${newFormat.toUpperCase()}" mode.` });
      }
    } catch {
      // Visual switch remains active
    } finally {
      setPluginActionBusy(null);
    }
  };

  const handleExecuteEnterpriseFeature = async (feature: any, customPrompt?: string) => {
    if (!course) return;
    const busyKey = `ent-${feature.component}`;
    setPluginActionBusy(busyKey);
    try {
      const res = await courseService.executeEnterpriseFeature({
        course_id: course.id,
        component: feature.component,
        feature_code: feature.feature_code,
        suite: feature.suite,
        action_name: feature.post_action || 'execute_enterprise_feature',
        prompt: customPrompt || `Live execution & verification of ${feature.title}`,
        actor: (user as any)?.fullname || (user as any)?.name || 'Scholar Baraka Mkwawa',
      });
      if (res?.success) {
        // Refresh full 65-feature dataset for this course
        const refreshed = await courseService.getCourseEnterpriseSuites(course.id).catch(() => null);
        if (refreshed?.success) {
          setEnterpriseSuites(refreshed.suites || []);
          setEnterpriseFeatures(refreshed.features || []);
        }
        setFeedback({
          type: 'success',
          message: res.message || `Executed "${feature.title}" successfully.`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Action failed.' });
    } finally {
      setPluginActionBusy(null);
    }
  };

  const handleRunVplCode = async () => {
    if (!course || !selectedVplId) return;
    setPluginActionBusy('vpl');
    try {
      const res = await courseService.submitVplCode({
        course_id: course.id,
        vpl_id: selectedVplId,
        user_id: resolvedUserId,
        language: vplLanguage,
        source_code: vplCode,
      });
      if (res?.success) {
        setVplLabs(res.labs || vplLabs);
        setVplEvaluation(res.evaluation || null);
        setFeedback({
          type: 'success',
          message: `VPL Lab evaluated: ${res.evaluation?.passedTests}/${res.evaluation?.totalTests} unit tests passed — Grade: ${res.evaluation?.grade}/100.`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'VPL code evaluation failed.' });
    } finally {
      setPluginActionBusy(null);
    }
  };

  const handleEvaluateCodeRunner = async () => {
    if (!course || !selectedCrId) return;
    setPluginActionBusy('coderunner');
    try {
      const res = await courseService.evaluateCodeRunner({
        course_id: course.id,
        question_id: selectedCrId,
        user_id: resolvedUserId,
        answer_code: crAnswerCode,
      });
      if (res?.success && res.evaluation) {
        setCrEvaluation(res.evaluation);
        setFeedback({
          type: 'success',
          message: `CodeRunner graded: ${res.evaluation.passedCount}/${res.evaluation.totalCount} test cases passed (${res.evaluation.score}/${res.evaluation.maxScore} marks).`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'CodeRunner evaluation failed.' });
    } finally {
      setPluginActionBusy(null);
    }
  };

  const handleAttendanceCheckIn = async (sessionId: number, statusAcronym: string = 'P') => {
    if (!course) return;
    setPluginActionBusy(`att-${sessionId}`);
    try {
      const res = await courseService.recordAttendance({
        course_id: course.id,
        user_id: resolvedUserId,
        session_id: sessionId,
        status: statusAcronym,
        remarks: 'Verified via OUT LMS Digital Attendance & QR Check-in',
      });
      if (res?.success) {
        setAttendanceData(res);
        setFeedback({ type: 'success', message: res.message || 'Attendance recorded in Moodle database.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Failed to record attendance.' });
    } finally {
      setPluginActionBusy(null);
    }
  };

  const handleCreateAttendanceSession = async () => {
    if (!course) return;
    setPluginActionBusy('att-create');
    try {
      const res = await courseService.recordAttendance({
        course_id: course.id,
        user_id: resolvedUserId,
        subaction: 'create_session',
        description: `Live Interactive Seminar (${course.shortname}) — ${new Date().toLocaleDateString()}`,
      });
      if (res?.success) {
        setAttendanceData(res);
        setFeedback({ type: 'success', message: 'Created new Digital Attendance session with QR check-in enabled.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Failed to create attendance session.' });
    } finally {
      setPluginActionBusy(null);
    }
  };

  const handleToggleModuleCompletion = async (cmid: number) => {
    if (!course) return;
    setPluginActionBusy(`comp-${cmid}`);
    try {
      const res = await courseService.toggleActivityCompletion(course.id, cmid, resolvedUserId);
      if (res?.success) {
        setCompletionProgress(res);
        setFeedback({
          type: 'success',
          message: `Updated activity completion (${res.completedModules}/${res.totalModules} completed • ${res.xp?.points} XP).`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Failed to toggle completion.' });
    } finally {
      setPluginActionBusy(null);
    }
  };

  const handleIssueCustomCertificate = async () => {
    if (!course) return;
    setPluginActionBusy('cert');
    try {
      const res = await courseService.issueCustomCert(course.id, resolvedUserId);
      if (res?.success && res.certificate) {
        setCustomCertData(res.certificate);
        setFeedback({
          type: 'success',
          message: `Verifiable Custom Certificate issued (Code: ${res.certificate.verificationCode}).`,
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Failed to issue certificate.' });
    } finally {
      setPluginActionBusy(null);
    }
  };

  const handleTriggerReengagement = async () => {
    if (!course) return;
    setPluginActionBusy('reeng');
    try {
      const res = await courseService.triggerReengagement(course.id);
      if (res?.success) {
        setReengagementNudges(res.nudges || reengagementNudges);
        setFeedback({ type: 'success', message: res.message || 'Re-engagement nudge dispatched.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Failed to trigger re-engagement nudge.' });
    } finally {
      setPluginActionBusy(null);
    }
  };

  const handleSelectCourse = (newId: number) => {
    setCourseId(newId);
    setSearchParams({ id: String(newId) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSection = (secId: number) => {
    setExpandedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      if (editingSection) {
        await adminService.manageCourseSection({
          course_id: course.id,
          section: editingSection.section,
          sec_action: 'update',
          name: sectionForm.name,
          summary: sectionForm.summary,
          visible: sectionForm.visible,
        });
        setFeedback({ type: 'success', message: `Updated syllabus unit "${sectionForm.name}".` });
      } else {
        await adminService.manageCourseSection({
          course_id: course.id,
          sec_action: 'create',
          name: sectionForm.name,
          summary: sectionForm.summary,
        });
        setFeedback({ type: 'success', message: `Added new syllabus unit "${sectionForm.name}".` });
      }
      setShowSectionModal(false);
      setEditingSection(null);
      await loadCourseData(course.id);
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Could not save syllabus unit.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSection = async (sec: DynamicSection) => {
    if (!course || sec.section === 0) return;
    setSubmitting(true);
    try {
      await adminService.manageCourseSection({
        course_id: course.id,
        section: sec.section,
        sec_action: 'delete',
      });
      setFeedback({ type: 'success', message: `Removed unit "${sec.name}".` });
      await loadCourseData(course.id);
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Could not delete unit.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !moduleForm.name.trim()) return;
    setSubmitting(true);
    try {
      await adminService.addActivity({
        course_id: course.id,
        section: targetSectionNum,
        mod_type: (['page', 'quiz', 'assign', 'resource', 'attendance', 'vpl', 'customcert', 'reengagement'].includes(moduleForm.modname)
          ? moduleForm.modname
          : 'page'),
        name: moduleForm.name.trim(),
        content: moduleForm.content || moduleForm.intro,
      });
      setFeedback({ type: 'success', message: `Added activity "${moduleForm.name}" to Unit ${targetSectionNum}.` });
      setShowModuleModal(false);
      setModuleForm({ modname: 'page', name: '', intro: '', content: '' });
      await loadCourseData(course.id);
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Could not add learning activity.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (cmId: number, modTitle: string) => {
    if (!course) return;
    setSubmitting(true);
    try {
      await adminService.deleteActivity(cmId);
      setFeedback({ type: 'success', message: `Removed activity "${modTitle}".` });
      await loadCourseData(course.id);
    } catch (err: any) {
      setFeedback({ type: 'danger', message: err?.message || 'Could not remove activity.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter sections and modules based on activity search and type
  const filteredSections = useMemo(() => {
    if (!course?.sections) return [];
    if (!activitySearch.trim() && activityTypeFilter === 'all') return course.sections;

    const q = activitySearch.toLowerCase().trim();
    return course.sections
      .map((sec) => {
        const matchesSection = sec.name.toLowerCase().includes(q) || (sec.summary && sec.summary.toLowerCase().includes(q));
        const matchedMods = sec.modules.filter((m) => {
          const typeMatch = activityTypeFilter === 'all' || m.modname === activityTypeFilter;
          const searchMatch = !q || m.name.toLowerCase().includes(q);
          return typeMatch && searchMatch;
        });

        if (matchesSection || matchedMods.length > 0) {
          return {
            ...sec,
            modules: matchedMods,
          };
        }
        return null;
      })
      .filter((s): s is DynamicSection => s !== null);
  }, [course, activitySearch, activityTypeFilter]);

  const relatedCourses = allCourses.filter((c) => c.id !== course?.id).slice(0, 4);

  return (
    <div style={{ background: '#f8fafc', minHeight: '85vh', paddingBottom: '70px' }}>
      {/* Compact Dark-Navy Programme Banner Card */}
      <section
        className="py-3.5"
        style={{
          background: 'linear-gradient(135deg, #005B97 0%, #0171BB 55%, #0082D6 100%)',
          borderBottom: '3px solid #FFD200',
        }}
      >
        <div className="container">
          {/* Quick Switcher Bar */}
          {allCourses.length > 1 && (
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="d-flex align-items-center gap-1.5 small" style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                <Link to={routes.home} className="text-decoration-none" style={{ color: '#cbd5e1' }}>
                  Home
                </Link>
                <span>/</span>
                <Link to={routes.courseGrid} className="text-decoration-none" style={{ color: '#cbd5e1' }}>
                  Catalog
                </Link>
                <span>/</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{course?.shortname || 'Course'}</span>
              </div>
              <div className="d-flex align-items-center gap-1 flex-wrap">
                <span className="small me-1" style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                  Programmes:
                </span>
                {allCourses.slice(0, 7).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCourse(c.id)}
                    className="btn btn-sm rounded-pill px-2.5 py-0.5 fw-semibold"
                    style={{
                      fontSize: '0.72rem',
                      background: c.id === course?.id ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                      color: c.id === course?.id ? '#0f172a' : '#e2e8f0',
                      border: 'none',
                    }}
                  >
                    {c.shortname}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading || !course ? (
            <div className="py-4 text-center text-white">
              <div className="spinner-border spinner-border-sm text-warning me-2" role="status" />
              <span className="small">Loading programme curriculum...</span>
            </div>
          ) : (
            <div className="row align-items-center g-3">
              <div className="col-lg-8">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  <span
                    className="badge rounded-pill px-2.5 py-0.5 fw-bold"
                    style={{ background: '#FFD200', color: '#051426', fontSize: '0.72rem' }}
                  >
                    {course.shortname}
                  </span>
                  <Link
                    to={`${routes.courseCategory}?id=${course.category_id}`}
                    className="badge rounded-pill text-decoration-none px-2.5 py-0.5 fw-medium"
                    style={{
                      background: 'rgba(255,255,255,0.14)',
                      color: '#f8fafc',
                      fontSize: '0.72rem',
                    }}
                  >
                    <i className="isax isax-buildings-2 me-1" />
                    {course.category_name}
                  </Link>
                  <span
                    className="badge rounded-pill px-2 py-0.5"
                    style={{ background: 'rgba(16,185,129,0.25)', color: '#6ee7b7', fontSize: '0.7rem' }}
                  >
                    TCU Accredited
                  </span>
                </div>

                <h1 className="fw-bold text-white mb-2" style={{ fontSize: 'clamp(1.3rem, 2.1vw, 1.75rem)' }}>
                  {course.fullname}
                </h1>

                <p className="mb-2.5" style={{ color: '#cbd5e1', fontSize: '0.86rem', maxWidth: 660, lineHeight: 1.5 }}>
                  {course.summary ||
                    'Accredited university programme combining structured study units, interactive assessments, and regional academic support.'}
                </p>

                <div className="d-flex flex-wrap align-items-center gap-3 pt-1">
                  <Link
                    to={`${routes.instructorDetails}?id=${course.instructor.id}`}
                    className="d-flex align-items-center gap-2 text-decoration-none"
                  >
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.fullname}
                      className="rounded-circle border border-2 border-warning"
                      style={{ width: 30, height: 30, objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = '/assets/img/user/user-01.jpg';
                      }}
                    />
                    <div>
                      <div className="fw-semibold text-white" style={{ fontSize: '0.8rem', lineHeight: 1.1 }}>
                        {course.instructor.fullname}
                      </div>
                      <small style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{course.instructor.role}</small>
                    </div>
                  </Link>

                  <div className="vr bg-light opacity-25 d-none d-sm-block" />

                  <div className="d-flex align-items-center gap-3 flex-wrap" style={{ color: '#e2e8f0', fontSize: '0.78rem' }}>
                    <span>
                      <i className="isax isax-book-1 text-warning me-1" />
                      <strong>{course.sections.length}</strong> Units
                    </span>
                    <span>
                      <i className="isax isax-Menu-board text-info me-1" />
                      <strong>{course.modules_count}</strong> Activities
                    </span>
                    <span>
                      <i className="isax isax-profile-2user text-success me-1" />
                      <strong>{course.participants_count}</strong> Enrolled
                    </span>
                    <span>
                      <i className="fas fa-star text-warning me-1" />
                      <strong>{course.rating}</strong> ({course.reviewsCount})
                    </span>
                  </div>
                </div>
              </div>

              {/* Compact Hero Tuition Card */}
              <div className="col-lg-4">
                <div
                  className="p-3 rounded-4"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                    <span className="small text-muted" style={{ color: '#cbd5e1', fontSize: '0.74rem' }}>
                      Tuition & Enrollment
                    </span>
                    <span className="badge bg-success-subtle text-success rounded-pill" style={{ fontSize: '0.68rem' }}>
                      Open Intake
                    </span>
                  </div>
                  <div className="d-flex align-items-baseline justify-content-between mb-2.5">
                    <h3 className="fw-bold text-white mb-0" style={{ fontSize: '1.4rem' }}>
                      {course.priceFormatted}
                    </h3>
                    <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Institutional Rate</small>
                  </div>
                  <div className="d-grid gap-1.5">
                    <Link
                      to={`${routes.courseWatch}?courseId=${course.id}`}
                      className="btn btn-warning fw-bold rounded-pill py-1.5"
                      style={{ fontSize: '0.82rem', color: '#0f172a' }}
                    >
                      <i className="isax isax-play-circle me-1" />
                      {user ? 'Open Learning Classroom' : 'Preview Digital Classroom'}
                    </Link>
                    <div className="d-flex gap-1.5">
                      <Link
                        to={`${routes.courseCheckout}?id=${course.id}`}
                        className="btn btn-light btn-sm fw-semibold rounded-pill flex-grow-1 py-1"
                        style={{ fontSize: '0.76rem', color: '#071F38' }}
                      >
                        Enrol Now
                      </Link>
                      <Link
                        to={`${routes.courseCart}?id=${course.id}`}
                        className="btn btn-outline-light btn-sm fw-semibold rounded-pill px-3 py-1"
                        style={{ fontSize: '0.76rem' }}
                      >
                        <i className="isax isax-shopping-cart me-1" />
                        Cart
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-4">
        <div className="container">
          {feedback && (
            <div className={`alert alert-${feedback.type} d-flex align-items-center justify-content-between py-2 px-3 rounded-3 mb-3 small`}>
              <span>{feedback.message}</span>
              <button type="button" className="btn-close btn-sm" onClick={() => setFeedback(null)} />
            </div>
          )}

          {course && (
            <div className="row g-4">
              {/* Left Column: Tabs + Dynamic Syllabus + Overview + Lecturer */}
              <div className="col-lg-8">
                {/* Compact Navigation Pills Bar */}
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 bg-white p-2 rounded-3 shadow-sm border mb-3">
                  <div className="d-flex gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveTab('syllabus')}
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                        activeTab === 'syllabus' ? 'btn-primary' : 'btn-light text-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className="isax isax-book-saved me-1" />
                      Syllabus & Units ({course.sections.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('labs')}
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                        activeTab === 'labs' ? 'btn-primary' : 'btn-light text-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className="isax isax-code me-1" />
                      Coding Labs ({vplLabs.length + codeRunnerQuestions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tracking')}
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                        activeTab === 'tracking' ? 'btn-primary' : 'btn-light text-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className="isax isax-calendar-tick me-1" />
                      Attendance & Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('ai-media')}
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                        activeTab === 'ai-media' ? 'btn-primary' : 'btn-light text-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className="isax isax-cpu-charge me-1" />
                      AI Tutor & Media (29)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('enterprise')}
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                        activeTab === 'enterprise' ? 'btn-primary' : 'btn-light text-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className="isax isax-shield-tick me-1" />
                      Enterprise & Security (36)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                        activeTab === 'overview' ? 'btn-primary' : 'btn-light text-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className="isax isax-document-text me-1" />
                      Overview
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('lecturer')}
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                        activeTab === 'lecturer' ? 'btn-primary' : 'btn-light text-secondary'
                      }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className="isax isax-teacher me-1" />
                      Coordinator
                    </button>
                  </div>

                  {isStaff && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSection(null);
                        setSectionForm({ name: '', summary: '', visible: 1 });
                        setShowSectionModal(true);
                      }}
                      className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-1 fw-semibold"
                      style={{ fontSize: '0.74rem' }}
                    >
                      <i className="feather-plus me-1" />
                      Add Unit
                    </button>
                  )}
                </div>

                {/* OUT LMS Core System Capabilities & Pre-Loaded Sample Telemetry Strip */}
                <div className="row g-2 mb-3">
                  <div className="col-6 col-md-3">
                    <div
                      onClick={() => setActiveTab('syllabus')}
                      className="p-2.5 rounded-3 bg-white border shadow-sm h-100"
                      style={{ cursor: 'pointer', borderLeft: '3px solid #0171BB' }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-0.5">
                        <small className="text-muted fw-semibold" style={{ fontSize: '0.66rem' }}>
                          ADAPTIVE LAYOUT
                        </small>
                        <i className="isax isax-element-3 text-primary" style={{ fontSize: 13 }} />
                      </div>
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.78rem' }}>
                        {activeFormat === 'tiles'
                          ? 'Visual Tiles Grid'
                          : activeFormat === 'onetopic'
                          ? 'Horizontal Unit Tabs'
                          : activeFormat === 'topcoll'
                          ? 'Compact Accordions'
                          : 'Sequential Syllabus'}
                      </div>
                      <small className="text-primary" style={{ fontSize: '0.67rem' }}>
                        {course.sections.length} Active Units →
                      </small>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div
                      onClick={() => setActiveTab('labs')}
                      className="p-2.5 rounded-3 bg-white border shadow-sm h-100"
                      style={{ cursor: 'pointer', borderLeft: '3px solid #0284c7' }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-0.5">
                        <small className="text-muted fw-semibold" style={{ fontSize: '0.66rem' }}>
                          CLOUD LABS &amp; GRADER
                        </small>
                        <i className="isax isax-code text-info" style={{ fontSize: 13 }} />
                      </div>
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.78rem' }}>
                        {vplLabs.length} Labs • {codeRunnerQuestions.length} Suites
                      </div>
                      <small className="text-success fw-semibold" style={{ fontSize: '0.67rem' }}>
                        Sample Score: {vplEvaluation?.grade ?? 100}% →
                      </small>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div
                      onClick={() => setActiveTab('tracking')}
                      className="p-2.5 rounded-3 bg-white border shadow-sm h-100"
                      style={{ cursor: 'pointer', borderLeft: '3px solid #0d9488' }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-0.5">
                        <small className="text-muted fw-semibold" style={{ fontSize: '0.66rem' }}>
                          QR ATTENDANCE
                        </small>
                        <i className="isax isax-calendar-tick text-success" style={{ fontSize: 13 }} />
                      </div>
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.78rem' }}>
                        {attendanceData?.summary?.attendanceRate ?? 75}% Rate
                      </div>
                      <small className="text-secondary" style={{ fontSize: '0.67rem' }}>
                        {attendanceData?.summary?.presentCount ?? 3}/{attendanceData?.summary?.totalSessions ?? 4} Seminars →
                      </small>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div
                      onClick={() => setActiveTab('tracking')}
                      className="p-2.5 rounded-3 bg-white border shadow-sm h-100"
                      style={{ cursor: 'pointer', borderLeft: '3px solid #d97706' }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-0.5">
                        <small className="text-muted fw-semibold" style={{ fontSize: '0.66rem' }}>
                          MILESTONES &amp; CREDENTIAL
                        </small>
                        <i className="isax isax-award text-warning" style={{ fontSize: 13 }} />
                      </div>
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.78rem' }}>
                        {completionProgress?.percentage ?? 71}% • {completionProgress?.xp?.points ?? 825} XP
                      </div>
                      <small className="text-primary fw-semibold" style={{ fontSize: '0.67rem' }}>
                        {customCertData?.verificationCode || 'TCU Accredited'} →
                      </small>
                    </div>
                  </div>
                </div>

                {/* TAB 1: SYLLABUS & LEARNING UNITS */}
                {activeTab === 'syllabus' && (
                  <div>
                    {/* OUT LMS Adaptive Curriculum Layout Switcher */}
                    <div
                      className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2.5 p-2.5 rounded-3 border"
                      style={{ background: 'linear-gradient(90deg, #f0f9ff 0%, #ffffff 100%)', borderColor: '#bae6fd' }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="badge rounded-pill px-2.5 py-1 fw-bold"
                          style={{ background: '#0171BB', color: '#fff', fontSize: '0.68rem' }}
                        >
                          Adaptive Layout Engine
                        </span>
                        <span className="fw-semibold text-dark small" style={{ fontSize: '0.78rem' }}>
                          Active View:{' '}
                          <strong className="text-primary">
                            {activeFormat === 'tiles'
                              ? 'Visual Tiles Grid'
                              : activeFormat === 'onetopic'
                              ? 'Horizontal Unit Tabs'
                              : activeFormat === 'topcoll'
                              ? 'Compact Collapsible Topics'
                              : 'Sequential Academic Syllabus'}
                          </strong>
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-1 flex-wrap">
                        {(availableFormats.length > 0
                          ? availableFormats
                          : [
                              { id: 'tiles', name: 'Tiles Grid' },
                              { id: 'onetopic', name: 'OneTopic Tabs' },
                              { id: 'topcoll', name: 'Collapsed Topics' },
                              { id: 'topics', name: 'Standard List' },
                            ]
                        ).map((fmt: any) => (
                          <button
                            key={fmt.id}
                            type="button"
                            disabled={pluginActionBusy === 'format'}
                            onClick={() => handleSwitchCourseFormat(fmt.id)}
                            className={`btn btn-sm rounded-pill px-2.5 py-0.5 fw-semibold ${
                              activeFormat === fmt.id ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'
                            }`}
                            style={{ fontSize: '0.71rem' }}
                          >
                            {fmt.name.replace(' Format', '')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Activity Real-Time Filter & Search */}
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 p-2 bg-white rounded-3 border">
                      <div className="input-group input-group-sm" style={{ maxWidth: 260 }}>
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          <i className="feather-search" style={{ fontSize: 12 }} />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-light border-start-0"
                          placeholder="Search lessons & topics..."
                          value={activitySearch}
                          onChange={(e) => setActivitySearch(e.target.value)}
                          style={{ fontSize: '0.78rem' }}
                        />
                      </div>

                      <div className="d-flex align-items-center gap-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setActivityTypeFilter('all')}
                          className={`btn btn-sm rounded-pill px-2.5 py-0.5 ${
                            activityTypeFilter === 'all' ? 'btn-dark fw-semibold' : 'btn-light text-muted'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityTypeFilter('page')}
                          className={`btn btn-sm rounded-pill px-2.5 py-0.5 ${
                            activityTypeFilter === 'page' ? 'btn-primary fw-semibold' : 'btn-light text-muted'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          Lectures
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityTypeFilter('quiz')}
                          className={`btn btn-sm rounded-pill px-2.5 py-0.5 ${
                            activityTypeFilter === 'quiz' ? 'btn-danger fw-semibold' : 'btn-light text-muted'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          Quizzes
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityTypeFilter('assign')}
                          className={`btn btn-sm rounded-pill px-2.5 py-0.5 ${
                            activityTypeFilter === 'assign' ? 'btn-warning text-dark fw-semibold' : 'btn-light text-muted'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          Assignments
                        </button>
                        {activeFormat === 'topcoll' && (
                          <button
                            type="button"
                            onClick={() => {
                              const allOpen = filteredSections.every((s) => expandedSections[s.id]);
                              const next: Record<number, boolean> = {};
                              filteredSections.forEach((s) => {
                                next[s.id] = !allOpen;
                              });
                              setExpandedSections(next);
                            }}
                            className="btn btn-sm btn-outline-success rounded-pill px-2.5 py-0.5 fw-semibold"
                            style={{ fontSize: '0.71rem' }}
                          >
                            Toggle All Topics
                          </button>
                        )}
                      </div>
                    </div>

                    {/* OneTopic Horizontal Tab Bar (when activeFormat === 'onetopic') */}
                    {activeFormat === 'onetopic' && filteredSections.length > 0 && (
                      <div className="d-flex gap-1.5 overflow-auto pb-2 mb-3">
                        {filteredSections.map((sec, idx) => (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => setSelectedOneTopicIdx(idx)}
                            className={`btn btn-sm rounded-3 px-3 py-1.5 fw-semibold flex-shrink-0 ${
                              selectedOneTopicIdx === idx ? 'btn-info text-white shadow-sm' : 'btn-white border text-dark'
                            }`}
                            style={{ fontSize: '0.76rem' }}
                          >
                            Unit {sec.section === 0 ? '00' : String(sec.section).padStart(2, '0')}:{' '}
                            {sec.name.length > 26 ? `${sec.name.slice(0, 26)}...` : sec.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Tiles Visual Grid View (when activeFormat === 'tiles') */}
                    {activeFormat === 'tiles' && (
                      <div className="row g-3 mb-3">
                        {filteredSections.map((sec) => {
                          const isOpen = !!expandedSections[sec.id];
                          return (
                            <div className="col-md-6" key={`tile-${sec.id}`}>
                              <div
                                className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden"
                                style={{
                                  border: isOpen ? '2px solid #0171BB' : '1px solid #e2e8f0',
                                  cursor: 'pointer',
                                  transition: 'transform 0.15s ease',
                                }}
                                onClick={() => toggleSection(sec.id)}
                              >
                                <div
                                  className="p-3"
                                  style={{
                                    background: isOpen
                                      ? 'linear-gradient(135deg, #005B97 0%, #0171BB 100%)'
                                      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                    color: isOpen ? '#fff' : '#0f172a',
                                    borderBottom: isOpen ? '2px solid #FFD200' : '1px solid #e2e8f0',
                                  }}
                                >
                                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                                    <span
                                      className="badge rounded-pill px-2.5 py-1"
                                      style={{
                                        background: isOpen ? '#FFD200' : '#0171BB',
                                        color: isOpen ? '#071F38' : '#fff',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                      }}
                                    >
                                      TILE {sec.section === 0 ? '00' : String(sec.section).padStart(2, '0')}
                                    </span>
                                    <span className="small fw-semibold" style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                                      {sec.modules.length} {sec.modules.length === 1 ? 'Activity' : 'Activities'}
                                    </span>
                                  </div>
                                  <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem', color: isOpen ? '#fff' : '#0f172a' }}>
                                    {sec.name}
                                  </h6>
                                  <p
                                    className="mb-0 small"
                                    style={{
                                      fontSize: '0.75rem',
                                      color: isOpen ? 'rgba(255, 255, 255, 0.92)' : '#475569',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {sec.summary || `Interactive learning tile for ${sec.name}.`}
                                  </p>
                                </div>
                                <div className="card-body p-2.5 bg-white d-flex align-items-center justify-content-between">
                                  <span className="small text-primary fw-semibold" style={{ fontSize: '0.74rem' }}>
                                    {isOpen ? 'Hide Tile Activities' : 'Click Tile to Open Activities'}
                                  </span>
                                  <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-primary small`} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="d-flex flex-column gap-2.5">
                      {(activeFormat === 'onetopic'
                        ? filteredSections.filter((_, idx) => idx === selectedOneTopicIdx)
                        : filteredSections
                      ).map((sec) => {
                        const isOpen = activeFormat === 'onetopic' ? true : !!expandedSections[sec.id];
                        return (
                          <div
                            key={sec.id}
                            className="card border-0 shadow-sm rounded-3 overflow-hidden"
                            style={{ border: '1px solid #e2e8f0' }}
                          >
                            <div
                              className="card-header bg-white border-0 p-3 d-flex align-items-center justify-content-between"
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleSection(sec.id)}
                            >
                              <div className="d-flex align-items-center gap-2.5">
                                <span
                                  className="rounded-3 d-inline-flex align-items-center justify-content-center fw-bold"
                                  style={{
                                    width: 32,
                                    height: 32,
                                    background: isOpen ? '#071F38' : '#f1f5f9',
                                    color: isOpen ? '#fbbf24' : '#334155',
                                    fontSize: '0.78rem',
                                  }}
                                >
                                  {sec.section === 0 ? '00' : String(sec.section).padStart(2, '0')}
                                </span>
                                <div>
                                  <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.88rem' }}>
                                    {sec.name}
                                  </h6>
                                  <small className="text-muted" style={{ fontSize: '0.74rem' }}>
                                    {sec.modules.length} {sec.modules.length === 1 ? 'activity' : 'activities'}
                                  </small>
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {isStaff && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light rounded-pill px-2 py-0.5 text-primary"
                                      title="Add Activity"
                                      onClick={() => {
                                        setTargetSectionNum(sec.section);
                                        setModuleForm({ modname: 'page', name: '', intro: '', content: '' });
                                        setShowModuleModal(true);
                                      }}
                                    >
                                      <i className="feather-plus" style={{ fontSize: 12 }} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light rounded-pill px-2 py-0.5 text-secondary"
                                      title="Edit Unit"
                                      onClick={() => {
                                        setEditingSection(sec);
                                        setSectionForm({
                                          name: sec.name,
                                          summary: sec.summary,
                                          visible: sec.visible,
                                        });
                                        setShowSectionModal(true);
                                      }}
                                    >
                                      <i className="feather-edit-2" style={{ fontSize: 12 }} />
                                    </button>
                                    {sec.section > 0 && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-light rounded-pill px-2 py-0.5 text-danger"
                                        title="Remove Unit"
                                        onClick={() => handleDeleteSection(sec)}
                                      >
                                        <i className="feather-trash-2" style={{ fontSize: 12 }} />
                                      </button>
                                    )}
                                  </>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light rounded-circle"
                                  onClick={() => toggleSection(sec.id)}
                                >
                                  <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} small`} />
                                </button>
                              </div>
                            </div>

                            {isOpen && (
                              <div className="card-body pt-0 px-3 pb-3 border-top bg-light bg-opacity-50">
                                {sec.summary && (
                                  <p className="text-muted small mt-2 mb-2.5" style={{ fontSize: '0.8rem' }}>
                                    {sec.summary}
                                  </p>
                                )}

                                {sec.modules.length === 0 ? (
                                  <div className="p-2.5 rounded-3 bg-white border d-flex align-items-center justify-content-between">
                                    <span className="text-muted small" style={{ fontSize: '0.76rem' }}>
                                      Study unit materials and guided readings available in classroom.
                                    </span>
                                    <Link
                                      to={`${routes.courseWatch}?courseId=${course.id}`}
                                      className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-0.5"
                                      style={{ fontSize: '0.72rem' }}
                                    >
                                      Open Classroom
                                    </Link>
                                  </div>
                                ) : (
                                  <div className="d-flex flex-column gap-1.5 mt-2">
                                    {sec.modules.map((mod) => {
                                      const meta = getModuleMeta(mod.modname);
                                      const isDone = completionProgress?.items?.some(
                                        (it: any) => it.cmid === mod.id && it.completed
                                      );
                                      return (
                                        <div
                                          key={mod.id}
                                          className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-white border"
                                        >
                                          <div className="d-flex align-items-center gap-2 overflow-hidden">
                                            <button
                                              type="button"
                                              onClick={() => handleToggleModuleCompletion(mod.id)}
                                              title={isDone ? 'Completed (Click to toggle)' : 'Mark activity complete'}
                                              className={`btn btn-sm rounded-circle p-0 d-inline-flex align-items-center justify-content-center flex-shrink-0 ${
                                                isDone ? 'btn-success text-white' : 'btn-outline-secondary'
                                              }`}
                                              style={{ width: 22, height: 22, fontSize: 11 }}
                                            >
                                              {isDone ? '✓' : ''}
                                            </button>
                                            <span
                                              className="rounded-2 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                                              style={{
                                                width: 28,
                                                height: 28,
                                                background: meta.bg,
                                                color: meta.color,
                                              }}
                                            >
                                              <i className={`isax ${meta.icon}`} style={{ fontSize: 14 }} />
                                            </span>
                                            <div className="overflow-hidden">
                                              <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.82rem' }}>
                                                {mod.name}
                                              </div>
                                              <span
                                                className="badge rounded-pill"
                                                style={{
                                                  background: meta.bg,
                                                  color: meta.color,
                                                  fontSize: '0.64rem',
                                                  fontWeight: 600,
                                                }}
                                              >
                                                {meta.label}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
                                            <Link
                                              to={`${routes.courseWatch}?courseId=${course.id}&cmid=${mod.id}`}
                                              className="btn btn-sm btn-light text-primary fw-semibold rounded-pill px-2.5 py-0.5"
                                              style={{ fontSize: '0.72rem' }}
                                            >
                                              Study <i className="feather-arrow-right ms-1" style={{ fontSize: 11 }} />
                                            </Link>
                                            {isStaff && (
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteModule(mod.id, mod.name)}
                                                className="btn btn-sm btn-light text-danger rounded-circle p-1"
                                                title="Remove Activity"
                                              >
                                                <i className="feather-trash-2" style={{ fontSize: 12 }} />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: CLOUD VIRTUAL LABS & AUTOMATED ASSESSMENT ENGINE */}
                {activeTab === 'labs' && (
                  <div className="d-flex flex-column gap-3">
                    {/* OUT Cloud Virtual Programming Lab & Sandbox IDE */}
                    <div className="card border-0 shadow-sm rounded-3 p-3.5 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2.5 pb-2 border-bottom">
                        <div>
                          <span className="badge bg-info-subtle text-info rounded-pill mb-1" style={{ fontSize: '0.68rem' }}>
                            OUT Cloud Virtual Lab IDE • Multi-Runtime Execution Engine
                          </span>
                          <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.96rem' }}>
                            Interactive Cloud Sandbox IDE &amp; Automated Rubric Evaluator
                          </h6>
                        </div>
                        <div className="d-flex gap-1.5">
                          {vplLabs.map((lab) => (
                            <button
                              key={lab.id}
                              type="button"
                              onClick={() => {
                                setSelectedVplId(lab.id);
                                setVplCode(lab.starterCode || '');
                                setVplLanguage(lab.language || 'python');
                              }}
                              className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${
                                selectedVplId === lab.id ? 'btn-primary' : 'btn-light border text-secondary'
                              }`}
                              style={{ fontSize: '0.73rem' }}
                            >
                              {lab.name.split(':')[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {vplLabs
                        .filter((l) => l.id === selectedVplId)
                        .map((lab) => (
                          <div key={lab.id}>
                            <p className="text-muted small mb-2.5" style={{ fontSize: '0.8rem' }}>
                              <strong>{lab.name}:</strong> {lab.shortdescription}
                            </p>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <label className="small fw-semibold text-secondary" style={{ fontSize: '0.74rem' }}>
                                  Runtime Environment:
                                </label>
                                <select
                                  className="form-select form-select-sm"
                                  style={{ width: 140, fontSize: '0.75rem' }}
                                  value={vplLanguage}
                                  onChange={(e) => setVplLanguage(e.target.value)}
                                >
                                  <option value="python">Python 3.12</option>
                                  <option value="javascript">Node.js (ES2024)</option>
                                  <option value="sql">SQL (MariaDB)</option>
                                  <option value="php">PHP 8.4</option>
                                </select>
                              </div>
                              {lab.submission && (
                                <span className="badge bg-success-subtle text-success rounded-pill" style={{ fontSize: '0.72rem' }}>
                                  Verified Score: {lab.submission.grade}/{lab.maxGrade} ({lab.submission.run_count} executions)
                                </span>
                              )}
                            </div>

                            <textarea
                              className="form-control font-monospace mb-2.5"
                              rows={7}
                              value={vplCode}
                              onChange={(e) => setVplCode(e.target.value)}
                              style={{
                                background: '#0f172a',
                                color: '#e2e8f0',
                                fontSize: '0.79rem',
                                borderRadius: 10,
                                padding: 12,
                              }}
                            />

                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                              <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                                Max Rubric Score: {lab.maxGrade} pts • Submission Window: {lab.duedateFormatted}
                              </small>
                              <button
                                type="button"
                                disabled={pluginActionBusy === 'vpl'}
                                onClick={handleRunVplCode}
                                className="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 fw-bold"
                                style={{ fontSize: '0.78rem' }}
                              >
                                <i className="isax isax-play me-1" />
                                {pluginActionBusy === 'vpl' ? 'Executing in Cloud Sandbox...' : 'Execute & Grade Lab Solution'}
                              </button>
                            </div>

                            {vplEvaluation && (
                              <div className="mt-3 p-3 rounded-3" style={{ background: '#0b172a', color: '#f8fafc' }}>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                  <span className="fw-bold text-warning" style={{ fontSize: '0.8rem' }}>
                                    Automated Cloud Sandbox Telemetry ({vplEvaluation.passedTests}/{vplEvaluation.totalTests} Assertions Passed)
                                  </span>
                                  <span className="badge bg-success rounded-pill" style={{ fontSize: '0.74rem' }}>
                                    Score: {vplEvaluation.grade} / {vplEvaluation.maxGrade}
                                  </span>
                                </div>
                                <pre className="small mb-2 text-info" style={{ fontSize: '0.74rem', whiteSpace: 'pre-wrap' }}>
                                  {vplEvaluation.stdout}
                                </pre>
                                <div className="row g-2">
                                  {(vplEvaluation.tests || []).map((tc: any, idx: number) => (
                                    <div className="col-sm-6" key={idx}>
                                      <div
                                        className="p-2 rounded-2 d-flex align-items-center justify-content-between"
                                        style={{ background: 'rgba(255,255,255,0.06)', fontSize: '0.73rem' }}
                                      >
                                        <span className="text-truncate me-2">{tc.name}</span>
                                        <span className={`badge ${tc.passed ? 'bg-success' : 'bg-danger'}`}>
                                          {tc.passed ? `PASS (${tc.timeMs}ms)` : 'FAIL'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>

                    {/* Automated Algorithmic & Unit-Test Grading Engine */}
                    <div className="card border-0 shadow-sm rounded-3 p-3.5 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2.5 pb-2 border-bottom">
                        <div>
                          <span className="badge bg-warning-subtle text-dark rounded-pill mb-1" style={{ fontSize: '0.68rem' }}>
                            Automated Assessment &amp; Unit-Test Verification Suite
                          </span>
                          <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.96rem' }}>
                            Real-Time Algorithmic Verification &amp; Test-Case Matrix
                          </h6>
                        </div>
                        <div className="d-flex gap-1.5">
                          {codeRunnerQuestions.map((q, idx) => (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => {
                                setSelectedCrId(q.id);
                                setCrAnswerCode(q.starterCode || '');
                              }}
                              className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${
                                selectedCrId === q.id ? 'btn-dark' : 'btn-light border text-secondary'
                              }`}
                              style={{ fontSize: '0.73rem' }}
                            >
                              Assessment {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      {codeRunnerQuestions
                        .filter((q) => q.id === selectedCrId)
                        .map((q) => (
                          <div key={q.id}>
                            <p className="text-dark small fw-semibold mb-1" style={{ fontSize: '0.82rem' }}>
                              {q.name}
                            </p>
                            <p className="text-muted small mb-2.5" style={{ fontSize: '0.78rem' }}>
                              {q.prompt}
                            </p>
                            <textarea
                              className="form-control font-monospace mb-2.5"
                              rows={5}
                              value={crAnswerCode}
                              onChange={(e) => setCrAnswerCode(e.target.value)}
                              style={{
                                background: '#1e293b',
                                color: '#f8fafc',
                                fontSize: '0.79rem',
                                borderRadius: 10,
                                padding: 12,
                              }}
                            />
                            <div className="d-flex justify-content-end">
                              <button
                                type="button"
                                disabled={pluginActionBusy === 'coderunner'}
                                onClick={handleEvaluateCodeRunner}
                                className="btn btn-sm btn-warning fw-bold rounded-pill px-3.5 py-1.5"
                                style={{ fontSize: '0.78rem', color: '#0f172a' }}
                              >
                                <i className="isax isax-tick-circle me-1" />
                                {pluginActionBusy === 'coderunner' ? 'Verifying Assertions...' : 'Verify Solution Against Test Suite'}
                              </button>
                            </div>

                            {crEvaluation && (
                              <div className="mt-3 p-3 rounded-3 border" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                  <span className="fw-bold text-success small">
                                    Automated Verification Matrix — {crEvaluation.passedCount}/{crEvaluation.totalCount} Assertions Passed
                                  </span>
                                  <span className="badge bg-success rounded-pill">
                                    Score: {crEvaluation.score} / {crEvaluation.maxScore}
                                  </span>
                                </div>
                                <div className="table-responsive">
                                  <table className="table table-sm table-bordered mb-0 bg-white small" style={{ fontSize: '0.74rem' }}>
                                    <thead className="table-light">
                                      <tr>
                                        <th>Assertion Input</th>
                                        <th>Expected Output</th>
                                        <th>Actual Output</th>
                                        <th>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(crEvaluation.testResults || []).map((tr: any) => (
                                        <tr key={tr.index}>
                                          <td className="font-monospace">{tr.testcode}</td>
                                          <td className="font-monospace">{tr.expected}</td>
                                          <td className="font-monospace">{tr.got}</td>
                                          <td>
                                            <span className={`badge ${tr.passed ? 'bg-success' : 'bg-danger'}`}>
                                              {tr.passed ? '✓ PASS' : '✗ FAIL'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: ATTENDANCE, MILESTONE TELEMETRY & VERIFIABLE CREDENTIALS */}
                {activeTab === 'tracking' && (
                  <div className="d-flex flex-column gap-3">
                    {/* Interactive Milestone Completion Telemetry & Scholar Merit XP */}
                    {completionProgress && (
                      <div className="card border-0 shadow-sm rounded-3 p-3.5 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2.5">
                          <div>
                            <span className="badge bg-success-subtle text-success rounded-pill mb-1" style={{ fontSize: '0.68rem' }}>
                              OUT Milestone Telemetry &amp; Academic Merit Engine
                            </span>
                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.94rem' }}>
                              Interactive Competency Progress Bar &amp; Scholar XP Progression
                            </h6>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge rounded-pill px-3 py-1" style={{ background: '#071F38', color: '#FFD200', fontSize: '0.74rem' }}>
                              Level {completionProgress.xp?.level} • {completionProgress.xp?.points} XP
                            </span>
                            <span className="badge bg-primary rounded-pill px-2.5 py-1" style={{ fontSize: '0.74rem' }}>
                              {completionProgress.percentage}% Complete
                            </span>
                          </div>
                        </div>

                        <p className="text-muted small mb-2" style={{ fontSize: '0.76rem' }}>
                          Click any milestone segment below to synchronize completion status and award Scholar Merit XP in real time:
                        </p>

                        <div className="d-flex gap-1 mb-2.5" style={{ height: 22 }}>
                          {(completionProgress.items || []).map((item: any) => (
                            <div
                              key={item.cmid}
                              onClick={() => handleToggleModuleCompletion(item.cmid)}
                              title={`${item.name} — ${item.statusLabel} (Click to toggle)`}
                              className="flex-grow-1 rounded-1 d-flex align-items-center justify-content-center text-white fw-bold"
                              style={{
                                background: item.completed ? '#10b981' : '#0171BB',
                                cursor: 'pointer',
                                fontSize: '0.65rem',
                                opacity: pluginActionBusy === `comp-${item.cmid}` ? 0.5 : 1,
                              }}
                            >
                              {item.completed ? '✓' : '•'}
                            </div>
                          ))}
                        </div>

                        <div className="d-flex justify-content-between small text-muted" style={{ fontSize: '0.73rem' }}>
                          <span>
                            Completed Milestones: <strong>{completionProgress.completedModules}</strong> of{' '}
                            <strong>{completionProgress.totalModules}</strong>
                          </span>
                          <span>Academic Merit Standing: <strong>{completionProgress.xp?.badgeTitle}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* SARIS Digital Attendance & Rotating QR Check-In System */}
                    {attendanceData && (
                      <div className="card border-0 shadow-sm rounded-3 p-3.5 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2.5 pb-2 border-bottom">
                          <div>
                            <span className="badge bg-primary-subtle text-primary rounded-pill mb-1" style={{ fontSize: '0.68rem' }}>
                              SARIS Biometric &amp; Rotating QR Digital Attendance System
                            </span>
                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.94rem' }}>
                              {attendanceData.name}
                            </h6>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1" style={{ fontSize: '0.73rem' }}>
                              Attendance Rate: {attendanceData.summary?.attendanceRate}% ({attendanceData.summary?.earnedPoints}/
                              {attendanceData.summary?.maxPoints} pts)
                            </span>
                            {isStaff && (
                              <button
                                type="button"
                                disabled={pluginActionBusy === 'att-create'}
                                onClick={handleCreateAttendanceSession}
                                className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-0.5 fw-semibold"
                                style={{ fontSize: '0.72rem' }}
                              >
                                + Schedule Seminar Session
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="d-flex flex-column gap-2">
                          {(attendanceData.sessions || []).map((sess: any) => (
                            <div
                              key={sess.id}
                              className="p-2.5 rounded-3 border d-flex align-items-center justify-content-between flex-wrap gap-2 bg-light bg-opacity-50"
                            >
                              <div>
                                <div className="fw-semibold text-dark" style={{ fontSize: '0.82rem' }}>
                                  {sess.description}
                                </div>
                                <div className="d-flex align-items-center gap-2 flex-wrap mt-0.5">
                                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                                    <i className="isax isax-calendar-1 me-1" />
                                    {sess.dateFormatted} ({sess.durationMinutes} mins)
                                  </small>
                                  <span className="badge bg-white border text-secondary" style={{ fontSize: '0.66rem' }}>
                                    QR Passkey: {sess.qrPasskey}
                                  </span>
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-1.5">
                                <span
                                  className={`badge rounded-pill px-2.5 py-1 ${
                                    sess.statusAcronym === 'P'
                                      ? 'bg-success'
                                      : sess.statusAcronym === 'L' || sess.statusAcronym === 'E'
                                      ? 'bg-warning text-dark'
                                      : 'bg-secondary'
                                  }`}
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {sess.statusDescription} ({sess.points}/{sess.maxPoints} pts)
                                </span>
                                <button
                                  type="button"
                                  disabled={pluginActionBusy === `att-${sess.id}`}
                                  onClick={() => handleAttendanceCheckIn(sess.id, 'P')}
                                  className="btn btn-sm btn-primary rounded-pill px-2.5 py-0.5 fw-semibold"
                                  style={{ fontSize: '0.72rem' }}
                                >
                                  {pluginActionBusy === `att-${sess.id}` ? 'Verifying...' : 'Verify QR Check-In'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verifiable Digital Credential Engine & Scholar Retention Automation */}
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="card h-100 border-0 shadow-sm rounded-3 p-3.5 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                          <span className="badge bg-warning-subtle text-dark rounded-pill mb-1 align-self-start" style={{ fontSize: '0.68rem' }}>
                            TCU &amp; SARIS Verifiable Credential Engine
                          </span>
                          <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                            {customCertData?.name || `${course.shortname} Accredited Digital Certificate`}
                          </h6>
                          <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                            Scholar: <strong>{customCertData?.recipientName || 'Baraka Mkwawa'}</strong>
                            <br />
                            Cryptographic Serial:{' '}
                            <code className="fw-bold text-primary">{customCertData?.verificationCode || 'OUT-2026-CRED'}</code>
                          </p>
                          <div className="d-flex gap-1.5 mt-auto">
                            <button
                              type="button"
                              disabled={pluginActionBusy === 'cert'}
                              onClick={handleIssueCustomCertificate}
                              className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-semibold"
                              style={{ fontSize: '0.73rem' }}
                            >
                              {pluginActionBusy === 'cert' ? 'Generating...' : 'Generate / Re-Issue Credential'}
                            </button>
                            {customCertData?.verifyUrl && (
                              <Link
                                to={customCertData.verifyUrl}
                                className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 fw-semibold"
                                style={{ fontSize: '0.73rem' }}
                              >
                                Verify Serial
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card h-100 border-0 shadow-sm rounded-3 p-3.5 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                          <span className="badge bg-info-subtle text-info rounded-pill mb-1 align-self-start" style={{ fontSize: '0.68rem' }}>
                            Intelligent Scholar Retention Engine
                          </span>
                          <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                            {reengagementNudges[0]?.name || `${course.shortname} Study Momentum Automation`}
                          </h6>
                          <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                            Cadence: Every <strong>{reengagementNudges[0]?.durationDays || 7} days</strong> • Dispatched:{' '}
                            <strong>{reengagementNudges[0]?.remindercount || 3} cohort alerts</strong>
                          </p>
                          <div className="mt-auto">
                            <button
                              type="button"
                              disabled={pluginActionBusy === 'reeng'}
                              onClick={handleTriggerReengagement}
                              className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-semibold"
                              style={{ fontSize: '0.73rem' }}
                            >
                              {pluginActionBusy === 'reeng' ? 'Dispatching...' : 'Dispatch Momentum Alert'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3B: AI TUTOR, INTERACTIVE VIDEO STUDIO & RICH AUTHORING (29 CAPABILITIES) */}
                {activeTab === 'ai-media' && (
                  <div className="d-flex flex-column gap-3">
                    {/* Interactive AI Socratic Tutor & Bilingual Translator Console */}
                    <div
                      className="card border-0 shadow-sm rounded-3 p-3.5"
                      style={{
                        background: 'linear-gradient(135deg, #071F38 0%, #0d325c 100%)',
                        color: '#fff',
                        border: '1px solid #1e3a5f',
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                        <div>
                          <span
                            className="badge rounded-pill px-2.5 py-1 mb-1"
                            style={{ background: '#FFD200', color: '#071F38', fontSize: '0.68rem', fontWeight: 700 }}
                          >
                            OUT Sovereign AI Socratic Tutor • Bilingual EN/SW Translator • Multi-Model LLM Hub
                          </span>
                          <h6 className="fw-bold text-white mb-0" style={{ fontSize: '0.96rem' }}>
                            Interactive AI Academic Co-Pilot &amp; Media Synthesis Console — {course.shortname}
                          </h6>
                        </div>
                        <span className="badge bg-success rounded-pill px-2.5 py-1" style={{ fontSize: '0.71rem' }}>
                          29 Active Capabilities • Pre-Seeded Sample Data
                        </span>
                      </div>
                      <p className="mb-2.5" style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.85)' }}>
                        Execute real-time Socratic tutoring, English ↔ Kiswahili neural curriculum translation, AI rubric synthesis, or interactive video annotation directly against the OUT LMS backend:
                      </p>
                      <div className="d-flex gap-2 flex-wrap">
                        <input
                          type="text"
                          value={aiPromptInput}
                          onChange={(e) => setAiPromptInput(e.target.value)}
                          className="form-control form-control-sm flex-grow-1"
                          placeholder="Ask the AI Socratic Tutor or request Kiswahili/English translation..."
                          style={{
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.28)',
                            color: '#fff',
                            fontSize: '0.8rem',
                          }}
                        />
                        <button
                          type="button"
                          disabled={pluginActionBusy === 'ent-local_dttutor'}
                          onClick={() => {
                            const tutorFeat = enterpriseFeatures.find((f) => f.component === 'local_dttutor') || {
                              component: 'local_dttutor',
                              feature_code: 'AI_SOCRATIC_TUTOR',
                              suite: 'ai_tutor',
                              title: '24/7 AI Socratic Digital Tutor & Scholar Mentor',
                              post_action: 'invoke_ai_tutor_action',
                            };
                            handleExecuteEnterpriseFeature(tutorFeat, aiPromptInput);
                          }}
                          className="btn btn-warning btn-sm rounded-pill px-3 fw-bold"
                          style={{ fontSize: '0.76rem', color: '#071F38' }}
                        >
                          {pluginActionBusy === 'ent-local_dttutor' ? 'Synthesizing...' : 'Run AI Socratic Tutor (POST)'}
                        </button>
                        <button
                          type="button"
                          disabled={pluginActionBusy === 'ent-local_coursetranslate'}
                          onClick={() => {
                            const transFeat = enterpriseFeatures.find((f) => f.component === 'local_coursetranslate') || {
                              component: 'local_coursetranslate',
                              feature_code: 'NEURAL_BILINGUAL_TRANSLATOR',
                              suite: 'ai_tutor',
                              title: 'Instant Neural English ↔ Kiswahili Curriculum Translator',
                              post_action: 'invoke_ai_tutor_action',
                            };
                            handleExecuteEnterpriseFeature(
                              transFeat,
                              `Translate ${course.shortname} Unit 1 & 2 into Kiswahili with academic glossary parity`
                            );
                          }}
                          className="btn btn-outline-light btn-sm rounded-pill px-3 fw-semibold"
                          style={{ fontSize: '0.76rem' }}
                        >
                          Translate EN ↔ Kiswahili
                        </button>
                      </div>
                    </div>

                    {['ai_tutor', 'interactive_media', 'authoring_protection'].map((suiteKey) => {
                      const suiteObj = enterpriseSuites.find((s) => s.suite === suiteKey);
                      const featuresList = suiteObj?.features || enterpriseFeatures.filter((f) => f.suite === suiteKey);
                      if (!featuresList || featuresList.length === 0) return null;

                      const suiteMeta: Record<string, { badge: string; accent: string; subtitle: string }> = {
                        ai_tutor: {
                          badge: 'Suite 1 • 9 Active Capabilities',
                          accent: '#0171BB',
                          subtitle:
                            'Socratic Tutoring, AI Syllabus Synthesis, Adaptive Recommendations, Virtual Avatar Presenter, Bilingual Translation & Multi-LLM Routing',
                        },
                        interactive_media: {
                          badge: 'Suite 2 • 11 Active Capabilities',
                          accent: '#0d9488',
                          subtitle:
                            'Granular Watch-Time Heatmaps, Time-Stamped Annoto Notes, Viva Reflections, Live Sentiment Reactions, Gatekeeper Checkpoints & OTTFlix 4K VOD',
                        },
                        authoring_protection: {
                          badge: 'Suite 4 • 9 Active Capabilities',
                          accent: '#7c3aed',
                          subtitle:
                            '3D Page-Flipping Textbooks, AES-256 Watermarked DRM PDFs, Collaborative Vector Whiteboards, PowerPoint Book Importer & Pedagogical Callouts',
                        },
                      };
                      const meta = suiteMeta[suiteKey] || { badge: 'Active Suite', accent: '#0171BB', subtitle: '' };

                      return (
                        <div
                          key={suiteKey}
                          className="card border-0 shadow-sm rounded-3 p-3.5 bg-white"
                          style={{ border: '1px solid #e2e8f0', borderTop: `3px solid ${meta.accent}` }}
                        >
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2.5 pb-2 border-bottom">
                            <div>
                              <span
                                className="badge rounded-pill px-2.5 py-0.5 mb-1"
                                style={{ background: `${meta.accent}18`, color: meta.accent, fontSize: '0.68rem', fontWeight: 700 }}
                              >
                                {meta.badge}
                              </span>
                              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.94rem' }}>
                                {suiteObj?.suite_label || suiteKey}
                              </h6>
                              <small className="text-muted" style={{ fontSize: '0.73rem' }}>
                                {meta.subtitle}
                              </small>
                            </div>
                          </div>

                          <div className="row g-2.5">
                            {featuresList.map((feat: any) => {
                              const isBusy = pluginActionBusy === `ent-${feat.component}`;
                              const latestSample = (feat.sample_items || [])[0];
                              return (
                                <div className="col-md-6" key={feat.component}>
                                  <div
                                    className="p-2.5 rounded-3 border h-100 d-flex flex-column justify-content-between"
                                    style={{ background: '#f8fafc' }}
                                  >
                                    <div>
                                      <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                                        <span
                                          className="badge bg-white border text-primary fw-bold"
                                          style={{ fontSize: '0.64rem' }}
                                        >
                                          {feat.status_badge}
                                        </span>
                                        <span
                                          className="badge bg-success-subtle text-success rounded-pill"
                                          style={{ fontSize: '0.64rem' }}
                                        >
                                          {feat.metric_label}
                                        </span>
                                      </div>
                                      <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.82rem' }}>
                                        {feat.title}
                                      </div>
                                      <p className="text-muted mb-1.5" style={{ fontSize: '0.73rem', lineHeight: 1.45 }}>
                                        {feat.summary}
                                      </p>
                                      {latestSample && (
                                        <div
                                          className="p-1.5 rounded-2 bg-white border mb-2"
                                          style={{ fontSize: '0.69rem', color: '#334155' }}
                                        >
                                          <strong className="text-primary">Sample Record:</strong> {latestSample.label}
                                        </div>
                                      )}
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between pt-1 border-top">
                                      <small className="text-muted" style={{ fontSize: '0.67rem' }}>
                                        Verified Runs: <strong>{feat.interactions_count}</strong>
                                      </small>
                                      <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={() => handleExecuteEnterpriseFeature(feat)}
                                        className="btn btn-sm btn-primary rounded-pill px-2.5 py-0.5 fw-semibold"
                                        style={{ fontSize: '0.69rem' }}
                                      >
                                        {isBusy ? 'Running...' : 'Execute & Verify (POST)'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB 3C: ENTERPRISE GOVERNANCE, ANALYTICS, COMMERCE & SECURITY HUB (36 CAPABILITIES) */}
                {activeTab === 'enterprise' && (
                  <div className="d-flex flex-column gap-3">
                    {/* Suite Filter Bar */}
                    <div className="card border-0 shadow-sm rounded-3 p-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                        <div>
                          <span className="badge bg-primary-subtle text-primary rounded-pill mb-1" style={{ fontSize: '0.68rem' }}>
                            OUT LMS Core System Features • Zero Third-Party Branding • Full GET &amp; POST API Coverage
                          </span>
                          <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>
                            Enterprise Governance, Learner Analytics, SARIS Commerce &amp; Security Hub — {course.shortname}
                          </h6>
                        </div>
                        <span className="badge bg-dark rounded-pill px-2.5 py-1" style={{ fontSize: '0.7rem' }}>
                          36 Active Governance &amp; Analytics Capabilities
                        </span>
                      </div>

                      <div className="d-flex gap-1.5 flex-wrap">
                        {[
                          { id: 'all', label: 'All Suites (36)' },
                          { id: 'learner_analytics', label: 'Learner Analytics & KPIs (9)' },
                          { id: 'curriculum_governance', label: 'Curriculum & Senate QA (9)' },
                          { id: 'campus_operations', label: 'SARIS & Tuition Commerce (7)' },
                          { id: 'security_governance', label: 'OrigAI & Security Shield (7)' },
                          { id: 'credentials_quests', label: 'Blockchain Badges & Quests (4)' },
                        ].map((tabItem) => (
                          <button
                            key={tabItem.id}
                            type="button"
                            onClick={() => setSelectedEnterpriseSuiteFilter(tabItem.id)}
                            className={`btn btn-sm rounded-pill px-2.5 py-0.5 fw-semibold ${
                              selectedEnterpriseSuiteFilter === tabItem.id
                                ? 'btn-primary'
                                : 'btn-light border text-secondary'
                            }`}
                            style={{ fontSize: '0.72rem' }}
                          >
                            {tabItem.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {[
                      'learner_analytics',
                      'curriculum_governance',
                      'campus_operations',
                      'security_governance',
                      'credentials_quests',
                    ]
                      .filter((sk) => selectedEnterpriseSuiteFilter === 'all' || selectedEnterpriseSuiteFilter === sk)
                      .map((suiteKey) => {
                        const suiteObj = enterpriseSuites.find((s) => s.suite === suiteKey);
                        const featuresList = suiteObj?.features || enterpriseFeatures.filter((f) => f.suite === suiteKey);
                        if (!featuresList || featuresList.length === 0) return null;

                        const suiteColors: Record<string, string> = {
                          learner_analytics: '#0284c7',
                          curriculum_governance: '#d97706',
                          campus_operations: '#059669',
                          security_governance: '#dc2626',
                          credentials_quests: '#4f46e5',
                        };
                        const accent = suiteColors[suiteKey] || '#0171BB';

                        return (
                          <div
                            key={suiteKey}
                            className="card border-0 shadow-sm rounded-3 p-3.5 bg-white"
                            style={{ border: '1px solid #e2e8f0', borderTop: `3px solid ${accent}` }}
                          >
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2.5 pb-2 border-bottom">
                              <div>
                                <span
                                  className="badge rounded-pill px-2.5 py-0.5 mb-1"
                                  style={{ background: `${accent}18`, color: accent, fontSize: '0.68rem', fontWeight: 700 }}
                                >
                                  {featuresList.length} Active Capabilities • Pre-Seeded Course Telemetry
                                </span>
                                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.94rem' }}>
                                  {suiteObj?.suite_label || suiteKey}
                                </h6>
                              </div>
                            </div>

                            <div className="row g-2.5">
                              {featuresList.map((feat: any) => {
                                const isBusy = pluginActionBusy === `ent-${feat.component}`;
                                const latestSample = (feat.sample_items || [])[0];
                                return (
                                  <div className="col-md-6" key={feat.component}>
                                    <div
                                      className="p-2.5 rounded-3 border h-100 d-flex flex-column justify-content-between"
                                      style={{ background: '#f8fafc' }}
                                    >
                                      <div>
                                        <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
                                          <span
                                            className="badge bg-white border text-dark fw-bold"
                                            style={{ fontSize: '0.64rem' }}
                                          >
                                            {feat.status_badge}
                                          </span>
                                          <span
                                            className="badge bg-primary-subtle text-primary rounded-pill"
                                            style={{ fontSize: '0.64rem' }}
                                          >
                                            {feat.metric_label}
                                          </span>
                                        </div>
                                        <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.82rem' }}>
                                          {feat.title}
                                        </div>
                                        <p className="text-muted mb-1.5" style={{ fontSize: '0.73rem', lineHeight: 1.45 }}>
                                          {feat.summary}
                                        </p>
                                        {latestSample && (
                                          <div
                                            className="p-1.5 rounded-2 bg-white border mb-2"
                                            style={{ fontSize: '0.69rem', color: '#334155' }}
                                          >
                                            <strong style={{ color: accent }}>Sample Telemetry:</strong> {latestSample.label}
                                          </div>
                                        )}
                                      </div>
                                      <div className="d-flex align-items-center justify-content-between pt-1 border-top">
                                        <small className="text-muted" style={{ fontSize: '0.67rem' }}>
                                          Verified Runs: <strong>{feat.interactions_count}</strong>
                                        </small>
                                        <button
                                          type="button"
                                          disabled={isBusy}
                                          onClick={() => handleExecuteEnterpriseFeature(feat)}
                                          className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-0.5 fw-semibold"
                                          style={{ fontSize: '0.69rem' }}
                                        >
                                          {isBusy ? 'Executing...' : 'Trigger Live Action (POST)'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* TAB 4: PROGRAMME OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="card border-0 shadow-sm rounded-3 p-4 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>About {course.fullname}</h5>
                    <p className="text-muted mb-3.5" style={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
                      {course.summary ||
                        'This accredited Open University of Tanzania programme equips scholars with rigorous theoretical foundations and applied competencies tailored for East African and global enterprises.'}
                    </p>

                    <h6 className="fw-bold text-dark mb-2.5" style={{ fontSize: '0.92rem' }}>Key Programme Outcomes & Competencies</h6>
                    <div className="row g-2.5 mb-3.5">
                      {course.sections.slice(0, 6).map((sec, idx) => (
                        <div className="col-md-6" key={sec.id}>
                          <div className="d-flex align-items-start gap-2 p-2.5 rounded-2 bg-light h-100">
                            <span
                              className="badge rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 22, height: 22, background: '#071F38', color: '#fbbf24', fontSize: '0.7rem' }}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <div className="fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>
                                {sec.name}
                              </div>
                              <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                                {sec.summary || `Master core concepts and practical exercises in ${sec.name}.`}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="row g-2 pt-2 border-top">
                      <div className="col-sm-4">
                        <div className="p-2.5 rounded-2 bg-light text-center">
                          <div className="fw-bold text-primary" style={{ fontSize: '0.84rem' }}>{course.shortname}</div>
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>Programme Code</small>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="p-2.5 rounded-2 bg-light text-center">
                          <div className="fw-bold text-dark" style={{ fontSize: '0.84rem' }}>Blended & ODL</div>
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>Delivery Mode</small>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="p-2.5 rounded-2 bg-light text-center">
                          <div className="fw-bold text-success" style={{ fontSize: '0.84rem' }}>TCU Accredited</div>
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>Quality Assurance</small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: COURSE LECTURER */}
                {activeTab === 'lecturer' && (
                  <div className="card border-0 shadow-sm rounded-3 p-4 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                    <div className="d-sm-flex align-items-center gap-3 mb-3">
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.fullname}
                        className="rounded-3 border"
                        style={{ width: 72, height: 72, objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = '/assets/img/user/user-01.jpg';
                        }}
                      />
                      <div>
                        <span className="badge bg-primary-subtle text-primary rounded-pill mb-1" style={{ fontSize: '0.7rem' }}>
                          {course.instructor.role}
                        </span>
                        <h5 className="fw-bold text-dark mb-0.5" style={{ fontSize: '1rem' }}>{course.instructor.fullname}</h5>
                        <p className="text-muted small mb-0" style={{ fontSize: '0.76rem' }}>
                          {course.instructor.department} • {course.category_name}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted small mb-3" style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
                      {course.instructor.bio}
                    </p>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2.5 border-top">
                      <span className="small text-muted" style={{ fontSize: '0.76rem' }}>
                        <i className="isax isax-sms text-primary me-1" />
                        {course.instructor.email}
                      </span>
                      <Link
                        to={`${routes.instructorDetails}?id=${course.instructor.id}`}
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                        style={{ fontSize: '0.74rem' }}
                      >
                        Academic Profile
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Specifications & Related Programmes */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3" style={{ border: '1px solid #e2e8f0' }}>
                  <img
                    src={course.courseImage}
                    alt={course.fullname}
                    className="w-100 rounded-3 mb-3"
                    style={{ height: 155, objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = '/assets/img/course/thumbnails/course-2-cs101.svg';
                    }}
                  />
                  <h6 className="fw-bold text-dark mb-2.5" style={{ fontSize: '0.88rem' }}>Specifications</h6>
                  <ul className="list-unstyled mb-3 small d-flex flex-column gap-1.5" style={{ fontSize: '0.76rem' }}>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Code</span>
                      <span className="fw-semibold text-dark">{course.shortname}</span>
                    </li>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Faculty</span>
                      <span className="fw-semibold text-dark text-end text-truncate" style={{ maxWidth: 170 }}>
                        {course.category_name}
                      </span>
                    </li>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Study Units</span>
                      <span className="fw-semibold text-dark">{course.sections.length} Units</span>
                    </li>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Activities</span>
                      <span className="fw-semibold text-dark">{course.modules_count} Modules</span>
                    </li>
                    <li className="d-flex justify-content-between py-1 border-bottom">
                      <span className="text-muted">Enrolled</span>
                      <span className="fw-semibold text-dark">{course.participants_count} Scholars</span>
                    </li>
                    <li className="d-flex justify-content-between py-1">
                      <span className="text-muted">Assessment</span>
                      <span className="fw-semibold text-success">Continuous + Final</span>
                    </li>
                  </ul>

                  <div className="d-grid gap-1.5">
                    <Link
                      to={`${routes.courseCheckout}?id=${course.id}`}
                      className="btn btn-primary rounded-pill fw-semibold py-1.5"
                      style={{ fontSize: '0.82rem' }}
                    >
                      Enrol in {course.shortname} ({course.priceFormatted})
                    </Link>
                    <Link
                      to={`${routes.courseWatch}?courseId=${course.id}`}
                      className="btn btn-outline-secondary rounded-pill fw-semibold py-1.5"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Open Digital Classroom
                    </Link>
                  </div>
                </div>

                {/* Related Programmes List */}
                {relatedCourses.length > 0 && (
                  <div className="card border-0 shadow-sm rounded-3 p-3 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                    <h6 className="fw-bold text-dark mb-2.5 px-1" style={{ fontSize: '0.86rem' }}>
                      Related Programmes
                    </h6>
                    <div className="d-flex flex-column gap-2">
                      {relatedCourses.map((rc) => (
                        <div
                          key={rc.id}
                          onClick={() => handleSelectCourse(rc.id)}
                          className="d-flex align-items-center gap-2 p-2 rounded-2 border bg-light bg-opacity-50"
                          style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          <img
                            src={rc.courseImage}
                            alt={rc.fullname}
                            className="rounded-2 flex-shrink-0"
                            style={{ width: 50, height: 42, objectFit: 'cover' }}
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.onerror = null;
                              target.src = '/assets/img/course/thumbnails/course-2-cs101.svg';
                            }}
                          />
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex align-items-center justify-content-between mb-0.5">
                              <span className="badge bg-primary-subtle text-primary" style={{ fontSize: '0.64rem' }}>
                                {rc.shortname}
                              </span>
                              <span className="fw-bold text-dark" style={{ fontSize: '0.72rem' }}>
                                {rc.priceFormatted}
                              </span>
                            </div>
                            <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.78rem' }}>
                              {rc.fullname}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Sticky Bottom Enrollment Action Bar */}
      {course && (
        <div
          className="d-lg-none position-fixed bottom-0 start-0 end-0 bg-white border-top shadow-lg p-2.5 px-3 d-flex align-items-center justify-content-between"
          style={{ zIndex: 1040 }}
        >
          <div>
            <span className="text-muted small d-block" style={{ fontSize: '0.7rem' }}>Total Fee</span>
            <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{course.priceFormatted}</span>
          </div>
          <div className="d-flex gap-1.5">
            <Link
              to={`${routes.courseWatch}?courseId=${course.id}`}
              className="btn btn-outline-primary btn-sm rounded-pill fw-semibold px-2.5"
              style={{ fontSize: '0.74rem' }}
            >
              Classroom
            </Link>
            <Link
              to={`${routes.courseCheckout}?id=${course.id}`}
              className="btn btn-primary btn-sm rounded-pill fw-semibold px-3"
              style={{ fontSize: '0.76rem' }}
            >
              Enrol Now
            </Link>
          </div>
        </div>
      )}

      {/* Staff Add/Edit Unit Modal */}
      {showSectionModal && (
        <div className="modal d-block" style={{ background: 'rgba(15,23,42,0.55)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <form onSubmit={handleSaveSection}>
                <div className="modal-header border-0 pb-0">
                  <h6 className="modal-title fw-bold">
                    {editingSection ? `Edit Unit: ${editingSection.name}` : 'Add New Study Unit'}
                  </h6>
                  <button type="button" className="btn-close" onClick={() => setShowSectionModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Unit Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={sectionForm.name}
                      onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                      placeholder="e.g., Unit 4: Distributed Consensus & Replication"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Unit Summary & Objectives</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      value={sectionForm.summary}
                      onChange={(e) => setSectionForm({ ...sectionForm, summary: e.target.value })}
                      placeholder="Key learning objectives and readings covered in this unit..."
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-sm btn-light rounded-pill" onClick={() => setShowSectionModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-sm btn-primary rounded-pill px-4">
                    {submitting ? 'Saving...' : 'Save Unit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Staff Add Learning Activity Modal */}
      {showModuleModal && (
        <div className="modal d-block" style={{ background: 'rgba(15,23,42,0.55)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <form onSubmit={handleAddModule}>
                <div className="modal-header border-0 pb-0">
                  <h6 className="modal-title fw-bold">Add Activity to Unit {targetSectionNum}</h6>
                  <button type="button" className="btn-close" onClick={() => setShowModuleModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Activity Type</label>
                    <select
                      className="form-select form-select-sm"
                      value={moduleForm.modname}
                      onChange={(e) => setModuleForm({ ...moduleForm, modname: e.target.value })}
                    >
                      <option value="page">Lecture Notes / Reading Page</option>
                      <option value="quiz">Automated Assessment &amp; Unit-Test Quiz</option>
                      <option value="assign">Coursework Assignment</option>
                      <option value="vpl">OUT Cloud Virtual Programming Lab IDE</option>
                      <option value="attendance">SARIS Digital Attendance &amp; QR Check-In Register</option>
                      <option value="customcert">TCU &amp; SARIS Verifiable Digital Credential</option>
                      <option value="reengagement">Automated Scholar Retention &amp; Momentum Alert</option>
                      <option value="forum">Discussion Seminar Forum</option>
                      <option value="url">External Academic Resource Link</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Activity Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={moduleForm.name}
                      onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                      placeholder="e.g., Lecture 4.1: Fault Tolerance & Consensus"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Summary / Study Instructions</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      value={moduleForm.intro}
                      onChange={(e) => setModuleForm({ ...moduleForm, intro: e.target.value, content: e.target.value })}
                      placeholder="Instructions or lecture content..."
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-sm btn-light rounded-pill" onClick={() => setShowModuleModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-sm btn-primary rounded-pill px-4">
                    {submitting ? 'Adding...' : 'Add Activity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
