import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminSidebar from './common/adminSidebar';
import SiteAdminHub from './common/siteAdminHub';
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

const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') as 'siteadmin' | 'users' | 'ledger' | 'health' | 'plugins' | 'settings' | 'courses' | null;
  const [activeTab, setActiveTab] = useState<'siteadmin' | 'users' | 'ledger' | 'health' | 'plugins' | 'settings' | 'courses'>(
    urlTab && ['siteadmin', 'users', 'ledger', 'health', 'plugins', 'settings', 'courses'].includes(urlTab) ? urlTab : 'siteadmin'
  );

  // Sync tab with URL search parameter
  useEffect(() => {
    if (urlTab && ['siteadmin', 'users', 'ledger', 'health', 'plugins', 'settings', 'courses'].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tab: 'siteadmin' | 'users' | 'ledger' | 'health' | 'plugins' | 'settings' | 'courses') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // State Management
  const [telemetry, setTelemetry] = useState<PlatformTelemetry>({
    totalStudents: 14820,
    activeInstructors: 342,
    publishedCourses: 3,
    totalTuitionTzs: 'TZS 184,500,000',
    pesapalTransactionsCount: 1248,
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

  // UI state
  const [pluginFilter, setPluginFilter] = useState<string>('all');
  const [pluginSearch, setPluginSearch] = useState<string>('');
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [isPurging, setIsPurging] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showPluginModal, setShowPluginModal] = useState(false);

  // New Course Form state
  const [newCourse, setNewCourse] = useState({
    fullname: '',
    shortname: '',
    category_id: 2,
    format: 'topics',
    num_sections: 6,
    tuition_fee: 250000,
    summary: '',
  });

  // New Activity Form state
  const [newActivity, setNewActivity] = useState<{
    course_id: number;
    section: number;
    mod_type: 'page' | 'quiz' | 'assign' | 'resource';
    name: string;
    content: string;
  }>({
    course_id: 2,
    section: 1,
    mod_type: 'page',
    name: '',
    content: '',
  });

  // Install Plugin Form state
  const [pluginInstallFile, setPluginInstallFile] = useState<File | null>(null);
  const [pluginComponentName, setPluginComponentName] = useState('');

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
      console.error("Failed to load admin data", err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Alert dismiss timer
  useEffect(() => {
    if (actionAlert) {
      const timer = setTimeout(() => setActionAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionAlert]);

  // Plugin Handlers
  const handleTogglePlugin = async (component: string, currentEnabled: boolean) => {
    try {
      await adminService.togglePlugin(component, !currentEnabled);
      setActionAlert({
        type: 'success',
        message: `Plugin ${component} ${!currentEnabled ? 'enabled' : 'disabled'} successfully.`,
      });
      // Refresh plugins
      const pData = await adminService.getPlugins();
      setPluginGroups(pData);
    } catch (err: any) {
      setActionAlert({ type: 'danger', message: err.message || 'Failed to toggle plugin' });
    }
  };

  const handleUninstallPlugin = async (component: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and uninstall ${component}?`)) return;
    try {
      await adminService.uninstallPlugin(component);
      setActionAlert({ type: 'success', message: `Plugin ${component} successfully uninstalled.` });
      const pData = await adminService.getPlugins();
      setPluginGroups(pData);
    } catch (err: any) {
      setActionAlert({ type: 'danger', message: err.message || 'Failed to uninstall plugin' });
    }
  };

  const handleInstallPlugin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.installPlugin(pluginInstallFile || undefined, pluginComponentName || undefined);
      setActionAlert({ type: 'success', message: 'Plugin installed successfully and caches refreshed.' });
      setShowPluginModal(false);
      setPluginInstallFile(null);
      setPluginComponentName('');
      const pData = await adminService.getPlugins();
      setPluginGroups(pData);
    } catch (err: any) {
      setActionAlert({ type: 'danger', message: err.message || 'Failed to install plugin' });
    }
  };

  // Cache Purge Handler
  const handlePurgeCache = async () => {
    setIsPurging(true);
    try {
      const res = await adminService.purgeCache();
      setActionAlert({ type: 'success', message: res.message || 'All Moodle caches successfully purged!' });
    } catch (err: any) {
      setActionAlert({ type: 'danger', message: err.message || 'Failed to purge cache' });
    } finally {
      setIsPurging(false);
    }
  };

  // Settings Save Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSavingSettings(true);
    try {
      await adminService.updateSettings({
        site: settings.site,
        payment: settings.payment,
      });
      setActionAlert({ type: 'success', message: 'University system and payment gateway settings saved successfully!' });
    } catch (err: any) {
      setActionAlert({ type: 'danger', message: err.message || 'Failed to save settings' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Course Model Handlers
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createCourse(newCourse);
      setActionAlert({
        type: 'success',
        message: `Course model ${newCourse.shortname} created with ${newCourse.num_sections} modules and syllabus.`,
      });
      setShowCourseModal(false);
      setNewCourse({
        fullname: '',
        shortname: '',
        category_id: categories[0]?.id || 2,
        format: 'topics',
        num_sections: 6,
        tuition_fee: 250000,
        summary: '',
      });
      const cData = await adminService.getCourses();
      setCourses(cData.courses);
    } catch (err: any) {
      setActionAlert({ type: 'danger', message: err.message || 'Failed to create course' });
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.addActivity(newActivity);
      setActionAlert({
        type: 'success',
        message: `Activity '${newActivity.name}' (${newActivity.mod_type}) added to Module ${newActivity.section}.`,
      });
      setShowActivityModal(false);
      setNewActivity({
        course_id: courses[0]?.id || 2,
        section: 1,
        mod_type: 'page',
        name: '',
        content: '',
      });
      const cData = await adminService.getCourses();
      setCourses(cData.courses);
    } catch (err: any) {
      setActionAlert({ type: 'danger', message: err.message || 'Failed to add activity' });
    }
  };

  const handleDeleteCourse = async (courseId: number, courseName: string) => {
    if (!window.confirm(`Are you sure you want to delete course "${courseName}"?`)) return;
    try {
      await adminService.deleteCourse(courseId);
      setActionAlert({ type: 'success', message: `Course "${courseName}" deleted.` });
      await loadAdminData();
    } catch (err: any) {
      setActionAlert({ type: 'danger', message: err.message || 'Failed to delete course' });
    }
  };

  // Filter plugins
  const allPluginList: MoodlePluginRecord[] = Object.values(pluginGroups).flatMap((g) => g.plugins);
  const filteredPlugins = allPluginList.filter((p) => {
    const matchesType = pluginFilter === 'all' || p.type === pluginFilter;
    const matchesSearch =
      pluginSearch === '' ||
      p.displayname.toLowerCase().includes(pluginSearch.toLowerCase()) ||
      p.component.toLowerCase().includes(pluginSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="page-content py-4">
      <div className="container">
        {/* Action Alert Notification */}
        {actionAlert && (
          <div className={`alert alert-${actionAlert.type} alert-dismissible fade show shadow-sm mb-4`} role="alert">
            <div className="d-flex align-items-center">
              <i className={`isax ${actionAlert.type === 'success' ? 'isax-tick-circle' : 'isax-danger'} fs-20 me-2`} />
              <div>{actionAlert.message}</div>
            </div>
            <button type="button" className="btn-close" onClick={() => setActionAlert(null)} />
          </div>
        )}

        {/* Header Banner */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="rounded-4 p-4 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #0d3b66 0%, #028090 100%)", color: "#ffffff" }}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-warning text-dark px-3 py-1 fw-bold">
                      Senate & Registrar Directorate
                    </span>
                    <span className="badge bg-white-50 text-white px-2 py-1">
                      Moodle 5.x Native API
                    </span>
                  </div>
                  <h3 className="fw-bold text-white mb-1">OUT LMS Administrator & Registrar Portal</h3>
                  <p className="text-white-50 mb-0 fs-14">
                    The Open University of Tanzania • Unified Governance, Course Models, Plugins & Gateway Telemetry
                  </p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    onClick={handlePurgeCache}
                    disabled={isPurging}
                    className="btn btn-outline-light rounded-pill btn-sm px-3"
                  >
                    <i className={`isax isax-refresh-2 me-1 ${isPurging ? 'fa-spin' : ''}`} />
                    {isPurging ? 'Purging Caches...' : 'Purge All Caches'}
                  </button>
                  <button
                    onClick={() => setShowCourseModal(true)}
                    className="btn btn-warning text-dark fw-bold rounded-pill btn-sm px-3 shadow-sm"
                  >
                    <i className="isax isax-add me-1" /> New Course Model
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Admin Sidebar */}
          <AdminSidebar />

          {/* Main Content Area */}
          <div className="col-lg-9">
            {/* Stat Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted fs-13 fw-medium">Total Scholars</span>
                    <div className="p-2 rounded-circle bg-primary-subtle text-primary">
                      <i className="isax isax-profile-2user fs-18" />
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1">{telemetry.totalStudents.toLocaleString()}</h4>
                  <div className="d-flex align-items-center text-success fs-12">
                    <i className="isax isax-arrow-up-3 me-1" />
                    <span>+12.5% this academic intake</span>
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted fs-13 fw-medium">Academic Staff</span>
                    <div className="p-2 rounded-circle bg-info-subtle text-info">
                      <i className="isax isax-teacher fs-18" />
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1">{telemetry.activeInstructors}</h4>
                  <div className="text-muted fs-12">3 Faculties & Directorates</div>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted fs-13 fw-medium">Course Models</span>
                    <div className="p-2 rounded-circle bg-warning-subtle text-warning">
                      <i className="isax isax-book fs-18" />
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1">{courses.length || telemetry.publishedCourses}</h4>
                  <div className="text-muted fs-12">All Published in Moodle</div>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted fs-13 fw-medium">Tuition Volume</span>
                    <div className="p-2 rounded-circle bg-success-subtle text-success">
                      <i className="isax isax-wallet-money fs-18" />
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1">{telemetry.totalTuitionTzs}</h4>
                  <div className="d-flex align-items-center text-success fs-12">
                    <i className="isax isax-verify me-1" />
                    <span>Pesapal 3.0 Real-time</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom p-3">
                <ul className="nav nav-pills gap-2 flex-wrap">
                  <li className="nav-item">
                    <button
                      className={`btn btn-sm rounded-pill px-3 ${activeTab === 'siteadmin' ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => handleTabChange('siteadmin')}
                    >
                      <i className="isax isax-category-2 me-1" />
                      Site Administration Suite (All 9 Areas)
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`btn btn-sm rounded-pill px-3 ${activeTab === 'courses' ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => handleTabChange('courses')}
                    >
                      <i className="isax isax-book me-1" />
                      Course Models & Features ({courses.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`btn btn-sm rounded-pill px-3 ${activeTab === 'plugins' ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => handleTabChange('plugins')}
                    >
                      <i className="isax isax-cpu me-1" />
                      Moodle Plugins ({allPluginList.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`btn btn-sm rounded-pill px-3 ${activeTab === 'settings' ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => handleTabChange('settings')}
                    >
                      <i className="isax isax-setting-2 me-1" />
                      System & Gateway Settings
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`btn btn-sm rounded-pill px-3 ${activeTab === 'users' ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => handleTabChange('users')}
                    >
                      <i className="isax isax-user-tag me-1" />
                      User Directory ({users.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`btn btn-sm rounded-pill px-3 ${activeTab === 'ledger' ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => handleTabChange('ledger')}
                    >
                      <i className="isax isax-receipt-2 me-1" />
                      Pesapal Ledger ({ledger.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`btn btn-sm rounded-pill px-3 ${activeTab === 'health' ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => handleTabChange('health')}
                    >
                      <i className="isax isax-health me-1" />
                      System Health & Nodes ({health.length})
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body p-3">
                {/* ============================================================== */}
                {/* 0. SITE ADMINISTRATION CONSOLE (ALL 9 AREAS & SSO ACTION HUB)  */}
                {/* ============================================================== */}
                {activeTab === 'siteadmin' && (
                  <SiteAdminHub
                    adminTree={adminTree}
                    adminCategories={adminCategories}
                    courses={courses}
                    courseDefaults={courseDefaults}
                    onRefresh={loadAdminData}
                    onNotify={(type, message) => setActionAlert({ type, message })}
                    onOpenCourseModal={() => setShowCourseModal(true)}
                  />
                )}

                {/* ============================================================== */}
                {/* 1. COURSE LEARNING MODELS & ACTIVITY FEATURES TAB              */}
                {/* ============================================================== */}
                {activeTab === 'courses' && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                      <div>
                        <h5 className="fw-bold mb-1">Academic Course Models & Curriculum Features</h5>
                        <p className="text-muted fs-13 mb-0">
                          Configure learning modules, activity structures (Quizzes, Assignments, Resources), and Pesapal tuition rates.
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => setShowActivityModal(true)}
                          className="btn btn-outline-primary btn-sm rounded-pill px-3"
                        >
                          <i className="isax isax-add-circle me-1" /> + Add Learning Activity
                        </button>
                        <button
                          onClick={() => setShowCourseModal(true)}
                          className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
                        >
                          <i className="isax isax-add me-1" /> Create Course Model
                        </button>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Course Model</th>
                            <th>Faculty / Department</th>
                            <th>Curriculum Structure</th>
                            <th>Activity Features</th>
                            <th>Tuition & Enrolment</th>
                            <th>Scholars</th>
                            <th>Actions</th>
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
                                <span className="fs-13 text-muted">{c.category_name}</span>
                              </td>
                              <td>
                                <span className="badge bg-light text-dark border">
                                  {c.sections_count} Module Sections
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
                                  <span className="badge bg-info-subtle text-info">
                                    {c.resources_count} Files
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="fw-bold text-dark fs-13">
                                  {c.tuition_fee > 0 ? `TZS ${c.tuition_fee.toLocaleString()}` : 'Free / Scholarship'}
                                </div>
                                <div className="d-flex gap-1 mt-1">
                                  {c.enrol_methods.map((em) => (
                                    <span
                                      key={em.id}
                                      className={`badge ${em.status === 0 ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}
                                      style={{ fontSize: '10px' }}
                                    >
                                      {em.enrol}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-1">
                                  <i className="isax isax-user text-primary" />
                                  <span className="fw-bold">{c.enrolled_students}</span>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <button
                                    onClick={() => {
                                      setNewActivity((prev) => ({ ...prev, course_id: c.id }));
                                      setShowActivityModal(true);
                                    }}
                                    className="btn btn-sm btn-outline-primary px-2 py-1"
                                    title="Add Activity to Course"
                                  >
                                    <i className="isax isax-add-circle fs-14" />
                                  </button>
                                  <Link
                                    to={`/course-watch/${c.id}`}
                                    className="btn btn-sm btn-outline-secondary px-2 py-1"
                                    title="Open Classroom Player"
                                  >
                                    <i className="isax isax-play-circle fs-14" />
                                  </Link>
                                  <a
                                    href={adminService.getMoodleSsoUrl(`/course/view.php?id=${c.id}`)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-sm btn-outline-info px-2 py-1"
                                    title="Open in Moodle (SSO)"
                                  >
                                    <i className="isax isax-export-1 fs-14" />
                                  </a>
                                  <button
                                    onClick={() => handleDeleteCourse(c.id, c.fullname)}
                                    className="btn btn-sm btn-outline-danger px-2 py-1"
                                    title="Delete Course"
                                  >
                                    <i className="isax isax-trash fs-14" />
                                  </button>
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
                {/* 2. PLUGINS & EXTENSIONS MANAGEMENT TAB                          */}
                {/* ============================================================== */}
                {activeTab === 'plugins' && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                      <div>
                        <h5 className="fw-bold mb-1">Moodle Core Plugins & Payment Gateways Manager</h5>
                        <p className="text-muted fs-13 mb-0">
                          Enable, disable, configure, or install Moodle activity modules, payment engines, and themes.
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => setShowPluginModal(true)}
                          className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
                        >
                          <i className="isax isax-import me-1" /> Install Plugin (.zip)
                        </button>
                      </div>
                    </div>

                    {/* Filter Pills & Search */}
                    <div className="row g-2 mb-3 align-items-center">
                      <div className="col-md-8">
                        <div className="d-flex gap-1 flex-wrap">
                          <button
                            className={`btn btn-sm rounded-pill px-3 ${pluginFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setPluginFilter('all')}
                          >
                            All ({allPluginList.length})
                          </button>
                          <button
                            className={`btn btn-sm rounded-pill px-3 ${pluginFilter === 'paygw' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setPluginFilter('paygw')}
                          >
                            Payment Gateways ({pluginGroups['paygw']?.count || 0})
                          </button>
                          <button
                            className={`btn btn-sm rounded-pill px-3 ${pluginFilter === 'mod' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setPluginFilter('mod')}
                          >
                            Activity Modules ({pluginGroups['mod']?.count || 0})
                          </button>
                          <button
                            className={`btn btn-sm rounded-pill px-3 ${pluginFilter === 'enrol' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setPluginFilter('enrol')}
                          >
                            Enrolment ({pluginGroups['enrol']?.count || 0})
                          </button>
                          <button
                            className={`btn btn-sm rounded-pill px-3 ${pluginFilter === 'theme' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setPluginFilter('theme')}
                          >
                            Themes ({pluginGroups['theme']?.count || 0})
                          </button>
                          <button
                            className={`btn btn-sm rounded-pill px-3 ${pluginFilter === 'auth' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setPluginFilter('auth')}
                          >
                            Auth ({pluginGroups['auth']?.count || 0})
                          </button>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="isax isax-search-normal-1" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Search plugins by name or identifier..."
                            value={pluginSearch}
                            onChange={(e) => setPluginSearch(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Plugins Table */}
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Plugin Name & Component</th>
                            <th>Category</th>
                            <th>Disk Version</th>
                            <th>Status</th>
                            <th>State</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPlugins.map((plugin) => (
                            <tr key={plugin.component}>
                              <td>
                                <div className="fw-bold text-dark">{plugin.displayname}</div>
                                <code className="fs-12 text-muted">{plugin.component}</code>
                                {plugin.is_standard ? (
                                  <span className="badge bg-light text-muted border ms-2">Standard</span>
                                ) : (
                                  <span className="badge bg-warning-subtle text-warning ms-2">OUT Extension</span>
                                )}
                              </td>
                              <td>
                                <span className="badge bg-info-subtle text-info">{plugin.typeTitle}</span>
                              </td>
                              <td>
                                <span className="fs-13 text-muted">{plugin.version}</span>
                                <div className="fs-11 text-muted">{plugin.release}</div>
                              </td>
                              <td>
                                <span className="badge bg-success-subtle text-success">
                                  <i className="isax isax-verify me-1" />
                                  {plugin.status}
                                </span>
                              </td>
                              <td>
                                <div className="form-check form-switch">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={plugin.enabled}
                                    onChange={() => handleTogglePlugin(plugin.component, plugin.enabled)}
                                  />
                                  <label className="form-check-label fs-13">
                                    {plugin.enabled ? (
                                      <span className="text-success fw-medium">Active</span>
                                    ) : (
                                      <span className="text-muted">Disabled</span>
                                    )}
                                  </label>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  {plugin.type === 'paygw' && (
                                    <button
                                      onClick={() => handleTabChange('settings')}
                                      className="btn btn-sm btn-outline-secondary px-2 py-1"
                                      title="Configure Gateway Credentials"
                                    >
                                      <i className="isax isax-setting-2 fs-13" /> Config
                                    </button>
                                  )}
                                  {plugin.uninstall_allowed && !plugin.is_standard && (
                                    <button
                                      onClick={() => handleUninstallPlugin(plugin.component)}
                                      className="btn btn-sm btn-outline-danger px-2 py-1"
                                      title="Uninstall Plugin"
                                    >
                                      <i className="isax isax-trash fs-13" />
                                    </button>
                                  )}
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
                {/* 3. SYSTEM SETTINGS & PAYMENT CONFIGURATION TAB                 */}
                {/* ============================================================== */}
                {activeTab === 'settings' && settings && (
                  <form onSubmit={handleSaveSettings}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                      <div>
                        <h5 className="fw-bold mb-1">University Platform & Payment Gateway Settings</h5>
                        <p className="text-muted fs-13 mb-0">
                          Directly updates Moodle core configuration ($CFG) and Pesapal API 3.0 gateway parameters.
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          onClick={handlePurgeCache}
                          disabled={isPurging}
                          className="btn btn-outline-danger btn-sm rounded-pill px-3"
                        >
                          <i className={`isax isax-refresh-2 me-1 ${isPurging ? 'fa-spin' : ''}`} />
                          Purge Caches
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingSettings}
                          className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm"
                        >
                          <i className="isax isax-tick-circle me-1" />
                          {isSavingSettings ? 'Saving...' : 'Save Configuration'}
                        </button>
                      </div>
                    </div>

                    <div className="row g-4">
                      {/* Institutional Profile */}
                      <div className="col-lg-6">
                        <div className="card border p-3 h-100 shadow-sm rounded-3">
                          <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                            <i className="isax isax-building fs-18" /> Institutional Profile & Branding
                          </h6>
                          <div className="mb-3">
                            <label className="form-label fs-13 fw-medium">University Full Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={settings.site.fullname}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  site: { ...settings.site, fullname: e.target.value },
                                })
                              }
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fs-13 fw-medium">System Short Code</label>
                            <input
                              type="text"
                              className="form-control"
                              value={settings.site.shortname}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  site: { ...settings.site, shortname: e.target.value },
                                })
                              }
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fs-13 fw-medium">Site Summary / Charter</label>
                            <textarea
                              className="form-control"
                              rows={2}
                              value={settings.site.summary}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  site: { ...settings.site, summary: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                            <div>
                              <div className="fw-medium fs-13">Maintenance Mode</div>
                              <div className="fs-11 text-muted">Restrict student access during scheduled maintenance</div>
                            </div>
                            <div className="form-check form-switch mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={settings.site.maintenance_enabled}
                                onChange={(e) =>
                                  setSettings({
                                    ...settings,
                                    site: { ...settings.site, maintenance_enabled: e.target.checked },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pesapal Payment Gateway Settings */}
                      <div className="col-lg-6">
                        <div className="card border p-3 h-100 shadow-sm rounded-3">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold text-success mb-0 d-flex align-items-center gap-2">
                              <i className="isax isax-card fs-18" /> Pesapal API 3.0 Payment Gateway
                            </h6>
                            <div className="form-check form-switch mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={settings.payment.pesapal_enabled}
                                onChange={(e) =>
                                  setSettings({
                                    ...settings,
                                    payment: { ...settings.payment, pesapal_enabled: e.target.checked },
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fs-13 fw-medium">Gateway Environment</label>
                            <select
                              className="form-select"
                              value={settings.payment.pesapal_environment}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  payment: { ...settings.payment, pesapal_environment: e.target.value },
                                })
                              }
                            >
                              <option value="sandbox">Sandbox (Testing & Staging)</option>
                              <option value="production">Production Live (Pesapal Tanzania)</option>
                            </select>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fs-13 fw-medium">Pesapal Consumer Key</label>
                            <input
                              type="text"
                              className="form-control"
                              value={settings.payment.pesapal_consumer_key}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  payment: { ...settings.payment, pesapal_consumer_key: e.target.value },
                                })
                              }
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label fs-13 fw-medium">Pesapal Consumer Secret</label>
                            <input
                              type="password"
                              className="form-control"
                              placeholder="••••••••••••••••"
                              value={settings.payment.pesapal_consumer_secret}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  payment: { ...settings.payment, pesapal_consumer_secret: e.target.value },
                                })
                              }
                            />
                          </div>

                          <div className="row g-2">
                            <div className="col-8">
                              <label className="form-label fs-13 fw-medium">Instant Payment Notification (IPN) ID</label>
                              <input
                                type="text"
                                className="form-control"
                                value={settings.payment.pesapal_ipn_id}
                                onChange={(e) =>
                                  setSettings({
                                    ...settings,
                                    payment: { ...settings.payment, pesapal_ipn_id: e.target.value },
                                  })
                                }
                              />
                            </div>
                            <div className="col-4">
                              <label className="form-label fs-13 fw-medium">Currency</label>
                              <input
                                type="text"
                                className="form-control text-uppercase"
                                value={settings.payment.defaultcurrency}
                                onChange={(e) =>
                                  setSettings({
                                    ...settings,
                                    payment: { ...settings.payment, defaultcurrency: e.target.value },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Server & Telemetry Node Details */}
                      <div className="col-12">
                        <div className="card border p-3 shadow-sm rounded-3 bg-light">
                          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                            <i className="isax isax-monitor fs-18 text-primary" /> Subsystem Node & Engine Diagnostics
                          </h6>
                          <div className="row g-3">
                            <div className="col-sm-6 col-md-3">
                              <div className="fs-12 text-muted">PHP Engine</div>
                              <div className="fw-bold text-dark">{settings.server.php_version}</div>
                            </div>
                            <div className="col-sm-6 col-md-3">
                              <div className="fs-12 text-muted">Moodle Release</div>
                              <div className="fw-bold text-dark">{settings.server.moodle_release}</div>
                            </div>
                            <div className="col-sm-6 col-md-3">
                              <div className="fs-12 text-muted">Database Engine</div>
                              <div className="fw-bold text-dark">
                                {settings.server.db_type.toUpperCase()} ({settings.server.db_server})
                              </div>
                            </div>
                            <div className="col-sm-6 col-md-3">
                              <div className="fs-12 text-muted">OPCache Accelerator</div>
                              <div className="fw-bold text-success">
                                {settings.server.opcache_enabled ? 'Operational & Accelerated' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* ============================================================== */}
                {/* 4. USER DIRECTORY TAB                                          */}
                {/* ============================================================== */}
                {activeTab === 'users' && (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>User / Academic Scholar</th>
                          <th>Role</th>
                          <th>Registration / Staff ID</th>
                          <th>Department / Faculty</th>
                          <th>Status</th>
                          <th>Last Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="avatar avatar-sm rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold">
                                  {u.fullname.charAt(0)}
                                </div>
                                <div>
                                  <div className="fw-bold text-dark">{u.fullname}</div>
                                  <div className="text-muted fs-12">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  u.role === 'Administrator'
                                    ? 'bg-danger-subtle text-danger'
                                    : u.role === 'Instructor'
                                    ? 'bg-warning-subtle text-warning'
                                    : 'bg-primary-subtle text-primary'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td>
                              <span className="font-monospace fs-12">{u.regNumber}</span>
                            </td>
                            <td>
                              <span className="fs-13">{u.department}</span>
                            </td>
                            <td>
                              <span className="badge bg-success-subtle text-success">{u.status}</span>
                            </td>
                            <td>
                              <span className="text-muted fs-12">{u.lastAccess}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ============================================================== */}
                {/* 5. PESAPAL RECONCILIATION LEDGER TAB                           */}
                {/* ============================================================== */}
                {activeTab === 'ledger' && (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Tracking & Ref ID</th>
                          <th>Student / Scholar</th>
                          <th>Course Academic Unit</th>
                          <th>Tuition Amount</th>
                          <th>Payment Method</th>
                          <th>Status</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="font-monospace fs-12 fw-bold text-dark">{item.reference}</div>
                              <div className="text-muted font-monospace fs-11">{item.trackingId.substring(0, 18)}...</div>
                            </td>
                            <td>
                              <div className="fw-medium text-dark">{item.studentName}</div>
                            </td>
                            <td>
                              <div className="fw-bold fs-13">{item.courseCode}</div>
                              <div className="text-muted fs-11">{item.courseTitle}</div>
                            </td>
                            <td>
                              <span className="fw-bold text-success">{item.amount}</span>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                <i className="isax isax-mobile me-1" />
                                {item.method}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-success-subtle text-success">
                                <i className="isax isax-verify me-1" />
                                {item.status}
                              </span>
                            </td>
                            <td>
                              <span className="text-muted fs-12">{item.timestamp}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ============================================================== */}
                {/* 6. SYSTEM HEALTH & NODES TAB                                   */}
                {/* ============================================================== */}
                {activeTab === 'health' && (
                  <div className="row g-3">
                    {health.map((item, idx) => (
                      <div key={idx} className="col-md-6">
                        <div className="card border p-3 shadow-sm h-100 rounded-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold text-dark">{item.component}</span>
                            <span className="badge bg-success-subtle text-success">
                              <i className="isax isax-verify me-1" />
                              {item.status}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center text-muted fs-13 mb-2">
                            <span>Roundtrip Latency</span>
                            <span className="font-monospace fw-bold text-primary">{item.latency}</span>
                          </div>
                          <p className="text-muted fs-12 mb-0 bg-light p-2 rounded">{item.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Direct Moodle Backend Access Card */}
            <div className="card border-0 shadow-sm p-4 bg-light rounded-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h6 className="fw-bold mb-1">Moodle Core Administrative Gateway</h6>
                  <p className="text-muted fs-13 mb-0">
                    Access advanced Moodle site administration, database backup schemas, and server cron orchestration directly.
                  </p>
                </div>
                <a
                  href="http://localhost/outlmstheme/moodle-backend/admin/index.php"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-dark rounded-pill btn-sm px-4 shadow-sm"
                >
                  <i className="isax isax-external-drive me-1" /> Open Moodle Site Admin
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: CREATE NEW COURSE MODEL                               */}
      {/* ============================================================== */}
      {showCourseModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold text-white">
                  <i className="isax isax-add me-2" /> Create New Course Learning Model
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCourseModal(false)}
                />
              </div>
              <form onSubmit={handleCreateCourse}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fs-13 fw-medium">Course Full Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Artificial Intelligence & Machine Learning"
                        value={newCourse.fullname}
                        onChange={(e) => setNewCourse({ ...newCourse, fullname: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fs-13 fw-medium">Course Shortcode</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. CS305"
                        value={newCourse.shortname}
                        onChange={(e) => setNewCourse({ ...newCourse, shortname: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fs-13 fw-medium">Faculty / Department Category</label>
                      <select
                        className="form-select"
                        value={newCourse.category_id}
                        onChange={(e) => setNewCourse({ ...newCourse, category_id: parseInt(e.target.value) })}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fs-13 fw-medium">Curriculum Modules</label>
                      <select
                        className="form-select"
                        value={newCourse.num_sections}
                        onChange={(e) => setNewCourse({ ...newCourse, num_sections: parseInt(e.target.value) })}
                      >
                        <option value="4">4 Modules (Short)</option>
                        <option value="6">6 Modules (Standard)</option>
                        <option value="8">8 Modules (Comprehensive)</option>
                        <option value="12">12 Modules (Annual)</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fs-13 fw-medium">Tuition Fee (TZS)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newCourse.tuition_fee}
                        onChange={(e) => setNewCourse({ ...newCourse, tuition_fee: parseFloat(e.target.value) })}
                        step="5000"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fs-13 fw-medium">Course Summary & Syllabus Overview</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Detailed academic course summary and learning outcomes..."
                        value={newCourse.summary}
                        onChange={(e) => setNewCourse({ ...newCourse, summary: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowCourseModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm">
                    Create Course Model
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ADD LEARNING ACTIVITY MODULE                          */}
      {/* ============================================================== */}
      {showActivityModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-success text-white border-0">
                <h5 className="modal-title fw-bold text-white">
                  <i className="isax isax-add-circle me-2" /> Add Learning Activity to Course Section
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowActivityModal(false)}
                />
              </div>
              <form onSubmit={handleAddActivity}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fs-13 fw-medium">Target Course</label>
                      <select
                        className="form-select"
                        value={newActivity.course_id}
                        onChange={(e) => setNewActivity({ ...newActivity, course_id: parseInt(e.target.value) })}
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.shortname} - {c.fullname}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fs-13 fw-medium">Section / Module</label>
                      <select
                        className="form-select"
                        value={newActivity.section}
                        onChange={(e) => setNewActivity({ ...newActivity, section: parseInt(e.target.value) })}
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((sec) => (
                          <option key={sec} value={sec}>
                            {sec === 0 ? 'General Section 0' : `Module ${sec}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fs-13 fw-medium">Activity Type</label>
                      <select
                        className="form-select"
                        value={newActivity.mod_type}
                        onChange={(e) =>
                          setNewActivity({
                            ...newActivity,
                            mod_type: e.target.value as 'page' | 'quiz' | 'assign' | 'resource',
                          })
                        }
                      >
                        <option value="page">📄 Page / Lecture</option>
                        <option value="quiz">📝 Quiz Assessment</option>
                        <option value="assign">📋 Assignment Task</option>
                        <option value="resource">📁 Resource / File</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fs-13 fw-medium">Activity Name / Assessment Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Module 2 Graded Quiz on Search Algorithms"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fs-13 fw-medium">Academic Content & Instructions</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Instructions, reading notes, or assessment guidelines for students..."
                        value={newActivity.content}
                        onChange={(e) => setNewActivity({ ...newActivity, content: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowActivityModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success rounded-pill px-4 shadow-sm">
                    Attach Activity Module
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: INSTALL PLUGIN PACKAGE (.ZIP)                         */}
      {/* ============================================================== */}
      {showPluginModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-dark text-white border-0">
                <h5 className="modal-title fw-bold text-white">
                  <i className="isax isax-import me-2" /> Install Moodle Plugin / Gateway
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPluginModal(false)}
                />
              </div>
              <form onSubmit={handleInstallPlugin}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fs-13 fw-medium">Upload Plugin ZIP Archive</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".zip"
                      onChange={(e) => setPluginInstallFile(e.target.files ? e.target.files[0] : null)}
                    />
                    <div className="form-text fs-12">
                      Supports Moodle activity modules, payment gateways (paygw), and themes.
                    </div>
                  </div>

                  <div className="text-center my-2 text-muted fs-12">--- OR BY COMPONENT IDENTIFIER ---</div>

                  <div className="mb-3">
                    <label className="form-label fs-13 fw-medium">Component Identifier</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. paygw_pesapal or mod_scorm"
                      value={pluginComponentName}
                      onChange={(e) => setPluginComponentName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowPluginModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-4 shadow-sm"
                    disabled={!pluginInstallFile && !pluginComponentName}
                  >
                    Install & Validate
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
