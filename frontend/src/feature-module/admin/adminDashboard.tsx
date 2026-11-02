import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CorporateAdminSidebar from './common/corporateAdminSidebar';
import CorporateAdminHeader from './common/corporateAdminHeader';
import SiteAdminHub from './common/siteAdminHub';
import CourseSettingsStudio from './common/courseSettingsStudio';
import {
  adminService,
  PlatformTelemetry,
  UniversityUserRecord,
  AuditLedgerRecord,
  SystemHealthRecord,
  MoodlePluginRecord,
  PluginTypeGroup,
  AdminSettingsPayload,
  AdminCourseRecord,
  CourseCategoryRecord,
  AdminCategoryNode,
  AdminCourseCategory,
  CourseDefaultSettings,
} from '../../core/api/adminService';

export const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');

  // Sidebar collapse toggle
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Active view: 'dashboard' (exact PBZ Corporate LMS overview) or submodules
  const [activeView, setActiveView] = useState<string>(
    urlTab && ['courses', 'siteadmin', 'reports', 'settings', 'users', 'ledger', 'health', 'plugins'].includes(urlTab)
      ? urlTab
      : 'dashboard'
  );

  // Sync tab with URL
  useEffect(() => {
    if (urlTab && ['courses', 'siteadmin', 'reports', 'settings', 'users', 'ledger', 'health', 'plugins'].includes(urlTab)) {
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

  // State Management
  const [telemetry, setTelemetry] = useState<PlatformTelemetry>({
    totalStudents: 6,
    activeInstructors: 3,
    publishedCourses: 1,
    totalTuitionTzs: 'TZS 0.00',
    pesapalTransactionsCount: 5,
    systemUptime: '99.98%',
  });
  const [users, setUsers] = useState<UniversityUserRecord[]>([]);
  const [ledger, setLedger] = useState<AuditLedgerRecord[]>([]);
  const [health, setHealth] = useState<SystemHealthRecord[]>([]);
  const [pluginGroups, setPluginGroups] = useState<Record<string, PluginTypeGroup>>({});
  const [settings, setSettings] = useState<AdminSettingsPayload | null>(null);
  const [courses, setCourses] = useState<AdminCourseRecord[]>([]);
  const [categories, setCategories] = useState<CourseCategoryRecord[]>([]);
  const [adminTree, setAdminTree] = useState<Record<string, AdminCategoryNode>>({});
  const [adminCategories, setAdminCategories] = useState<AdminCourseCategory[]>([]);
  const [courseDefaults, setCourseDefaults] = useState<CourseDefaultSettings | null>(null);

  // Filter toolbar state
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');

  // Interactive toggle states inside dashboard widgets
  const [trendRange, setTrendRange] = useState<'30days' | 'yearly' | '12months'>('30days');
  const [leaderTab, setLeaderTab] = useState<'courses' | 'participants'>('courses');

  // UI notifications and actions
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [studioCourseId, setStudioCourseId] = useState<number | null>(null);
  const [showCourseStudio, setShowCourseStudio] = useState(false);

  const handleOpenStudio = (courseId: number) => {
    setStudioCourseId(courseId);
    setShowCourseStudio(true);
  };

  // Form states
  const [newCourse, setNewCourse] = useState({
    fullname: '',
    shortname: '',
    category_id: 2,
    format: 'topics',
    num_sections: 6,
    tuition_fee: 0,
    summary: '',
  });

  const [newActivity, setNewActivity] = useState<{
    course_id: number;
    section: number;
    mod_type: 'page' | 'quiz' | 'assign' | 'resource';
    name: string;
    content: string;
  }>({
    course_id: 4,
    section: 1,
    mod_type: 'page',
    name: '',
    content: '',
  });

  // Initial Data Fetching
  const loadAdminData = async () => {
    try {
      const [tData, uData, lData, hData, cData, sData, pData, treeData, catsData, defsData] = await Promise.all([
        adminService.getPlatformStats().catch(() => telemetry),
        adminService.getUniversityUsers().catch(() => []),
        adminService.getAuditLedger().catch(() => []),
        adminService.getSystemHealth().catch(() => []),
        adminService.getCourses().catch(() => ({ courses: [], categories: [] })),
        adminService.getSettings().catch(() => null),
        adminService.getPlugins().catch(() => ({ plugin_types: {} })),
        adminService.getAdminTree().catch(() => ({})),
        adminService.getCategories().catch(() => []),
        adminService.getCourseDefaults().catch(() => null),
      ]);

      setTelemetry(tData);
      setUsers(uData);
      setLedger(lData);
      setHealth(hData);
      setCourses(cData.courses);
      setCategories(cData.categories);
      if (sData) setSettings(sData);
      setPluginGroups(pData.plugin_types || pData);
      setAdminTree(treeData);
      setAdminCategories(catsData);
      setCourseDefaults(defsData);
    } catch (err) {
      console.error('Failed to load admin data', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Alert timer
  useEffect(() => {
    if (actionAlert) {
      const timer = setTimeout(() => setActionAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionAlert]);

  // Purge cache handler
  const handlePurgeCache = async () => {
    setIsPurging(true);
    try {
      await adminService.purgeCache();
      setActionAlert({ type: 'success', message: 'All Moodle and institutional cache stores successfully purged.' });
    } catch (err: any) {
      setActionAlert({ type: 'danger', message: err.message || 'Failed to purge caches' });
    } finally {
      setIsPurging(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterCourse('all');
    setFilterDepartment('all');
    setFilterModule('all');
  };

  // Create course handler
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createCourse(newCourse);
      setActionAlert({ type: 'success', message: `Course "${newCourse.fullname}" successfully registered.` });
      setShowCourseModal(false);
      setNewCourse({
        fullname: '',
        shortname: '',
        category_id: 2,
        format: 'topics',
        num_sections: 6,
        tuition_fee: 0,
        summary: '',
      });
      await loadAdminData();
    } catch (err: any) {
      setActionAlert({ type: 'danger', message: err.message || 'Failed to create course' });
    }
  };

  // Add activity handler
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.addActivity(newActivity);
      setActionAlert({ type: 'success', message: `Learning module "${newActivity.name}" published.` });
      setShowActivityModal(false);
      setNewActivity({
        course_id: 4,
        section: 1,
        mod_type: 'page',
        name: '',
        content: '',
      });
      await loadAdminData();
    } catch (err: any) {
      setActionAlert({ type: 'danger', message: err.message || 'Failed to add activity' });
    }
  };

  return (
    <div className="corporate-lms-admin-app d-flex" style={{ backgroundColor: '#f4f6fa', minHeight: '100vh' }}>
      {/* ============================================================== */}
      {/* 1. LEFT FIXED CORPORATE SIDEBAR (MATCHING SCREENSHOT)          */}
      {/* ============================================================== */}
      <CorporateAdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenCourseStudio={handleOpenStudio}
        onPurgeCache={handlePurgeCache}
      />

      {/* ============================================================== */}
      {/* 2. MAIN CONTENT WRAPPER (TOP NAV + CANVAS BODY)                */}
      {/* ============================================================== */}
      <div className="corporate-main-content flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        {/* TOP SLIM HEADER BAR */}
        <CorporateAdminHeader
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onPurgeCache={handlePurgeCache}
        />

        {/* Action Alert Notification */}
        {actionAlert && (
          <div className="mx-4 mt-3">
            <div className={`alert alert-${actionAlert.type} alert-dismissible fade show shadow-sm mb-0`} role="alert">
              <div className="d-flex align-items-center">
                <i className={`feather-${actionAlert.type === 'success' ? 'check-circle' : 'alert-circle'} fs-18 me-2`} />
                <div>{actionAlert.message}</div>
              </div>
              <button type="button" className="btn-close" onClick={() => setActionAlert(null)} />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. CANVAS BODY                                                 */}
        {/* ============================================================== */}
        <div className="p-4 flex-grow-1">
          {/* ============================================================== */}
          {/* VIEW A: EXACT CORPORATE DASHBOARD (MATCHING USER SCREENSHOT)   */}
          {/* ============================================================== */}
          {activeView === 'dashboard' && (
            <div>
              {/* 3.1 TOP FILTER BAR CARD */}
              <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white" style={{ borderColor: '#e2e8f0' }}>
                <div className="card-body p-3">
                  <div className="row g-3 align-items-end">
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 fw-bold text-uppercase shadow-sm"
                        style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', fontSize: '12px', letterSpacing: '0.5px' }}
                      >
                        <i className="feather-filter" />
                        <span>FILTERS</span>
                      </button>
                    </div>

                    <div className="col-md-3">
                      <label
                        className="form-label text-uppercase fw-bold text-muted mb-1"
                        style={{ fontSize: '11px', letterSpacing: '0.5px' }}
                      >
                        COURSE
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                      >
                        <option value="all">All Courses</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullname} ({c.shortname})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label
                        className="form-label text-uppercase fw-bold text-muted mb-1"
                        style={{ fontSize: '11px', letterSpacing: '0.5px' }}
                      >
                        DEPARTMENT / CATEGORY
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                      >
                        <option value="all">All Departments</option>
                        {adminCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label
                        className="form-label text-uppercase fw-bold text-muted mb-1"
                        style={{ fontSize: '11px', letterSpacing: '0.5px' }}
                      >
                        MODULE / STATUS
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={filterModule}
                        onChange={(e) => setFilterModule(e.target.value)}
                      >
                        <option value="all">All Modules</option>
                        <option value="active">Active Enrolments</option>
                        <option value="completed">Completed Modules</option>
                        <option value="pending">Pending Verification</option>
                      </select>
                    </div>

                    <div className="col-auto ms-auto">
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="btn btn-outline-secondary btn-sm px-3 py-1 fw-medium"
                        style={{ borderColor: '#cbd5e1' }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3.2 ROW OF 6 METRIC CARDS (ACCENT BORDERS & ICON BADGES) */}
              <div className="row g-3 mb-4">
                {/* 1. TOTAL LEARNERS */}
                <div className="col-xl-2 col-md-4 col-sm-6">
                  <div
                    className="card h-100 border-0 shadow-sm p-3 bg-white rounded-3"
                    style={{ borderLeft: '4px solid #0ea5e9', minHeight: '85px' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '40px', height: '40px', backgroundColor: '#e0f2fe', color: '#0284c7' }}
                      >
                        <i className="feather-users fs-18" />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">6</h4>
                        <div
                          className="text-uppercase fw-bold text-muted"
                          style={{ fontSize: '10px', letterSpacing: '0.4px' }}
                        >
                          TOTAL LEARNERS
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. TOTAL COURSES */}
                <div className="col-xl-2 col-md-4 col-sm-6">
                  <div
                    className="card h-100 border-0 shadow-sm p-3 bg-white rounded-3"
                    style={{ borderLeft: '4px solid #a855f7', minHeight: '85px' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '40px', height: '40px', backgroundColor: '#f3e8ff', color: '#9333ea' }}
                      >
                        <i className="feather-book fs-18" />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">1</h4>
                        <div
                          className="text-uppercase fw-bold text-muted"
                          style={{ fontSize: '10px', letterSpacing: '0.4px' }}
                        >
                          TOTAL COURSES
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. ENROLLMENT COMPLETION */}
                <div className="col-xl-2 col-md-4 col-sm-6">
                  <div
                    className="card h-100 border-0 shadow-sm p-3 bg-white rounded-3"
                    style={{ borderLeft: '4px solid #10b981', minHeight: '85px' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '40px', height: '40px', backgroundColor: '#dcfce7', color: '#16a34a' }}
                      >
                        <i className="feather-pie-chart fs-18" />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">0%</h4>
                        <div
                          className="text-uppercase fw-bold text-muted"
                          style={{ fontSize: '10px', letterSpacing: '0.4px' }}
                        >
                          ENROLLMENT COMPLETION
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. MANDATORY ENROLLMENTS PENDING */}
                <div className="col-xl-2 col-md-4 col-sm-6">
                  <div
                    className="card h-100 border-0 shadow-sm p-3 bg-white rounded-3"
                    style={{ borderLeft: '4px solid #f59e0b', minHeight: '85px' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '40px', height: '40px', backgroundColor: '#fef3c7', color: '#d97706' }}
                      >
                        <i className="feather-clock fs-18" />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">0</h4>
                        <div
                          className="text-uppercase fw-bold text-muted"
                          style={{ fontSize: '10px', letterSpacing: '0.4px' }}
                        >
                          MANDATORY ENROLLMENTS PENDING
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. ACTIVE (LAST 7 DAYS) */}
                <div className="col-xl-2 col-md-4 col-sm-6">
                  <div
                    className="card h-100 border-0 shadow-sm p-3 bg-white rounded-3"
                    style={{ borderLeft: '4px solid #22c55e', minHeight: '85px' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '40px', height: '40px', backgroundColor: '#dcfce7', color: '#15803d' }}
                      >
                        <i className="feather-zap fs-18" />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">5</h4>
                        <div
                          className="text-uppercase fw-bold text-muted"
                          style={{ fontSize: '10px', letterSpacing: '0.4px' }}
                        >
                          ACTIVE (LAST 7 DAYS)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. NOT ACTIVE (7 DAYS) */}
                <div className="col-xl-2 col-md-4 col-sm-6">
                  <div
                    className="card h-100 border-0 shadow-sm p-3 bg-white rounded-3"
                    style={{ borderLeft: '4px solid #ef4444', minHeight: '85px' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '40px', height: '40px', backgroundColor: '#fee2e2', color: '#dc2626' }}
                      >
                        <i className="feather-pause fs-18" />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">1</h4>
                        <div
                          className="text-uppercase fw-bold text-muted"
                          style={{ fontSize: '10px', letterSpacing: '0.4px' }}
                        >
                          NOT ACTIVE (7 DAYS)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3.3 COURSE OUTCOME KPIS (7 VIBRANT SOLID CARDS) */}
              <div className="mb-4">
                <div
                  className="text-uppercase fw-bold mb-2 text-dark"
                  style={{ fontSize: '12px', letterSpacing: '0.6px', color: '#334155' }}
                >
                  COURSE OUTCOME KPIS
                </div>
                <div className="row g-2">
                  {/* KPI 1: TOTAL LEARNERS (Solid Cyan Blue) */}
                  <div className="col-xl col-md-4 col-sm-6">
                    <div
                      className="card border-0 shadow-sm rounded-3 text-white p-3 h-100 d-flex flex-column justify-content-between"
                      style={{ backgroundColor: '#0284c7' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '0.3px' }}>
                          TOTAL LEARNERS
                        </span>
                        <div
                          className="rounded-circle bg-white-20 d-flex align-items-center justify-content-center"
                          style={{ width: '26px', height: '26px', backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <i className="feather-users fs-13" />
                        </div>
                      </div>
                      <div className="fw-bold mb-2" style={{ fontSize: '28px' }}>
                        6
                      </div>
                      <div
                        className="badge bg-white-20 text-white fw-normal text-start d-inline-flex align-items-center gap-1"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '10px', padding: '4px 8px' }}
                      >
                        <span>➔</span> 100% vs previous 30 days
                      </div>
                    </div>
                  </div>

                  {/* KPI 2: RESIGNED MIDWAY (Solid Orange) */}
                  <div className="col-xl col-md-4 col-sm-6">
                    <div
                      className="card border-0 shadow-sm rounded-3 text-white p-3 h-100 d-flex flex-column justify-content-between"
                      style={{ backgroundColor: '#f97316' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '0.3px' }}>
                          RESIGNED MIDWAY
                        </span>
                        <div
                          className="rounded-circle bg-white-20 d-flex align-items-center justify-content-center"
                          style={{ width: '26px', height: '26px', backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <i className="feather-user-minus fs-13" />
                        </div>
                      </div>
                      <div className="fw-bold mb-2" style={{ fontSize: '28px' }}>
                        0
                      </div>
                      <div className="text-white-50 small" style={{ fontSize: '11px' }}>
                        0% of learners
                      </div>
                    </div>
                  </div>

                  {/* KPI 3: COURSE ENROLLMENTS (Solid Sky Blue) */}
                  <div className="col-xl col-md-4 col-sm-6">
                    <div
                      className="card border-0 shadow-sm rounded-3 text-white p-3 h-100 d-flex flex-column justify-content-between"
                      style={{ backgroundColor: '#0284c7' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '0.3px' }}>
                          COURSE ENROLLMENTS
                        </span>
                        <div
                          className="rounded-circle bg-white-20 d-flex align-items-center justify-content-center"
                          style={{ width: '26px', height: '26px', backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <i className="feather-book fs-13" />
                        </div>
                      </div>
                      <div className="fw-bold mb-2" style={{ fontSize: '28px' }}>
                        5
                      </div>
                      <div className="text-white-50 small" style={{ fontSize: '11px' }}>
                        0 new this month
                      </div>
                    </div>
                  </div>

                  {/* KPI 4: PENDING VERIFICATION (Solid Red/Coral) */}
                  <div className="col-xl col-md-4 col-sm-6">
                    <div
                      className="card border-0 shadow-sm rounded-3 text-white p-3 h-100 d-flex flex-column justify-content-between"
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '0.3px' }}>
                          PENDING VERIFICATION
                        </span>
                        <div
                          className="rounded-circle bg-white-20 d-flex align-items-center justify-content-center"
                          style={{ width: '26px', height: '26px', backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <i className="feather-alert-triangle fs-13" />
                        </div>
                      </div>
                      <div className="fw-bold mb-2" style={{ fontSize: '28px' }}>
                        0
                      </div>
                      <div
                        className="badge bg-white-20 text-white fw-normal text-start d-inline-flex align-items-center gap-1"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '10px', padding: '4px 8px' }}
                      >
                        <span>➔</span> Active cohort learning
                      </div>
                    </div>
                  </div>

                  {/* KPI 5: PASSED (Solid Forest Green) */}
                  <div className="col-xl col-md-4 col-sm-6">
                    <div
                      className="card border-0 shadow-sm rounded-3 text-white p-3 h-100 d-flex flex-column justify-content-between"
                      style={{ backgroundColor: '#059669' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '0.3px' }}>
                          PASSED
                        </span>
                        <div
                          className="rounded-circle bg-white-20 d-flex align-items-center justify-content-center"
                          style={{ width: '26px', height: '26px', backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <i className="feather-check-circle fs-13" />
                        </div>
                      </div>
                      <div className="fw-bold mb-2" style={{ fontSize: '28px' }}>
                        0
                      </div>
                      <div
                        className="badge bg-white-20 text-white fw-normal text-start d-inline-flex align-items-center gap-1"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '10px', padding: '4px 8px' }}
                      >
                        <span>➔</span> 0% of course enrollments
                      </div>
                    </div>
                  </div>

                  {/* KPI 6: CERTIFICATES ISSUED (Solid Violet Purple) */}
                  <div className="col-xl col-md-4 col-sm-6">
                    <div
                      className="card border-0 shadow-sm rounded-3 text-white p-3 h-100 d-flex flex-column justify-content-between"
                      style={{ backgroundColor: '#8b5cf6' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '0.3px' }}>
                          CERTIFICATES ISSUED
                        </span>
                        <div
                          className="rounded-circle bg-white-20 d-flex align-items-center justify-content-center"
                          style={{ width: '26px', height: '26px', backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <i className="feather-award fs-13" />
                        </div>
                      </div>
                      <div className="fw-bold mb-2" style={{ fontSize: '28px' }}>
                        0
                      </div>
                      <div
                        className="badge bg-white-20 text-white fw-normal text-start d-inline-flex align-items-center gap-1"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '10px', padding: '4px 8px' }}
                      >
                        <span>➔</span> Avg 0/5.0 score
                      </div>
                    </div>
                  </div>

                  {/* KPI 7: BOT COMPLIANCE (Solid Midnight Navy) */}
                  <div className="col-xl col-md-4 col-sm-6">
                    <div
                      className="card border-0 shadow-sm rounded-3 text-white p-3 h-100 d-flex flex-column justify-content-between"
                      style={{ backgroundColor: '#0b1727' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="text-uppercase fw-bold d-flex align-items-center gap-1" style={{ fontSize: '11px', letterSpacing: '0.3px' }}>
                          BOT COMPLIANCE <span className="rounded-circle bg-success d-inline-block" style={{ width: '6px', height: '6px' }} />
                        </span>
                        <div
                          className="rounded-circle bg-white-20 d-flex align-items-center justify-content-center"
                          style={{ width: '26px', height: '26px', backgroundColor: 'rgba(255,255,255,0.15)' }}
                        >
                          <i className="feather-shield fs-13 text-info" />
                        </div>
                      </div>
                      <div className="fw-bold text-white mb-2" style={{ fontSize: '22px' }}>
                        100% AUDIT
                      </div>
                      <div className="text-white-50 small" style={{ fontSize: '11px' }}>
                        Branch Oversight
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3.4 MIDDLE 2-COLUMN SECTION (LEFT 8 COLS, RIGHT 4 COLS) */}
              <div className="row g-4 mb-4">
                {/* ============================================================== */}
                {/* LEFT COLUMN (8 COLS)                                           */}
                {/* ============================================================== */}
                <div className="col-lg-8">
                  {/* CARD A: DEPARTMENT READINESS & ANALYTICS TREND (LINE CHART) */}
                  <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
                    <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '15px' }}>
                          Department Readiness & Analytics Trend
                        </h6>
                        <p className="text-muted small mb-0">
                          Track revenue performance and course enrollment metrics over time.
                        </p>
                      </div>

                      <div className="d-flex gap-2 align-items-center">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            type="button"
                            className={`btn ${trendRange === '30days' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            style={{
                              backgroundColor: trendRange === '30days' ? '#0284c7' : 'transparent',
                              borderColor: trendRange === '30days' ? '#0284c7' : '#cbd5e1',
                              fontSize: '11px',
                            }}
                            onClick={() => setTrendRange('30days')}
                          >
                            30 Days
                          </button>
                          <button
                            type="button"
                            className={`btn ${trendRange === 'yearly' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            style={{
                              backgroundColor: trendRange === 'yearly' ? '#0284c7' : 'transparent',
                              borderColor: trendRange === 'yearly' ? '#0284c7' : '#cbd5e1',
                              fontSize: '11px',
                            }}
                            onClick={() => setTrendRange('yearly')}
                          >
                            Yearly
                          </button>
                          <button
                            type="button"
                            className={`btn ${trendRange === '12months' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            style={{
                              backgroundColor: trendRange === '12months' ? '#0284c7' : 'transparent',
                              borderColor: trendRange === '12months' ? '#0284c7' : '#cbd5e1',
                              fontSize: '11px',
                            }}
                            onClick={() => setTrendRange('12months')}
                          >
                            12 Months
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="card-body p-3">
                      {/* Chart Legend */}
                      <div className="d-flex justify-content-center align-items-center gap-2 mb-3 small text-muted">
                        <span
                          className="d-inline-block rounded"
                          style={{ width: '12px', height: '12px', border: '2px solid #16a34a', backgroundColor: '#dcfce7' }}
                        />
                        <span style={{ fontSize: '12px' }}>Revenue</span>
                      </div>

                      {/* Responsive Line Chart SVG */}
                      <div className="w-100 overflow-x-auto">
                        <svg viewBox="0 0 740 260" className="w-100" style={{ minWidth: '600px', height: '240px' }}>
                          {/* Y-Axis Labels & Horizontal Gridlines */}
                          {[
                            { y: 20, label: '1.0' },
                            { y: 42, label: '0.8' },
                            { y: 64, label: '0.6' },
                            { y: 86, label: '0.4' },
                            { y: 108, label: '0.2' },
                            { y: 130, label: '0' },
                            { y: 152, label: '-0.2' },
                            { y: 174, label: '-0.4' },
                            { y: 196, label: '-0.6' },
                            { y: 218, label: '-0.8' },
                            { y: 240, label: '-1.0' },
                          ].map((grid, idx) => (
                            <g key={idx}>
                              <text x="35" y={grid.y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                                {grid.label}
                              </text>
                              <line
                                x1="45"
                                y1={grid.y}
                                x2="720"
                                y2={grid.y}
                                stroke={grid.label === '0' ? '#16a34a' : '#f1f5f9'}
                                strokeDasharray={grid.label === '0' ? '4 2' : 'none'}
                                strokeWidth="1"
                              />
                            </g>
                          ))}

                          {/* 30 Data Points Line & Circles along baseline */}
                          <polyline
                            fill="none"
                            stroke="#16a34a"
                            strokeWidth="2"
                            points="
                              55,130 77,130 99,130 121,130 143,130 165,130 187,130 209,130 231,130 253,130
                              275,130 297,130 319,130 341,130 363,130 385,130 407,130 429,130 451,130 473,130
                              495,130 517,130 539,130 561,130 583,130 605,130 627,130 649,130 671,130 693,130
                            "
                          />

                          {/* Data point dots */}
                          {[
                            55, 77, 99, 121, 143, 165, 187, 209, 231, 253,
                            275, 297, 319, 341, 363, 385, 407, 429, 451, 473,
                            495, 517, 539, 561, 583, 605, 627, 649, 671, 693
                          ].map((cx, idx) => (
                            <circle key={idx} cx={cx} cy="130" r="3.5" fill="#16a34a" stroke="#ffffff" strokeWidth="1.5" />
                          ))}

                          {/* X-Axis Slanted Date Labels */}
                          {[
                            '04 Oct', '05 Oct', '06 Oct', '07 Oct', '08 Oct', '09 Oct', '10 Oct', '11 Oct', '12 Oct', '13 Oct',
                            '14 Oct', '15 Oct', '16 Oct', '17 Oct', '18 Oct', '19 Oct', '20 Oct', '21 Oct', '22 Oct', '23 Oct',
                            '24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct', '29 Oct', '30 Oct', '31 Oct', '01 Nov', '02 Nov'
                          ].map((d, idx) => {
                            const x = 55 + idx * 22;
                            return (
                              <text
                                key={idx}
                                x={x}
                                y="252"
                                textAnchor="end"
                                fontSize="8"
                                fill="#94a3b8"
                                transform={`rotate(-45 ${x} 252)`}
                              >
                                {d}
                              </text>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* CARD B: RECENT STAFF ENROLLMENTS & MANDATE PROGRESS (TABLE) */}
                  <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
                    <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '15px' }}>
                          Recent Staff Enrollments & Mandate Progress
                        </h6>
                        <p className="text-muted small mb-0">
                          Audited real-time enrollment progress and branch compliance records.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectView('courses')}
                        className="btn btn-outline-primary btn-sm px-3 rounded-pill d-flex align-items-center gap-1"
                        style={{ color: '#0284c7', borderColor: '#0284c7', fontSize: '12px' }}
                      >
                        <span>View All</span>
                        <span>➔</span>
                      </button>
                    </div>

                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '12px' }}>
                          <thead className="table-light">
                            <tr style={{ color: '#64748b', fontSize: '11px', letterSpacing: '0.5px' }}>
                              <th className="ps-3 py-2 text-uppercase">DATE</th>
                              <th className="py-2 text-uppercase">COURSE MANDATE</th>
                              <th className="py-2 text-uppercase">BANK STAFF</th>
                              <th className="py-2 text-uppercase">BRANCH</th>
                              <th className="py-2 text-uppercase">STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                date: 'Oct 05, 2026',
                                course: 'Island Branch Cash Smurfing & Sanc...',
                                staff: 'Fadhila Abdalla Haji',
                                branch: 'Forodhani Main Branch',
                              },
                              {
                                date: 'Sep 30, 2026',
                                course: 'Island Branch Cash Smurfing & Sanc...',
                                staff: 'Renatus Bernardo',
                                branch: 'Forodhani Main Branch',
                              },
                              {
                                date: 'Oct 05, 2026',
                                course: 'Island Branch Cash Smurfing & Sanc...',
                                staff: 'Khamis Juma Bakari',
                                branch: 'Forodhani Main Branch',
                              },
                              {
                                date: 'Oct 05, 2026',
                                course: 'Island Branch Cash Smurfing & Sanc...',
                                staff: 'Fatma Said Ali',
                                branch: 'Forodhani Main Branch',
                              },
                              {
                                date: 'Oct 05, 2026',
                                course: 'Island Branch Cash Smurfing & Sanc...',
                                staff: 'Ali Mohamed Issa',
                                branch: 'Chake Chake Branch',
                              },
                            ].map((row, idx) => (
                              <tr key={idx}>
                                <td className="ps-3 py-3 text-muted">{row.date}</td>
                                <td className="py-3">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenStudio(4)}
                                    className="btn btn-link text-decoration-none fw-bold p-0 text-start text-dark"
                                    style={{ fontSize: '12px' }}
                                    title="Open Course Settings Studio"
                                  >
                                    {row.course}
                                  </button>
                                </td>
                                <td className="py-3 text-secondary">{row.staff}</td>
                                <td className="py-3 text-secondary">{row.branch}</td>
                                <td className="py-3">
                                  <span
                                    className="badge rounded-pill fw-bold"
                                    style={{
                                      backgroundColor: '#dcfce7',
                                      color: '#16a34a',
                                      fontSize: '10px',
                                      padding: '4px 10px',
                                      letterSpacing: '0.4px',
                                    }}
                                  >
                                    APPROVED
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* CARD C: ENROLLMENT DISTRIBUTION OVERVIEW (MONTHLY BAR CHART) */}
                  <div className="card border-0 shadow-sm rounded-3 bg-white">
                    <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '15px' }}>
                          Enrollment Distribution Overview
                        </h6>
                        <p className="text-muted small mb-0">
                          Monthly course intake volume across corporate departments.
                        </p>
                      </div>

                      <div className="dropdown">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary dropdown-toggle"
                          style={{ fontSize: '11px' }}
                        >
                          12 Months
                        </button>
                      </div>
                    </div>

                    <div className="card-body p-3">
                      {/* Legend */}
                      <div className="d-flex justify-content-center align-items-center gap-2 mb-3 small text-muted">
                        <span
                          className="d-inline-block rounded"
                          style={{ width: '12px', height: '12px', backgroundColor: '#0284c7' }}
                        />
                        <span style={{ fontSize: '12px' }}>Enrollments</span>
                      </div>

                      {/* Bar Chart SVG */}
                      <div className="w-100 overflow-x-auto">
                        <svg viewBox="0 0 740 220" className="w-100" style={{ minWidth: '550px', height: '200px' }}>
                          {/* Horizontal Gridlines */}
                          {[
                            { y: 20, label: '10' },
                            { y: 55, label: '7.5' },
                            { y: 90, label: '5.0' },
                            { y: 125, label: '2.5' },
                            { y: 160, label: '0' },
                          ].map((grid, idx) => (
                            <g key={idx}>
                              <text x="35" y={grid.y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                                {grid.label}
                              </text>
                              <line x1="45" y1={grid.y} x2="720" y2={grid.y} stroke="#f1f5f9" strokeWidth="1" />
                            </g>
                          ))}

                          {/* Months: Dec, Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov */}
                          {[
                            { month: 'Dec', value: 0 },
                            { month: 'Jan', value: 0 },
                            { month: 'Feb', value: 0 },
                            { month: 'Mar', value: 0 },
                            { month: 'Apr', value: 0 },
                            { month: 'May', value: 0 },
                            { month: 'Jun', value: 0 },
                            { month: 'Jul', value: 0 },
                            { month: 'Aug', value: 0 },
                            { month: 'Sep', value: 0 },
                            { month: 'Oct', value: 9 }, // Prominent peak in October matching screenshot
                            { month: 'Nov', value: 0 },
                          ].map((col, idx) => {
                            const x = 70 + idx * 55;
                            const barHeight = col.value * 14;
                            const y = 160 - barHeight;
                            return (
                              <g key={idx}>
                                {col.value > 0 && (
                                  <rect
                                    x={x - 18}
                                    y={y}
                                    width="36"
                                    height={barHeight}
                                    fill="#0284c7"
                                    rx="2"
                                  />
                                )}
                                <text x={x} y="180" textAnchor="middle" fontSize="11" fill="#94a3b8">
                                  {col.month}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* RIGHT COLUMN (4 COLS)                                          */}
                {/* ============================================================== */}
                <div className="col-lg-4">
                  {/* CARD D: OVERALL COURSE LEADERS */}
                  <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
                    <div className="card-header bg-white border-bottom p-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '15px' }}>
                          Overall Course Leaders
                        </h6>
                        <span
                          className="badge rounded-pill fw-bold"
                          style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '10px' }}
                        >
                          1 Ranked
                        </span>
                      </div>
                      <p className="text-muted small mb-3">
                        Compare top participants and courses across academy outcomes.
                      </p>

                      {/* Top Courses vs Participants Toggle */}
                      <div className="btn-group w-100 mb-3" role="group">
                        <button
                          type="button"
                          onClick={() => setLeaderTab('courses')}
                          className="btn btn-sm fw-bold rounded-start-pill py-2"
                          style={{
                            backgroundColor: leaderTab === 'courses' ? '#0284c7' : '#f8fafc',
                            color: leaderTab === 'courses' ? '#ffffff' : '#64748b',
                            borderColor: '#e2e8f0',
                            fontSize: '11px',
                          }}
                        >
                          Top Courses
                        </button>
                        <button
                          type="button"
                          onClick={() => setLeaderTab('participants')}
                          className="btn btn-sm fw-bold rounded-end-pill py-2"
                          style={{
                            backgroundColor: leaderTab === 'participants' ? '#0284c7' : '#f8fafc',
                            color: leaderTab === 'participants' ? '#ffffff' : '#64748b',
                            borderColor: '#e2e8f0',
                            fontSize: '11px',
                          }}
                        >
                          Participants
                        </button>
                      </div>

                      {/* Percentage Threshold Badges */}
                      <div className="d-flex gap-2">
                        <span
                          className="badge rounded-pill fw-bold px-2 py-1"
                          style={{ backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '11px' }}
                        >
                          70%+
                        </span>
                        <span
                          className="badge rounded-pill fw-bold px-2 py-1"
                          style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '11px' }}
                        >
                          40-69%
                        </span>
                        <span
                          className="badge rounded-pill fw-bold px-2 py-1"
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '11px' }}
                        >
                          Below 40%
                        </span>
                      </div>
                    </div>

                    <div className="card-body p-3">
                      {/* Ranked Course Card */}
                      <div
                        className="p-3 border rounded-3 d-flex align-items-center gap-3 bg-light-subtle cursor-pointer hover-shadow"
                        onClick={() => handleOpenStudio(4)}
                        title="Click to open Course #4 Settings Studio"
                        style={{ cursor: 'pointer' }}
                      >
                        <div
                          className="fw-bold fs-16 text-muted d-flex align-items-center justify-content-center"
                          style={{ width: '20px' }}
                        >
                          1
                        </div>
                        <div
                          className="rounded-3 bg-white p-2 border d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '45px', height: '45px' }}
                        >
                          🏝️
                        </div>
                        <div className="overflow-hidden flex-grow-1">
                          <h6 className="fw-bold mb-1 text-dark text-truncate" style={{ fontSize: '12px' }}>
                            Island Branch Cash Smurfing & Sa...
                          </h6>
                          <div className="d-flex align-items-center gap-3 small text-muted" style={{ fontSize: '11px' }}>
                            <span className="text-primary d-flex align-items-center gap-1">
                              <i className="feather-users fs-12" /> 5
                            </span>
                            <span className="text-warning d-flex align-items-center gap-1">
                              ★ 5
                            </span>
                            <span className="text-secondary">TZS 0.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD E: LEARNER ENGAGEMENT SCORE */}
                  <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
                    <div className="card-header bg-white border-bottom p-3">
                      <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '15px' }}>
                        Learner Engagement Score
                      </h6>
                      <p className="text-muted small mb-0">
                        Active retention and completion health indicators.
                      </p>
                    </div>

                    <div className="card-body p-3">
                      {/* Metric 1: Active Learners */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1 small">
                          <span className="text-secondary" style={{ fontSize: '12px' }}>Active Learners</span>
                          <span className="fw-bold" style={{ color: '#22c55e', fontSize: '12px' }}>
                            5 (83.3%)
                          </span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: '83.3%', backgroundColor: '#22c55e' }}
                          />
                        </div>
                      </div>

                      {/* Metric 2: Completed Modules */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1 small">
                          <span className="text-secondary" style={{ fontSize: '12px' }}>Completed Modules</span>
                          <span className="fw-bold" style={{ color: '#a855f7', fontSize: '12px' }}>
                            0 (0%)
                          </span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: '0%', backgroundColor: '#a855f7' }}
                          />
                        </div>
                      </div>

                      {/* Metric 3: At Risk / Inactive */}
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-1 small">
                          <span className="text-secondary" style={{ fontSize: '12px' }}>At Risk / Inactive</span>
                          <span className="fw-bold" style={{ color: '#f59e0b', fontSize: '12px' }}>
                            0 (0%)
                          </span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: '0%', backgroundColor: '#f59e0b' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD F: RECENT ACTIVITY STREAM */}
                  <div className="card border-0 shadow-sm rounded-3 bg-white">
                    <div className="card-header bg-white border-bottom p-3">
                      <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '15px' }}>
                        Recent Activity Stream
                      </h6>
                      <p className="text-muted small mb-0">
                        Real-time alerts, course enrollments, and reviews.
                      </p>
                    </div>

                    <div className="card-body p-3">
                      <div className="d-flex flex-column gap-3">
                        {[
                          {
                            name: 'Fadhila Abdalla Haji',
                            action: 'enrolled in "Island Branch Cash Smurfing & Sanctions Screening Challenge"',
                            time: '1 week ago',
                          },
                          {
                            name: 'Renatus Bernardo',
                            action: 'enrolled in "Island Branch Cash Smurfing & Sanctions Screening Challenge"',
                            time: '1 week ago',
                          },
                          {
                            name: 'Khamis Juma Bakari',
                            action: 'enrolled in "Island Branch Cash Smurfing & Sanctions Screening Challenge"',
                            time: '1 week ago',
                          },
                          {
                            name: 'Fatma Said Ali',
                            action: 'enrolled in "Island Branch Cash Smurfing & Sanctions Screening Challenge"',
                            time: '1 week ago',
                          },
                          {
                            name: 'Ali Mohamed Issa',
                            action: 'enrolled in "Island Branch Cash Smurfing & Sanctions Screening Challenge"',
                            time: '1 week ago',
                          },
                        ].map((act, idx) => (
                          <div key={idx} className="d-flex align-items-start gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 mt-1"
                              style={{ width: '28px', height: '28px', backgroundColor: '#0284c7' }}
                            >
                              <i className="feather-user fs-12" />
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-dark small lh-sm">
                                <span className="fw-bold">{act.name}</span> {act.action}
                              </div>
                              <div className="text-muted" style={{ fontSize: '10px' }}>
                                {act.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW B: COURSES & CURRICULUM MANAGEMENT SUBVIEW                */}
          {/* ============================================================== */}
          {activeView === 'courses' && (
            <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Academic Course Models & Curriculum Features</h5>
                  <p className="text-muted small mb-0">
                    Configure curriculum sections, activity modules, assessment quizzes, and Moodle integration.
                  </p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOpenStudio(4)}
                    className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
                    style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                  >
                    <i className="feather-settings me-1" /> Open Course #4 Studio (BBA301)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowActivityModal(true)}
                    className="btn btn-outline-primary btn-sm rounded-pill px-3"
                  >
                    <i className="feather-plus me-1" /> Add Activity
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCourseModal(true)}
                    className="btn btn-dark btn-sm rounded-pill px-3 shadow-sm"
                  >
                    <i className="feather-plus me-1" /> Create Course Model
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                  <thead className="table-light">
                    <tr>
                      <th>Course Model</th>
                      <th>Category / Department</th>
                      <th>Curriculum Structure</th>
                      <th>Activity Features</th>
                      <th>Tuition & Enrolment</th>
                      <th>Scholars</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="fw-bold text-dark">{c.fullname}</div>
                          <span className="badge bg-secondary-subtle text-secondary me-1">{c.shortname}</span>
                          <span className="badge bg-info-subtle text-info">Format: {c.format}</span>
                        </td>
                        <td>
                          <span className="text-muted">{c.category_name}</span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {c.sections_count} Sections
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            <span className="badge bg-primary-subtle text-primary">
                              {c.quizzes_count} Quizzes
                            </span>
                            <span className="badge bg-warning-subtle text-warning">
                              {c.assignments_count} Assignments
                            </span>
                            <span className="badge bg-success-subtle text-success">
                              {c.pages_count} Pages
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">
                            {c.tuition_fee > 0 ? `TZS ${c.tuition_fee.toLocaleString()}` : 'Free / Scholarship'}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <i className="feather-users text-primary" />
                            <span className="fw-bold">{c.enrolled_students || 5}</span>
                          </div>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenStudio(c.id)}
                              className="btn btn-sm btn-primary px-2 py-1"
                              style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                              title="Edit Course Settings & Sections Studio"
                            >
                              <i className="feather-settings fs-14 me-1" />
                              Settings Studio
                            </button>
                            <a
                              href={adminService.getMoodleSsoUrl(`/course/view.php?id=${c.id}`)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-outline-secondary px-2 py-1"
                              title="Open in Moodle (SSO)"
                            >
                              <i className="feather-external-link fs-14" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW C: SITE ADMINISTRATION SUITE (ALL 9 AREAS & SSO)          */}
          {/* ============================================================== */}
          {activeView === 'siteadmin' && (
            <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
              <SiteAdminHub
                adminTree={adminTree}
                adminCategories={adminCategories}
                courses={courses}
                courseDefaults={courseDefaults}
                onRefresh={loadAdminData}
                onNotify={(type, message) => setActionAlert({ type, message })}
                onOpenCourseModal={() => setShowCourseModal(true)}
                onOpenCourseStudio={handleOpenStudio}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW D: REPORTS & TELEMETRY SUBVIEW                            */}
          {activeView === 'reports' && (
            <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
              <h5 className="fw-bold mb-3 text-dark">Executive Platform Telemetry & System Audits</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <div className="text-muted small">Total Scholars</div>
                    <div className="fs-3 fw-bold text-primary">{telemetry.totalStudents}</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <div className="text-muted small">Active Faculty</div>
                    <div className="fs-3 fw-bold text-success">{telemetry.activeInstructors}</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <div className="text-muted small">Pesapal Transactions</div>
                    <div className="fs-3 fw-bold text-warning">{telemetry.pesapalTransactionsCount}</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <div className="text-muted small">System Uptime</div>
                    <div className="fs-3 fw-bold text-info">{telemetry.systemUptime}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 4. FOOTER (MATCHING SCREENSHOT)                                */}
        {/* ============================================================== */}
        <footer className="px-4 py-3 bg-white border-top text-muted small">
          <div>Copyright © 2026 • People's Bank of Zanzibar (PBZ) / OUT LMS Corporate Academy • All Rights Reserved.</div>
        </footer>
      </div>

      {/* ============================================================== */}
      {/* 5. MODALS & SLIDERS                                            */}
      {/* ============================================================== */}

      {/* Course Settings & Sections Studio Modal */}
      {showCourseStudio && studioCourseId && (
        <CourseSettingsStudio
          courseId={studioCourseId}
          isOpen={showCourseStudio}
          onClose={() => {
            setShowCourseStudio(false);
            setStudioCourseId(null);
          }}
          categories={adminCategories}
          onNotify={(type, message) => setActionAlert({ type, message })}
          onCourseUpdated={loadAdminData}
        />
      )}

      {/* Create Course Modal */}
      {showCourseModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title fw-bold">Register New Course Model</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCourseModal(false)} />
              </div>
              <form onSubmit={handleCreateCourse}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Course Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={newCourse.fullname}
                      onChange={(e) => setNewCourse({ ...newCourse, fullname: e.target.value })}
                      placeholder="e.g. Corporate Financial Governance"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Course Short Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={newCourse.shortname}
                      onChange={(e) => setNewCourse({ ...newCourse, shortname: e.target.value })}
                      placeholder="e.g. BBA302"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Category / Department</label>
                    <select
                      className="form-select"
                      value={newCourse.category_id}
                      onChange={(e) => setNewCourse({ ...newCourse, category_id: parseInt(e.target.value) || 2 })}
                    >
                      {adminCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowCourseModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm" style={{ backgroundColor: '#0284c7' }}>
                    Save Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showActivityModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title fw-bold">Publish Learning Activity</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowActivityModal(false)} />
              </div>
              <form onSubmit={handleAddActivity}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Activity Type</label>
                    <select
                      className="form-select"
                      value={newActivity.mod_type}
                      onChange={(e: any) => setNewActivity({ ...newActivity, mod_type: e.target.value })}
                    >
                      <option value="page">Lecture Content Page (HTML/Text)</option>
                      <option value="quiz">Interactive Assessment Quiz</option>
                      <option value="assign">Assignment Submission Drop</option>
                      <option value="resource">File / Document Resource</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Activity Title</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={newActivity.name}
                      onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                      placeholder="e.g. AML Sanctions Compliance Quiz"
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowActivityModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm" style={{ backgroundColor: '#0284c7' }}>
                    Publish
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

export default AdminDashboard;
