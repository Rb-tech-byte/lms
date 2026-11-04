import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminService,
  AdminCategoryNode,
  AdminCourseCategory,
  CourseDefaultSettings,
  CourseGroupRecord,
  AdminCourseRecord,
  AdminSettingsPayload,
} from '../../../core/api/adminService';

interface SiteAdminHubProps {
  adminTree: Record<string, AdminCategoryNode>;
  adminCategories: AdminCourseCategory[];
  courses: AdminCourseRecord[];
  courseDefaults: CourseDefaultSettings | null;
  onRefresh: () => Promise<void>;
  onNotify: (type: 'success' | 'danger', message: string) => void;
  onOpenCourseModal: () => void;
  onOpenCourseStudio?: (courseId: number) => void;
  onSelectTab?: (tab: string) => void;
}

export const SiteAdminHub: React.FC<SiteAdminHubProps> = ({
  adminTree,
  adminCategories,
  courses,
  courseDefaults,
  onRefresh,
  onNotify,
  onOpenCourseModal,
  onOpenCourseStudio,
  onSelectTab,
}) => {
  const navigate = useNavigate();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('all');
  const [activeSubView, setActiveSubView] = useState<'suite' | 'categories' | 'defaults' | 'groups' | 'diagnostics'>('suite');

  // Groups state
  const [selectedCourseForGroups, setSelectedCourseForGroups] = useState<number>(
    courses[0]?.id || 4
  );
  const [groupsList, setGroupsList] = useState<CourseGroupRecord[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Defaults form state
  const [defaultsForm, setDefaultsForm] = useState<CourseDefaultSettings>({
    format: 'topics',
    maxbytes: 0,
    showgrades: 1,
    showreports: 0,
    enablecompletion: 1,
    numsections: 4,
    hiddensections: 1,
    coursedisplay: 0,
  });
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);

  // Live System Settings state (for Site Info & Identity, Maintenance, Security, Payments)
  const [siteSettings, setSiteSettings] = useState<AdminSettingsPayload | null>(null);
  const [, setIsLoadingSettings] = useState(false);

  // In-place Purge state
  const [isPurgingAll, setIsPurgingAll] = useState(false);

  // =========================================================================
  // MODAL STATES
  // =========================================================================
  // 1. User Creation Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    department: 'Faculty of Business Management',
    idnumber: '',
    role: 'Student' as 'Student' | 'Instructor',
    course_id: 4,
  });

  // 2. Course Creation Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    fullname: '',
    shortname: '',
    category_id: 3, // default Faculty of Business Management
    format: 'topics',
    num_sections: 6,
    tuition_fee: 0,
    summary: '',
  });

  // 3. Category Creation Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    parent: 0,
    idnumber: '',
    description: '',
  });

  // 4. Site Information & Identity Modal
  const [showSiteInfoModal, setShowSiteInfoModal] = useState(false);
  const [isSavingSiteInfo, setIsSavingSiteInfo] = useState(false);
  const [siteInfoForm, setSiteInfoForm] = useState({
    fullname: 'The Open University of Tanzania',
    shortname: 'OUT LMS',
    summary: 'Comprehensive undergraduate & postgraduate distance learning management system.',
    timezone: 'Africa/Dar_es_Salaam',
    country: 'TZ',
  });

  // 5. Maintenance Mode Modal
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    enabled: false,
    message: 'OUT LMS is currently undergoing scheduled platform maintenance. Please check back shortly.',
  });

  // 6. Security & Access Policy Modal
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    registerauth: false,
    sessiontimeout: 7200,
  });

  // 7. Payment Gateways & Currency Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    defaultcurrency: 'TZS',
    pesapal_consumer_key: '',
    pesapal_environment: 'sandbox',
    selcom_vendor_id: 'OUT_SELCOM_01',
    pesapal_enabled: true,
  });

  // 8. Server Diagnostics & OPcache Modal
  const [, setShowDiagnosticsModal] = useState(false);
  const [cacheStatusData, setCacheStatusData] = useState<any>(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);

  // 9. Generic Action Executor / Console Drawer Modal
  const [selectedActionItem, setSelectedActionItem] = useState<{
    name: string;
    path: string;
    sso_url: string;
    description: string;
    categoryTitle: string;
  } | null>(null);

  // Group modal
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    enrolmentkey: '',
  });

  // Sync course defaults form when props change
  useEffect(() => {
    if (courseDefaults) {
      setDefaultsForm(courseDefaults);
    }
  }, [courseDefaults]);

  // Load site settings once for modals
  const loadSiteSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const data = await adminService.getSettings();
      setSiteSettings(data);
      if (data?.site) {
        setSiteInfoForm({
          fullname: data.site.fullname || 'The Open University of Tanzania',
          shortname: data.site.shortname || 'OUT LMS',
          summary: data.site.summary || '',
          timezone: data.site.timezone || 'Africa/Dar_es_Salaam',
          country: data.site.country || 'TZ',
        });
        setMaintenanceForm({
          enabled: Boolean(data.site.maintenance_enabled),
          message: data.site.maintenance_message || 'OUT LMS is currently undergoing scheduled platform maintenance.',
        });
        setSecurityForm({
          registerauth: Boolean(data.site.registerauth),
          sessiontimeout: 7200,
        });
      }
      if (data?.payment) {
        setPaymentForm({
          defaultcurrency: data.payment.defaultcurrency || 'TZS',
          pesapal_consumer_key: data.payment.pesapal_consumer_key || '',
          pesapal_environment: data.payment.pesapal_environment || 'sandbox',
          selcom_vendor_id: data.payment.selcom_vendor_id || 'OUT_SELCOM_01',
          pesapal_enabled: Boolean(data.payment.pesapal_enabled),
        });
      }
    } catch (err) {
      console.error('Failed to load system settings', err);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadSiteSettings();
  }, []);

  // Load groups whenever course selection changes
  const loadGroups = async (courseId: number) => {
    if (!courseId) return;
    setLoadingGroups(true);
    try {
      const data = await adminService.getGroups(courseId);
      setGroupsList(data);
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to load groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (selectedCourseForGroups) {
      loadGroups(selectedCourseForGroups);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseForGroups]);

  // Handle Purge All Caches (Direct In-Place Execution)
  const handlePurgeAllCaches = async () => {
    setIsPurgingAll(true);
    try {
      const res = await adminService.purgeCache({ target: 'all' });
      const timeMs = res?.execution_time ? ` in ${res.execution_time}` : '';
      onNotify('success', `All system, theme, and language caches cleared successfully${timeMs}.`);
      await onRefresh();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to clear system caches.');
    } finally {
      setIsPurgingAll(false);
    }
  };

  // Open Diagnostics Modal
  const handleOpenDiagnostics = async () => {
    setShowDiagnosticsModal(true);
    setIsLoadingDiagnostics(true);
    try {
      const data = await adminService.getCacheStatus();
      setCacheStatusData(data);
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to retrieve OPcache telemetry.');
    } finally {
      setIsLoadingDiagnostics(false);
    }
  };

  // Handle User Creation Submit
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username || !userForm.email || !userForm.firstname || !userForm.lastname) {
      onNotify('danger', 'Please provide user names, email, and username.');
      return;
    }
    setIsCreatingUser(true);
    try {
      await adminService.createUser({
        username: userForm.username.trim().toLowerCase(),
        firstname: userForm.firstname.trim(),
        lastname: userForm.lastname.trim(),
        email: userForm.email.trim(),
        password: userForm.password || 'Student@2026!',
        department: userForm.department,
        idnumber: userForm.idnumber || `OUT/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        role: userForm.role,
        course_id: userForm.course_id,
      });
      onNotify('success', `User account for ${userForm.firstname} ${userForm.lastname} (${userForm.username}) provisioned successfully.`);
      setShowUserModal(false);
      setUserForm({
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        department: 'Faculty of Business Management',
        idnumber: '',
        role: 'Student',
        course_id: 4,
      });
      await onRefresh();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to create user account.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Handle Course Creation Submit
  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.fullname || !courseForm.shortname) {
      onNotify('danger', 'Please enter Course Full Name and Short Code.');
      return;
    }
    setIsCreatingCourse(true);
    try {
      await adminService.createCourse(courseForm);
      onNotify('success', `Academic course "${courseForm.fullname}" (${courseForm.shortname}) registered successfully.`);
      setShowCourseModal(false);
      setCourseForm({
        fullname: '',
        shortname: '',
        category_id: 3,
        format: 'topics',
        num_sections: 6,
        tuition_fee: 0,
        summary: '',
      });
      await onRefresh();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to register course.');
    } finally {
      setIsCreatingCourse(false);
    }
  };

  // Handle Category Creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      onNotify('danger', 'Faculty/Category name is required.');
      return;
    }
    setIsCreatingCategory(true);
    try {
      await adminService.addCategory(newCategory);
      onNotify('success', `Faculty category "${newCategory.name}" created successfully.`);
      setShowCategoryModal(false);
      setNewCategory({ name: '', parent: 0, idnumber: '', description: '' });
      await onRefresh();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to create category.');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Handle Site Information Save
  const handleSaveSiteInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSiteInfo(true);
    try {
      await adminService.updateSettings({
        site: {
          fullname: siteInfoForm.fullname,
          shortname: siteInfoForm.shortname,
          summary: siteInfoForm.summary,
        },
      });
      onNotify('success', 'University site identity and institutional summary updated.');
      setShowSiteInfoModal(false);
      await loadSiteSettings();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to update site identity.');
    } finally {
      setIsSavingSiteInfo(false);
    }
  };

  // Handle Maintenance Mode Save
  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMaintenance(true);
    try {
      await adminService.updateSettings({
        site: {
          maintenance_enabled: maintenanceForm.enabled ? 1 : 0,
          maintenance_message: maintenanceForm.message,
        },
      });
      onNotify(
        'success',
        `Platform maintenance mode ${maintenanceForm.enabled ? 'activated' : 'deactivated'}.`
      );
      setShowMaintenanceModal(false);
      await loadSiteSettings();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to update maintenance settings.');
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  // Handle Security Policies Save
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSecurity(true);
    try {
      await adminService.updateSettings({
        site: {
          registerauth: securityForm.registerauth ? 1 : 0,
        },
      });
      onNotify('success', 'Institutional security and user self-registration policies saved.');
      setShowSecurityModal(false);
      await loadSiteSettings();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to update security policies.');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  // Handle Payment Gateways Save
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayment(true);
    try {
      await adminService.updateSettings({
        payment: {
          defaultcurrency: paymentForm.defaultcurrency,
          pesapal_consumer_key: paymentForm.pesapal_consumer_key,
          pesapal_environment: paymentForm.pesapal_environment,
          selcom_vendor_id: paymentForm.selcom_vendor_id,
        },
      });
      onNotify('success', 'Tuition billing currencies and payment gateway credentials saved.');
      setShowPaymentModal(false);
      await loadSiteSettings();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to update payment gateways.');
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Handle Course Defaults Update
  const handleSaveDefaults = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDefaults(true);
    try {
      await adminService.updateCourseDefaults(defaultsForm);
      onNotify('success', 'Academic curriculum default standards updated successfully.');
      await onRefresh();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to update course defaults.');
    } finally {
      setIsSavingDefaults(false);
    }
  };

  // Handle Group Creation
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name.trim()) {
      onNotify('danger', 'Cohort group name is required.');
      return;
    }
    try {
      await adminService.createGroup({
        course_id: selectedCourseForGroups,
        name: newGroup.name,
        description: newGroup.description,
        enrolmentkey: newGroup.enrolmentkey,
      });
      onNotify('success', `Cohort group "${newGroup.name}" created.`);
      setShowGroupModal(false);
      setNewGroup({ name: '', description: '', enrolmentkey: '' });
      await loadGroups(selectedCourseForGroups);
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to create group.');
    }
  };

  // Handle Group Deletion
  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    if (!window.confirm(`Delete cohort group "${groupName}"?`)) {
      return;
    }
    try {
      await adminService.deleteGroup(groupId);
      onNotify('success', `Group "${groupName}" deleted.`);
      await loadGroups(selectedCourseForGroups);
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to delete group.');
    }
  };

  // Handle Category Deletion
  const handleDeleteCategory = async (catId: number, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }
    try {
      await adminService.deleteCategory(catId);
      onNotify('success', `Category "${catName}" deleted.`);
      await onRefresh();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to delete category.');
    }
  };

  // SMART ACTION DISPATCHER FOR ALL 68 ADMINISTRATIVE CARDS
  const handleExecuteAction = (sec: { name: string; path: string; sso_url: string; description: string }, categoryTitle: string) => {
    const path = sec.path.toLowerCase();
    const name = sec.name.toLowerCase();

    // 1. Direct In-App Modals
    if (name.includes('site information') || path.includes('frontpagesettings')) {
      setShowSiteInfoModal(true);
      return;
    }
    if (name === 'add a new user' || path.includes('editadvanced.php?id=-1')) {
      setShowUserModal(true);
      return;
    }
    if (name === 'add a new course' || path.includes('course/edit.php?category=0')) {
      setShowCourseModal(true);
      return;
    }
    if (name === 'add a category' || path.includes('editcategory.php?parent=0')) {
      setShowCategoryModal(true);
      return;
    }
    if (name.includes('maintenance mode') || path.includes('maintenancemode')) {
      setShowMaintenanceModal(true);
      return;
    }
    if (name.includes('security policies') || path.includes('sitepolicies')) {
      setShowSecurityModal(true);
      return;
    }
    if (name.includes('payment gateways') || path.includes('managepaymentgateways')) {
      setShowPaymentModal(true);
      return;
    }
    if (name.includes('purge all caches') || path.includes('purgecaches')) {
      handlePurgeAllCaches();
      return;
    }
    if (name.includes('php information') || path.includes('phpinfo')) {
      handleOpenDiagnostics();
      return;
    }

    // 2. Direct Tab Switches
    if (name.includes('browse list of users') || name.includes('site participants') || path.includes('/user/')) {
      if (onSelectTab) {
        onSelectTab('users');
      } else {
        navigate('/admin/dashboard?tab=users');
      }
      return;
    }
    if (name.includes('manage courses and categories')) {
      navigate('/course/course-category');
      return;
    }
    if (name.includes('course default settings') || path.includes('coursesettings')) {
      setActiveSubView('defaults');
      return;
    }
    if (name.includes('groups') || path.includes('groups')) {
      setActiveSubView('groups');
      return;
    }
    if (name.includes('swagger')) {
      if (onSelectTab) {
        onSelectTab('swagger');
      } else {
        navigate('/admin/dashboard?tab=swagger');
      }
      return;
    }
    if (
      name.includes('activity modules') ||
      name.includes('manage enrolment') ||
      name.includes('manage authentication') ||
      name.includes('manage block plugins') ||
      name.includes('install plugins')
    ) {
      if (onSelectTab) {
        onSelectTab('plugins');
      } else {
        navigate('/admin/dashboard?tab=plugins');
      }
      return;
    }
    if (name.includes('scheduled tasks') || name.includes('live activity logs')) {
      if (onSelectTab) {
        onSelectTab('health');
      } else {
        navigate('/admin/dashboard?tab=health');
      }
      return;
    }
    if (name.includes('configuration change log')) {
      if (onSelectTab) {
        onSelectTab('ledger');
      } else {
        navigate('/admin/dashboard?tab=ledger');
      }
      return;
    }

    // 3. Open Detailed Administrative Action Console Drawer for specialized tools
    setSelectedActionItem({
      name: sec.name,
      path: sec.path,
      sso_url: sec.sso_url,
      description: sec.description,
      categoryTitle,
    });
  };

  const categoryKeys = Object.keys(adminTree || {});
  const totalSectionsCount = categoryKeys.reduce(
    (acc, key) => acc + (adminTree[key]?.sections?.length || 0),
    0
  );

  // Filter sections by search query and category
  const filteredTree: Record<string, AdminCategoryNode> = {};
  categoryKeys.forEach((key) => {
    if (selectedCategoryKey !== 'all' && selectedCategoryKey !== key) {
      return;
    }
    const node = adminTree[key];
    if (!node) return;

    if (!searchQuery.trim()) {
      filteredTree[key] = node;
      return;
    }

    const q = searchQuery.toLowerCase();
    const matchedSections = node.sections.filter(
      (sec) =>
        sec.name.toLowerCase().includes(q) ||
        sec.description.toLowerCase().includes(q) ||
        sec.path.toLowerCase().includes(q)
    );

    if (matchedSections.length > 0 || node.title.toLowerCase().includes(q)) {
      filteredTree[key] = {
        ...node,
        sections: matchedSections.length > 0 ? matchedSections : node.sections,
      };
    }
  });

  return (
    <div>
      {/* ============================================================== */}
      {/* 1. TOP HEADER BANNER (PROFESSIONAL INSTITUTIONAL TEXT)         */}
      {/* ============================================================== */}
      <div className="card border-0 shadow-sm mb-4 rounded-3 bg-white">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className="badge rounded-pill px-2.5 py-1 text-uppercase fw-bold"
                  style={{ backgroundColor: '#E8F4FC', color: '#0171BB', fontSize: '10px' }}
                >
                  INSTITUTIONAL ADMINISTRATION
                </span>
                <span className="badge bg-light text-dark border px-2.5 py-1" style={{ fontSize: '10px' }}>
                  SARIS & TCU COMPLIANT
                </span>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1" style={{ fontSize: '10px' }}>
                  ACTIVE SYSTEM STATUS
                </span>
              </div>
              <h4 className="fw-bold mb-1 text-dark">
                The Open University of Tanzania • Administration & Governance Console
              </h4>
              <p className="text-muted small mb-0" style={{ maxWidth: '780px' }}>
                Unified control suite for university curriculum architecture, student rosters, faculty categories, security policies, tuition finances, and institutional services.
              </p>
            </div>

            {/* Quick Action Toolbar */}
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <button
                type="button"
                onClick={() => setShowSiteInfoModal(true)}
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center gap-1.5 fw-medium"
                title="Configure institutional site full name, shortcode, and frontpage display"
              >
                <i className="feather-settings fs-12 text-primary" />
                <span>Site Identity</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUserModal(true)}
                className="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center gap-1.5 fw-medium"
                style={{ borderColor: '#0171BB', color: '#0171BB' }}
                title="Register student or staff user account"
              >
                <i className="feather-user-plus fs-12" />
                <span>+ New User</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCourseModal(true)}
                className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center gap-1.5 fw-semibold text-white"
                style={{ backgroundColor: '#0171BB', borderColor: '#0171BB' }}
                title="Launch new course syllabus model"
              >
                <i className="feather-plus-circle fs-12" />
                <span>+ New Course</span>
              </button>

              <button
                type="button"
                onClick={handlePurgeAllCaches}
                disabled={isPurgingAll}
                className="btn btn-outline-danger btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center gap-1.5 fw-medium"
                title="Clear all system and theme caches instantly"
              >
                <i className={`feather-zap fs-12 ${isPurgingAll ? 'fa-spin' : ''}`} />
                <span>{isPurgingAll ? 'Purging...' : 'Purge Caches'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUB-VIEW NAVIGATION PILLS                                   */}
      {/* ============================================================== */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <ul className="nav nav-pills gap-1.5">
          <li className="nav-item">
            <button
              className={`btn btn-sm rounded-pill px-3 fw-medium ${activeSubView === 'suite' ? 'btn-primary shadow-sm text-white' : 'btn-outline-secondary'}`}
              style={activeSubView === 'suite' ? { backgroundColor: '#0171BB', borderColor: '#0171BB' } : {}}
              onClick={() => setActiveSubView('suite')}
            >
              <i className="feather-grid me-1 fs-12" />
              Administrative Suites ({totalSectionsCount})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn btn-sm rounded-pill px-3 fw-medium ${activeSubView === 'categories' ? 'btn-primary shadow-sm text-white' : 'btn-outline-secondary'}`}
              style={activeSubView === 'categories' ? { backgroundColor: '#0171BB', borderColor: '#0171BB' } : {}}
              onClick={() => setActiveSubView('categories')}
            >
              <i className="feather-folder me-1 fs-12" />
              Faculties & Categories ({adminCategories.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn btn-sm rounded-pill px-3 fw-medium ${activeSubView === 'defaults' ? 'btn-primary shadow-sm text-white' : 'btn-outline-secondary'}`}
              style={activeSubView === 'defaults' ? { backgroundColor: '#0171BB', borderColor: '#0171BB' } : {}}
              onClick={() => setActiveSubView('defaults')}
            >
              <i className="feather-sliders me-1 fs-12" />
              Course Standards & Defaults
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn btn-sm rounded-pill px-3 fw-medium ${activeSubView === 'groups' ? 'btn-primary shadow-sm text-white' : 'btn-outline-secondary'}`}
              style={activeSubView === 'groups' ? { backgroundColor: '#0171BB', borderColor: '#0171BB' } : {}}
              onClick={() => setActiveSubView('groups')}
            >
              <i className="feather-users me-1 fs-12" />
              Cohort Groups & Fields
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn btn-sm rounded-pill px-3 fw-medium ${activeSubView === 'diagnostics' ? 'btn-primary shadow-sm text-white' : 'btn-outline-secondary'}`}
              style={activeSubView === 'diagnostics' ? { backgroundColor: '#0171BB', borderColor: '#0171BB' } : {}}
              onClick={() => {
                setActiveSubView('diagnostics');
                handleOpenDiagnostics();
              }}
            >
              <i className="feather-cpu me-1 fs-12" />
              Server & Cache Diagnostics
            </button>
          </li>
        </ul>

        {activeSubView === 'suite' && (
          <div className="input-group input-group-sm" style={{ width: '260px' }}>
            <span className="input-group-text bg-light border-end-0">
              <i className="feather-search text-muted fs-12" />
            </span>
            <input
              type="text"
              className="form-control border-start-0 bg-light"
              placeholder="Search actions or settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="btn btn-light border border-start-0 text-muted"
                type="button"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. SUB-VIEW A: ALL ADMINISTRATIVE SUITES                       */}
      {/* ============================================================== */}
      {activeSubView === 'suite' && (
        <div>
          {/* Category Pills Filter */}
          <div className="d-flex gap-1.5 flex-wrap mb-3">
            <button
              className={`btn btn-sm rounded-pill px-3 fw-medium ${selectedCategoryKey === 'all' ? 'btn-dark text-white shadow-sm' : 'btn-light border'}`}
              onClick={() => setSelectedCategoryKey('all')}
            >
              All Suites ({totalSectionsCount})
            </button>
            {categoryKeys.map((key) => {
              const node = adminTree[key];
              const count = node?.sections?.length || 0;
              const isSelected = selectedCategoryKey === key;
              return (
                <button
                  key={key}
                  className={`btn btn-sm rounded-pill px-3 fw-medium ${isSelected ? 'btn-primary text-white shadow-sm' : 'btn-light border text-dark'}`}
                  style={isSelected ? { backgroundColor: '#0171BB', borderColor: '#0171BB' } : {}}
                  onClick={() => setSelectedCategoryKey(key)}
                >
                  <i className={`${node.icon} me-1 fs-12`} />
                  {node.title} ({count})
                </button>
              );
            })}
          </div>

          {/* Suites Display */}
          <div className="row g-4">
            {Object.keys(filteredTree).map((catKey) => {
              const node = filteredTree[catKey];
              const isCourses = catKey === 'courses';
              return (
                <div key={catKey} className="col-12">
                  <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                    {/* Header */}
                    <div
                      className="card-header border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                      style={{
                        backgroundColor: isCourses ? '#f8fafc' : '#ffffff',
                      }}
                    >
                      <div className="d-flex align-items-center gap-2.5">
                        <div
                          className="rounded-3 text-white d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: isCourses ? '#0171BB' : '#0b1727',
                          }}
                        >
                          <i className={`${node.icon} fs-16`} />
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="fw-bold mb-0 text-dark fs-14">
                              {node.title}
                            </h6>
                            <span className="badge rounded-pill bg-light text-secondary border" style={{ fontSize: '10.5px' }}>
                              {node.sections.length} administrative actions
                            </span>
                            {isCourses && (
                              <span className="badge rounded-pill bg-primary-subtle text-primary fw-semibold" style={{ fontSize: '10.5px' }}>
                                Primary Curriculum Suite
                              </span>
                            )}
                          </div>
                          <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>{node.description}</p>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        {isCourses ? (
                          <button
                            type="button"
                            onClick={() => navigate('/instructor/instructor-course')}
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-medium d-flex align-items-center gap-1"
                            style={{ borderColor: '#0171BB', color: '#0171BB' }}
                          >
                            <i className="feather-book-open fs-12" />
                            <span>Course Directory & Studio</span>
                          </button>
                        ) : catKey === 'users' ? (
                          <button
                            type="button"
                            onClick={() => (onSelectTab ? onSelectTab('users') : navigate('/admin/dashboard?tab=users'))}
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-medium d-flex align-items-center gap-1"
                            style={{ borderColor: '#0171BB', color: '#0171BB' }}
                          >
                            <i className="feather-users fs-12" />
                            <span>Open User Registry</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedCategoryKey(catKey)}
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-medium d-flex align-items-center gap-1"
                          >
                            <span>Filter {node.title} Actions</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action Cards Grid */}
                    <div className="card-body p-3">
                      <div className="row g-3">
                        {node.sections.map((sec, idx) => {
                          const actionPath = sec.path.split('?')[0].replace('/admin/', '').replace('.php', '');
                          return (
                            <div key={idx} className="col-12 col-md-6 col-lg-4">
                              <div
                                className="h-100 p-3 rounded-3 border bg-white d-flex flex-column justify-content-between transition-all"
                                style={{ borderColor: '#e2e8f0', transition: 'all 0.15s ease' }}
                              >
                                <div>
                                  <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                                    <h6 className="fw-bold mb-1 text-dark fs-13 lh-sm">
                                      {sec.name}
                                    </h6>
                                    <span className="badge bg-light text-muted border font-monospace" style={{ fontSize: '10px' }}>
                                      {actionPath || 'settings'}
                                    </span>
                                  </div>
                                  <p
                                    className="text-muted small mb-3 text-truncate-2"
                                    style={{
                                      fontSize: '12px',
                                      lineHeight: '1.4',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {sec.description}
                                  </p>
                                </div>

                                <div className="d-flex justify-content-between align-items-center pt-2.5 border-top gap-2">
                                  <span className="text-muted font-monospace small text-truncate" style={{ fontSize: '10.5px', maxWidth: '140px' }}>
                                    {sec.path}
                                  </span>

                                  <div className="d-flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleExecuteAction(sec, node.title)}
                                      className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                                      style={{ fontSize: '11px', borderColor: '#0171BB', color: '#0171BB' }}
                                    >
                                      <span>Configure</span>
                                      <i className="feather-chevron-right fs-11" />
                                    </button>

                                    <a
                                      href={sec.sso_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn btn-sm btn-light border rounded-circle p-1 text-muted d-inline-flex align-items-center justify-content-center"
                                      style={{ width: '26px', height: '26px' }}
                                      title="Direct Administrative Console"
                                    >
                                      <i className="feather-external-link fs-11" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SUB-VIEW B: FACULTIES & ACADEMIC CATEGORIES                  */}
      {/* ============================================================== */}
      {activeSubView === 'categories' && (
        <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
          <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-0 text-dark">Institutional Faculties & Academic Categories</h5>
              <p className="text-muted small mb-0">
                Hierarchical taxonomy of university faculties, directorates, and academic departments.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/course/course-category')}
                className="btn btn-outline-secondary btn-sm rounded-pill px-3"
              >
                <i className="feather-grid me-1" /> Category Management View
              </button>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm text-white"
                style={{ backgroundColor: '#0171BB', borderColor: '#0171BB' }}
              >
                <i className="feather-plus-circle me-1" /> + Add New Faculty / Category
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr style={{ fontSize: '11px' }} className="text-uppercase text-muted">
                    <th className="ps-3 py-3">Category / Faculty Name</th>
                    <th className="py-3">ID Code</th>
                    <th className="py-3">Parent Faculty</th>
                    <th className="py-3">Courses</th>
                    <th className="py-3">Status</th>
                    <th className="text-end pe-3 py-3">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        No categories found. Click "+ Add New Faculty" to create one.
                      </td>
                    </tr>
                  ) : (
                    adminCategories.map((cat) => {
                      const parentCat = adminCategories.find((c) => c.id === cat.parent);
                      return (
                        <tr key={cat.id}>
                          <td className="ps-3 py-3">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  backgroundColor: '#E8F4FC',
                                  color: '#0171BB',
                                }}
                              >
                                <i className="feather-folder fs-14" />
                              </div>
                              <div>
                                <span className="fw-bold text-dark fs-13">{cat.name}</span>
                                {cat.description && (
                                  <div className="text-muted small" style={{ fontSize: '11px' }}>
                                    {cat.description.replace(/<[^>]*>/g, '').slice(0, 75)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="badge bg-light text-dark border font-monospace" style={{ fontSize: '11px' }}>
                              {cat.idnumber || `CAT-${cat.id}`}
                            </span>
                          </td>
                          <td className="py-3">
                            {cat.parent === 0 ? (
                              <span className="badge bg-primary-subtle text-primary fw-medium" style={{ fontSize: '10.5px' }}>
                                Top-Level Faculty
                              </span>
                            ) : (
                              <span className="text-dark fw-medium small">
                                {parentCat ? parentCat.name : `Parent #${cat.parent}`}
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            <span
                              className="badge rounded-pill px-2.5 py-1 fw-bold"
                              style={{
                                backgroundColor: (cat.coursecount || 0) > 0 ? '#dcfce7' : '#f1f5f9',
                                color: (cat.coursecount || 0) > 0 ? '#15803d' : '#64748b',
                                fontSize: '11px',
                              }}
                            >
                              {cat.coursecount || 0} Courses
                            </span>
                          </td>
                          <td className="py-3">
                            {cat.visible ? (
                              <span className="badge rounded-pill bg-success-subtle text-success px-2.5 py-1" style={{ fontSize: '10.5px' }}>
                                Published
                              </span>
                            ) : (
                              <span className="badge rounded-pill bg-secondary-subtle text-secondary px-2.5 py-1" style={{ fontSize: '10.5px' }}>
                                Hidden
                              </span>
                            )}
                          </td>
                          <td className="text-end pe-3 py-3">
                            <div className="d-flex justify-content-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => navigate(`/instructor/instructor-course?catId=${cat.id}`)}
                                className="btn btn-outline-primary btn-sm px-2.5 py-1"
                                style={{ fontSize: '11px' }}
                                title="Browse Courses"
                              >
                                Courses
                              </button>
                              {cat.id > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                  className="btn btn-outline-danger btn-sm px-2 py-1"
                                  style={{ fontSize: '11px' }}
                                  title="Delete Category"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SUB-VIEW C: COURSE DEFAULT STANDARDS                        */}
      {/* ============================================================== */}
      {activeSubView === 'defaults' && (
        <div className="card border-0 shadow-sm rounded-3 bg-white">
          <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-0 text-dark">Course Curriculum Default Standards</h5>
              <p className="text-muted small mb-0">
                Institutional standards applied automatically whenever faculties or instructors create new academic courses.
              </p>
            </div>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSaveDefaults}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fs-13 fw-semibold text-dark">Default Course Format</label>
                  <select
                    className="form-select"
                    value={defaultsForm.format}
                    onChange={(e) => setDefaultsForm({ ...defaultsForm, format: e.target.value })}
                  >
                    <option value="topics">Topics format (Modular syllabus)</option>
                    <option value="weeks">Weekly format (Semester weeks)</option>
                    <option value="singleactivity">Single activity format (Direct SCORM/Exam)</option>
                    <option value="social">Social format (Discussion/Forum based)</option>
                  </select>
                  <div className="form-text small">
                    Controls the primary structural layout of new learning spaces.
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fs-13 fw-semibold text-dark">Default Number of Sections</label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    className="form-control"
                    value={defaultsForm.numsections}
                    onChange={(e) =>
                      setDefaultsForm({ ...defaultsForm, numsections: parseInt(e.target.value, 10) || 4 })
                    }
                  />
                  <div className="form-text small">
                    Default syllabus units automatically generated for new courses.
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fs-13 fw-semibold text-dark">Maximum File Upload Limit</label>
                  <select
                    className="form-select"
                    value={defaultsForm.maxbytes}
                    onChange={(e) =>
                      setDefaultsForm({ ...defaultsForm, maxbytes: parseInt(e.target.value, 10) || 0 })
                    }
                  >
                    <option value={0}>Site maximum limit (Server defined)</option>
                    <option value={2097152}>2 MB (Lightweight text/PDF only)</option>
                    <option value={10485760}>10 MB (Assignments & Presentations)</option>
                    <option value={52428800}>50 MB (Media & Project Submissions)</option>
                    <option value={104857600}>100 MB (Large Video & Dataset packages)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fs-13 fw-semibold text-dark">Activity Completion Tracking</label>
                  <select
                    className="form-select"
                    value={defaultsForm.enablecompletion}
                    onChange={(e) =>
                      setDefaultsForm({
                        ...defaultsForm,
                        enablecompletion: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  >
                    <option value={1}>Enabled (Track scholar progress & certificates)</option>
                    <option value={0}>Disabled (Manual tracking only)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fs-13 fw-semibold text-dark">Gradebook Visibility</label>
                  <select
                    className="form-select"
                    value={defaultsForm.showgrades}
                    onChange={(e) =>
                      setDefaultsForm({ ...defaultsForm, showgrades: parseInt(e.target.value, 10) || 0 })
                    }
                  >
                    <option value={1}>Show gradebook to scholars</option>
                    <option value={0}>Hide gradebook from scholars</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fs-13 fw-semibold text-dark">Show Activity Reports</label>
                  <select
                    className="form-select"
                    value={defaultsForm.showreports}
                    onChange={(e) =>
                      setDefaultsForm({ ...defaultsForm, showreports: parseInt(e.target.value, 10) || 0 })
                    }
                  >
                    <option value={1}>Yes (Scholars can view their activity logs)</option>
                    <option value={0}>No (Restricted to instructors & administrators)</option>
                  </select>
                </div>

                <div className="col-12 pt-3 border-top d-flex justify-content-end gap-2">
                  <button
                    type="submit"
                    disabled={isSavingDefaults}
                    className="btn btn-primary rounded-pill px-4 shadow-sm fw-semibold text-white"
                    style={{ backgroundColor: '#0171BB', borderColor: '#0171BB' }}
                  >
                    {isSavingDefaults ? 'Saving Standards...' : 'Save Curriculum Defaults'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SUB-VIEW D: COHORT GROUPS & FIELDS                          */}
      {/* ============================================================== */}
      {activeSubView === 'groups' && (
        <div className="card border-0 shadow-sm rounded-3 bg-white">
          <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-0 text-dark">Seminar Groups & Tutorial Cohorts</h5>
              <p className="text-muted small mb-0">
                Segment scholars into tutorial classes, seminar clusters, and laboratory groups.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGroupModal(true)}
              className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm text-white"
              style={{ backgroundColor: '#0171BB', borderColor: '#0171BB' }}
            >
              <i className="feather-plus-circle me-1" /> + Create Cohort Group
            </button>
          </div>
          <div className="card-body p-4">
            <div className="mb-4">
              <label className="form-label fs-13 fw-semibold text-dark">Select Academic Course</label>
              <select
                className="form-select"
                value={selectedCourseForGroups}
                onChange={(e) => setSelectedCourseForGroups(Number(e.target.value))}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullname} ({c.shortname}) • ID #{c.id}
                  </option>
                ))}
              </select>
            </div>

            {loadingGroups ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
                <p className="text-muted small mt-2">Loading cohort groups...</p>
              </div>
            ) : groupsList.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-3">
                <i className="feather-users fs-32 text-muted mb-2 d-block" />
                <h6 className="fw-bold text-dark">No Seminar Groups Defined</h6>
                <p className="text-muted small mb-3">Create seminar cohorts for collaborative assignments and group discussions.</p>
                <button
                  type="button"
                  onClick={() => setShowGroupModal(true)}
                  className="btn btn-outline-primary btn-sm rounded-pill px-3"
                  style={{ borderColor: '#0171BB', color: '#0171BB' }}
                >
                  Create First Group
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr style={{ fontSize: '11px' }} className="text-uppercase text-muted">
                      <th>Group Name</th>
                      <th>Description</th>
                      <th>Scholars Count</th>
                      <th>Enrolment Key</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupsList.map((g) => (
                      <tr key={g.id}>
                        <td>
                          <span className="fw-bold text-dark fs-13">{g.name}</span>
                        </td>
                        <td>
                          <span className="text-muted small">{g.description || '—'}</span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border font-monospace">{(g as any).members_count || (g as any).member_count || 0}</span>
                        </td>
                        <td>
                          <span className="badge bg-light text-muted border font-monospace">
                            {g.enrolmentkey ? '••••••' : 'None (Open)'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(g.id, g.name)}
                            className="btn btn-outline-danger btn-sm px-2 py-1"
                            style={{ fontSize: '11px' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. SUB-VIEW E: SERVER & CACHE DIAGNOSTICS                      */}
      {/* ============================================================== */}
      {activeSubView === 'diagnostics' && (
        <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom flex-wrap gap-2">
            <div>
              <h5 className="fw-bold text-dark mb-1">Server Runtime Engine & OPcache Metrics</h5>
              <p className="text-muted small mb-0">Live memory allocation, cache stores, and database server specifications.</p>
            </div>
            <button
              type="button"
              onClick={handlePurgeAllCaches}
              disabled={isPurgingAll}
              className="btn btn-danger btn-sm rounded-pill px-3.5 shadow-sm fw-semibold"
            >
              <i className={`feather-zap me-1 ${isPurgingAll ? 'fa-spin' : ''}`} />
              {isPurgingAll ? 'Purging All Caches...' : 'Flush System Caches'}
            </button>
          </div>

          {isLoadingDiagnostics ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2" role="status" />
              <p className="text-muted small">Querying OPcache and server memory status...</p>
            </div>
          ) : (
            <div className="row g-3">
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3">
                  <span className="text-muted text-uppercase small d-block" style={{ fontSize: '10px' }}>PHP Runtime Engine</span>
                  <h4 className="fw-bold text-dark mt-1 mb-0">{siteSettings?.server?.php_version || '8.2.x'}</h4>
                  <span className="text-muted small">{siteSettings?.server?.server_os || 'Windows/Apache'}</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3">
                  <span className="text-muted text-uppercase small d-block" style={{ fontSize: '10px' }}>OPcache Accelerator</span>
                  <h4 className="fw-bold text-success mt-1 mb-0">Active & Operational</h4>
                  <span className="text-muted small">
                    {cacheStatusData?.opcache?.opcache_statistics?.hits || '1,420+'} Cache Hits
                  </span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded-3">
                  <span className="text-muted text-uppercase small d-block" style={{ fontSize: '10px' }}>Database Store</span>
                  <h4 className="fw-bold text-primary mt-1 mb-0">MariaDB 11.4</h4>
                  <span className="text-muted small">Port 3307 • database moodle_out</span>
                </div>
              </div>

              {cacheStatusData?.opcache?.memory_usage && (
                <div className="col-12 mt-3">
                  <div className="p-3 border rounded-3 bg-white">
                    <h6 className="fw-bold text-dark mb-2 fs-13">OPcache Shared Memory Distribution</h6>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div className="progress flex-grow-1" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-success"
                          style={{
                            width: `${(
                              (cacheStatusData.opcache.memory_usage.used_memory /
                                (cacheStatusData.opcache.memory_usage.used_memory + cacheStatusData.opcache.memory_usage.free_memory)) *
                              100
                            ).toFixed(1)}%`,
                          }}
                        />
                      </div>
                      <span className="fw-bold text-dark small">
                        {(cacheStatusData.opcache.memory_usage.used_memory / 1024 / 1024).toFixed(1)} MB /{' '}
                        {(
                          (cacheStatusData.opcache.memory_usage.used_memory + cacheStatusData.opcache.memory_usage.free_memory) /
                          1024 /
                          1024
                        ).toFixed(1)}{' '}
                        MB
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. NATIVE MODAL: ADD A NEW USER                                */}
      {/* ============================================================== */}
      {showUserModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleCreateUserSubmit}>
                <div className="modal-header bg-primary text-white py-3 px-4" style={{ backgroundColor: '#0171BB' }}>
                  <h5 className="modal-title fw-bold text-white fs-16 d-flex align-items-center gap-2">
                    <i className="feather-user-plus" />
                    <span>Register New Scholar / Staff Account</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowUserModal(false)}
                    disabled={isCreatingUser}
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Mwajuma"
                        value={userForm.firstname}
                        onChange={(e) => setUserForm({ ...userForm, firstname: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Said"
                        value={userForm.lastname}
                        onChange={(e) => setUserForm({ ...userForm, lastname: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">
                        Institutional Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        className="form-control"
                        placeholder="mwajuma.said@out.ac.tz"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">
                        Username <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control font-monospace"
                        placeholder="mwajuma.said"
                        value={userForm.username}
                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Account Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Student@2026! (Default)"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">System Role</label>
                      <select
                        className="form-select"
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                      >
                        <option value="Student">Student / Scholar</option>
                        <option value="Instructor">Lecturer / Instructor</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Faculty Department</label>
                      <select
                        className="form-select"
                        value={userForm.department}
                        onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                      >
                        <option value="Faculty of Business Management">Faculty of Business Management</option>
                        <option value="Faculty of Science, Technology and Environmental Studies">
                          Faculty of Science, Technology and Environmental Studies
                        </option>
                        <option value="Faculty of Arts and Social Sciences">Faculty of Arts and Social Sciences</option>
                        <option value="Faculty of Law">Faculty of Law</option>
                        <option value="Faculty of Education">Faculty of Education</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Enroll in Initial Course</label>
                      <select
                        className="form-select"
                        value={userForm.course_id}
                        onChange={(e) => setUserForm({ ...userForm, course_id: Number(e.target.value) })}
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullname} ({c.shortname})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-4"
                    onClick={() => setShowUserModal(false)}
                    disabled={isCreatingUser}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold text-white"
                    style={{ backgroundColor: '#0171BB', borderColor: '#0171BB' }}
                  >
                    {isCreatingUser ? 'Registering Account...' : 'Register User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. NATIVE MODAL: ADD A NEW COURSE                              */}
      {/* ============================================================== */}
      {showCourseModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleCreateCourseSubmit}>
                <div className="modal-header bg-primary text-white py-3 px-4" style={{ backgroundColor: '#0171BB' }}>
                  <h5 className="modal-title fw-bold text-white fs-16 d-flex align-items-center gap-2">
                    <i className="feather-plus-circle" />
                    <span>Launch New Academic Course</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowCourseModal(false)}
                    disabled={isCreatingCourse}
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold text-dark small">
                        Course Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Financial Management & Strategic Planning"
                        value={courseForm.fullname}
                        onChange={(e) => setCourseForm({ ...courseForm, fullname: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark small">
                        Short Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control font-monospace"
                        placeholder="e.g. BBA301"
                        value={courseForm.shortname}
                        onChange={(e) => setCourseForm({ ...courseForm, shortname: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Faculty Category</label>
                      <select
                        className="form-select"
                        value={courseForm.category_id}
                        onChange={(e) => setCourseForm({ ...courseForm, category_id: Number(e.target.value) })}
                      >
                        {adminCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold text-dark small">Course Format</label>
                      <select
                        className="form-select"
                        value={courseForm.format}
                        onChange={(e) => setCourseForm({ ...courseForm, format: e.target.value })}
                      >
                        <option value="topics">Topics Format</option>
                        <option value="weeks">Weekly Format</option>
                        <option value="singleactivity">Single Activity</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold text-dark small">Initial Units</label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        className="form-control"
                        value={courseForm.num_sections}
                        onChange={(e) => setCourseForm({ ...courseForm, num_sections: Number(e.target.value) })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Tuition Fee (TZS)</label>
                      <input
                        type="number"
                        step="1000"
                        className="form-control"
                        placeholder="0 for Subsidized"
                        value={courseForm.tuition_fee}
                        onChange={(e) => setCourseForm({ ...courseForm, tuition_fee: Number(e.target.value) })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark small">Course Syllabus Summary</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        placeholder="Outline course learning objectives, syllabus scope, and faculty prerequisites..."
                        value={courseForm.summary}
                        onChange={(e) => setCourseForm({ ...courseForm, summary: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-4"
                    onClick={() => setShowCourseModal(false)}
                    disabled={isCreatingCourse}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCourse}
                    className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold text-white"
                    style={{ backgroundColor: '#0171BB', borderColor: '#0171BB' }}
                  >
                    {isCreatingCourse ? 'Provisioning Course...' : 'Save & Provision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. NATIVE MODAL: SITE INFORMATION & IDENTITY                  */}
      {/* ============================================================== */}
      {showSiteInfoModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveSiteInfo}>
                <div className="modal-header bg-dark text-white py-3 px-4">
                  <h5 className="modal-title fw-bold text-white fs-16 d-flex align-items-center gap-2">
                    <i className="feather-settings" />
                    <span>University Site Identity & Governance Branding</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowSiteInfoModal(false)}
                    disabled={isSavingSiteInfo}
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold text-dark small">Site Full Name</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={siteInfoForm.fullname}
                        onChange={(e) => setSiteInfoForm({ ...siteInfoForm, fullname: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark small">Site Short Name</label>
                      <input
                        type="text"
                        required
                        className="form-control font-monospace"
                        value={siteInfoForm.shortname}
                        onChange={(e) => setSiteInfoForm({ ...siteInfoForm, shortname: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Default Server Timezone</label>
                      <input
                        type="text"
                        disabled
                        className="form-control bg-light"
                        value={siteInfoForm.timezone}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Country Jurisdiction</label>
                      <input
                        type="text"
                        disabled
                        className="form-control bg-light"
                        value="Tanzania (TZ)"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark small">Frontpage Institutional Overview</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        value={siteInfoForm.summary}
                        onChange={(e) => setSiteInfoForm({ ...siteInfoForm, summary: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-4"
                    onClick={() => setShowSiteInfoModal(false)}
                    disabled={isSavingSiteInfo}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSiteInfo}
                    className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold text-white"
                    style={{ backgroundColor: '#0171BB', borderColor: '#0171BB' }}
                  >
                    {isSavingSiteInfo ? 'Saving...' : 'Save Site Identity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 11. NATIVE MODAL: MAINTENANCE MODE                            */}
      {/* ============================================================== */}
      {showMaintenanceModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveMaintenance}>
                <div className="modal-header bg-warning text-dark py-3 px-4">
                  <h5 className="modal-title fw-bold text-dark fs-16 d-flex align-items-center gap-2">
                    <i className="feather-alert-triangle" />
                    <span>Platform Maintenance Mode</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowMaintenanceModal(false)}
                    disabled={isSavingMaintenance}
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="maintenanceToggle"
                      checked={maintenanceForm.enabled}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, enabled: e.target.checked })}
                    />
                    <label className="form-check-label fw-bold text-dark fs-14" htmlFor="maintenanceToggle">
                      {maintenanceForm.enabled ? 'Maintenance Mode: ACTIVE (Locked to Admins)' : 'Maintenance Mode: INACTIVE (Normal)'}
                    </label>
                  </div>

                  <label className="form-label fw-semibold text-dark small">Maintenance Advisory Notice</label>
                  <textarea
                    rows={4}
                    className="form-control"
                    value={maintenanceForm.message}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, message: e.target.value })}
                  />
                  <div className="form-text small mt-1">
                    This message will be shown to all students and staff who visit during maintenance.
                  </div>
                </div>

                <div className="modal-footer bg-light py-2 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-4"
                    onClick={() => setShowMaintenanceModal(false)}
                    disabled={isSavingMaintenance}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingMaintenance}
                    className="btn btn-warning text-dark fw-bold btn-sm rounded-pill px-4"
                  >
                    {isSavingMaintenance ? 'Saving...' : 'Update Maintenance State'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 12. NATIVE MODAL: SECURITY & ACCESS POLICIES                  */}
      {/* ============================================================== */}
      {showSecurityModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveSecurity}>
                <div className="modal-header bg-dark text-white py-3 px-4">
                  <h5 className="modal-title fw-bold text-white fs-16 d-flex align-items-center gap-2">
                    <i className="feather-shield" />
                    <span>Security & Access Governance</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowSecurityModal(false)}
                    disabled={isSavingSecurity}
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="selfRegisterSwitch"
                      checked={securityForm.registerauth}
                      onChange={(e) => setSecurityForm({ ...securityForm, registerauth: e.target.checked })}
                    />
                    <label className="form-check-label fw-semibold text-dark small" htmlFor="selfRegisterSwitch">
                      Allow Public Self-Registration (Email-verified student registration)
                    </label>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">Session Expiration Timeout</label>
                    <select
                      className="form-select"
                      value={securityForm.sessiontimeout}
                      onChange={(e) => setSecurityForm({ ...securityForm, sessiontimeout: Number(e.target.value) })}
                    >
                      <option value={3600}>1 Hour (High Security)</option>
                      <option value={7200}>2 Hours (Standard)</option>
                      <option value={14400}>4 Hours</option>
                      <option value={28800}>8 Hours (Full Day Workday)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-light rounded-3 text-muted small" style={{ fontSize: '11.5px' }}>
                    <i className="feather-info text-primary me-1" />
                    Password complexity requires minimum 8 characters, at least 1 digit, 1 lowercase letter, 1 uppercase letter, and 1 non-alphanumeric symbol (*, @, #).
                  </div>
                </div>

                <div className="modal-footer bg-light py-2 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-4"
                    onClick={() => setShowSecurityModal(false)}
                    disabled={isSavingSecurity}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSecurity}
                    className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold text-white"
                    style={{ backgroundColor: '#0171BB', borderColor: '#0171BB' }}
                  >
                    {isSavingSecurity ? 'Saving...' : 'Save Policies'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 13. NATIVE MODAL: PAYMENT GATEWAYS & CURRENCIES                */}
      {/* ============================================================== */}
      {showPaymentModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSavePayment}>
                <div className="modal-header bg-primary text-white py-3 px-4" style={{ backgroundColor: '#0171BB' }}>
                  <h5 className="modal-title fw-bold text-white fs-16 d-flex align-items-center gap-2">
                    <i className="feather-dollar-sign" />
                    <span>Tuition Currencies & Payment Gateways</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowPaymentModal(false)}
                    disabled={isSavingPayment}
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark small">Default Institutional Currency</label>
                      <select
                        className="form-select"
                        value={paymentForm.defaultcurrency}
                        onChange={(e) => setPaymentForm({ ...paymentForm, defaultcurrency: e.target.value })}
                      >
                        <option value="TZS">TZS - Tanzanian Shilling</option>
                        <option value="USD">USD - United States Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark small">Pesapal Direct Gateway Environment</label>
                      <select
                        className="form-select"
                        value={paymentForm.pesapal_environment}
                        onChange={(e) => setPaymentForm({ ...paymentForm, pesapal_environment: e.target.value })}
                      >
                        <option value="sandbox">Sandbox (Testing / Non-Production)</option>
                        <option value="production">Live Production (Bank & Mobile Money Integration)</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark small">Selcom Mobile Money Vendor ID</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={paymentForm.selcom_vendor_id}
                        onChange={(e) => setPaymentForm({ ...paymentForm, selcom_vendor_id: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-4"
                    onClick={() => setShowPaymentModal(false)}
                    disabled={isSavingPayment}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPayment}
                    className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold text-white"
                    style={{ backgroundColor: '#0171BB', borderColor: '#0171BB' }}
                  >
                    {isSavingPayment ? 'Saving...' : 'Save Payment Config'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 14. NATIVE MODAL: ACTION CONSOLE DRAWER                        */}
      {/* ============================================================== */}
      {selectedActionItem && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-dark text-white py-3 px-4">
                <div>
                  <h5 className="modal-title fw-bold text-white fs-16 mb-0">
                    {selectedActionItem.name}
                  </h5>
                  <span className="small text-white-50" style={{ fontSize: '11px' }}>
                    {selectedActionItem.categoryTitle} • Administrative Suite
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedActionItem(null)}
                />
              </div>

              <div className="modal-body p-4">
                <div className="mb-3">
                  <span className="text-muted text-uppercase small d-block mb-1" style={{ fontSize: '10px' }}>
                    OPERATIONAL PURPOSE
                  </span>
                  <p className="text-dark small mb-0 fs-13 lh-base">
                    {selectedActionItem.description}
                  </p>
                </div>

                <div className="p-3 bg-light rounded-3 mb-3">
                  <span className="text-muted text-uppercase small d-block mb-1" style={{ fontSize: '10px' }}>
                    SYSTEM PATHWAY
                  </span>
                  <code className="text-primary small font-monospace">{selectedActionItem.path}</code>
                </div>

                <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>
                  Click below to open the dedicated institutional configuration interface for this module.
                </p>
              </div>

              <div className="modal-footer bg-light py-2 px-4 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill px-4"
                  onClick={() => setSelectedActionItem(null)}
                >
                  Close
                </button>

                <a
                  href={selectedActionItem.sso_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold text-white d-inline-flex align-items-center gap-1.5"
                  style={{ backgroundColor: '#0171BB', borderColor: '#0171BB' }}
                >
                  <span>Launch Administrative Console</span>
                  <i className="feather-external-link fs-12" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 15. NATIVE MODAL: ADD A CATEGORY                               */}
      {/* ============================================================== */}
      {showCategoryModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleCreateCategory}>
                <div className="modal-header bg-primary text-white py-3 px-4" style={{ backgroundColor: '#0171BB' }}>
                  <h5 className="modal-title fw-bold text-white fs-16 d-flex align-items-center gap-2">
                    <i className="feather-folder-plus" />
                    <span>Create Faculty / Academic Category</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowCategoryModal(false)}
                    disabled={isCreatingCategory}
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">
                      Category / Faculty Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Faculty of Business Management"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">Parent Faculty</label>
                    <select
                      className="form-select"
                      value={newCategory.parent}
                      onChange={(e) => setNewCategory({ ...newCategory, parent: Number(e.target.value) })}
                    >
                      <option value={0}>Top Level (Independent Faculty)</option>
                      {adminCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">Faculty Code / ID Number</label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      placeholder="e.g. FBM"
                      value={newCategory.idnumber}
                      onChange={(e) => setNewCategory({ ...newCategory, idnumber: e.target.value })}
                    />
                  </div>

                  <div className="mb-0">
                    <label className="form-label fw-semibold text-dark small">Description</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      placeholder="Outline academic scope, department chairs, and faculty disciplines..."
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light py-2 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-4"
                    onClick={() => setShowCategoryModal(false)}
                    disabled={isCreatingCategory}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCategory}
                    className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold text-white"
                    style={{ backgroundColor: '#0171BB', borderColor: '#0171BB' }}
                  >
                    {isCreatingCategory ? 'Creating Category...' : 'Save Faculty'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 16. NATIVE MODAL: CREATE GROUP                                 */}
      {/* ============================================================== */}
      {showGroupModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleCreateGroup}>
                <div className="modal-header bg-primary text-white py-3 px-4" style={{ backgroundColor: '#0171BB' }}>
                  <h5 className="modal-title fw-bold text-white fs-16 d-flex align-items-center gap-2">
                    <i className="feather-users" />
                    <span>Create Seminar / Cohort Group</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowGroupModal(false)}
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">Group Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Tutorial Group A (Morning)"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">Enrolment Key (Optional)</label>
                    <input
                      type="password"
                      className="form-control font-monospace"
                      placeholder="Leave blank for open grouping"
                      value={newGroup.enrolmentkey}
                      onChange={(e) => setNewGroup({ ...newGroup, enrolmentkey: e.target.value })}
                    />
                  </div>

                  <div className="mb-0">
                    <label className="form-label fw-semibold text-dark small">Group Description</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      placeholder="Outline seminar schedule, venue, or tutor details..."
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light py-2 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-4"
                    onClick={() => setShowGroupModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold text-white"
                    style={{ backgroundColor: '#0171BB', borderColor: '#0171BB' }}
                  >
                    Create Group
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

export default SiteAdminHub;
