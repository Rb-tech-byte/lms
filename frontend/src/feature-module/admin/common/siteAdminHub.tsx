import React, { useState, useEffect } from 'react';
import {
  adminService,
  AdminCategoryNode,
  AdminCourseCategory,
  CourseDefaultSettings,
  CourseGroupRecord,
  AdminCourseRecord,
} from '../../../core/api/adminService';

interface SiteAdminHubProps {
  adminTree: Record<string, AdminCategoryNode>;
  adminCategories: AdminCourseCategory[];
  courses: AdminCourseRecord[];
  courseDefaults: CourseDefaultSettings | null;
  onRefresh: () => Promise<void>;
  onNotify: (type: 'success' | 'danger', message: string) => void;
  onOpenCourseModal: () => void;
}

const SiteAdminHub: React.FC<SiteAdminHubProps> = ({
  adminTree,
  adminCategories,
  courses,
  courseDefaults,
  onRefresh,
  onNotify,
  onOpenCourseModal,
}) => {
  // Search and Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('all');
  const [activeSubView, setActiveSubView] = useState<'suite' | 'categories' | 'defaults' | 'groups'>('suite');

  // Groups management state
  const [selectedCourseForGroups, setSelectedCourseForGroups] = useState<number>(
    courses[0]?.id || 2
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

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    parent: 0,
    idnumber: '',
    description: '',
  });

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
  }, [selectedCourseForGroups]);

  // Handle Category Creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      onNotify('danger', 'Category name is required.');
      return;
    }
    try {
      await adminService.addCategory(newCategory);
      onNotify('success', `Faculty category "${newCategory.name}" created successfully.`);
      setShowCategoryModal(false);
      setNewCategory({ name: '', parent: 0, idnumber: '', description: '' });
      await onRefresh();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to create category');
    }
  };

  // Handle Category Deletion
  const handleDeleteCategory = async (catId: number, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }
    try {
      await adminService.deleteCategory(catId);
      onNotify('success', `Category "${catName}" deleted successfully.`);
      await onRefresh();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to delete category');
    }
  };

  // Handle Course Defaults Update
  const handleSaveDefaults = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDefaults(true);
    try {
      await adminService.updateCourseDefaults(defaultsForm);
      onNotify('success', 'Moodle course default settings updated successfully.');
      await onRefresh();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to update course defaults');
    } finally {
      setIsSavingDefaults(false);
    }
  };

  // Handle Group Creation
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name.trim()) {
      onNotify('danger', 'Group name is required.');
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
      onNotify('danger', err.message || 'Failed to create group');
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
      onNotify('danger', err.message || 'Failed to delete group');
    }
  };

  // Handle Headless Course Deletion
  const handleDeleteCourse = async (courseId: number, courseName: string) => {
    if (!window.confirm(`Are you sure you want to completely delete course "${courseName}" from Moodle?`)) {
      return;
    }
    try {
      await adminService.deleteCourse(courseId);
      onNotify('success', `Course "${courseName}" deleted.`);
      await onRefresh();
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to delete course');
    }
  };

  // Category Keys and Counts
  const categoryKeys = Object.keys(adminTree);
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
      {/* 1. TOP HEADER & ZERO-PROMPT SSO OVERVIEW BANNER                */}
      {/* ============================================================== */}
      <div className="card border-0 shadow-sm mb-4 bg-light rounded-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-primary px-3 py-1 fw-bold fs-12">
                  <i className="isax isax-shield-tick me-1" /> Moodle 5.x REST API v2 & Web Services Bridge
                </span>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-12">
                  <i className="isax isax-verify me-1" /> Zero-Login SSO Active
                </span>
              </div>
              <h4 className="fw-bold mb-1 text-dark">
                Open University of Tanzania • Site Administration Console
              </h4>
              <p className="text-muted fs-13 mb-0">
                Direct access to all 9 Moodle administration areas and detailed course management tools without requiring separate Moodle login credentials.
              </p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <a
                href={adminService.getMoodleSsoUrl('/admin/search.php')}
                target="_blank"
                rel="noreferrer"
                className="btn btn-warning text-dark fw-bold btn-sm rounded-pill px-3 shadow-sm"
              >
                <i className="isax isax-login-1 me-1" /> Open Moodle Admin (SSO)
              </a>
              <a
                href={adminService.getMoodleSsoUrl('/admin/swagger')}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-dark btn-sm rounded-pill px-3 shadow-sm"
              >
                <i className="isax isax-code me-1" /> REST API Swagger UI
              </a>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
              >
                <i className="isax isax-add me-1" /> + Add Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUB-VIEW TABS (Suite View, Categories, Defaults, Groups)     */}
      {/* ============================================================== */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <ul className="nav nav-pills gap-2">
          <li className="nav-item">
            <button
              className={`btn btn-sm rounded-pill px-3 ${activeSubView === 'suite' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveSubView('suite')}
            >
              <i className="isax isax-grid-3 me-1" /> All 9 Admin Suites & Tools ({totalSectionsCount})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn btn-sm rounded-pill px-3 ${activeSubView === 'categories' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveSubView('categories')}
            >
              <i className="isax isax-folder-open me-1" /> Faculties & Categories ({adminCategories.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn btn-sm rounded-pill px-3 ${activeSubView === 'defaults' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveSubView('defaults')}
            >
              <i className="isax isax-setting-4 me-1" /> Course Default Settings
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn btn-sm rounded-pill px-3 ${activeSubView === 'groups' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveSubView('groups')}
            >
              <i className="isax isax-profile-2user me-1" /> Cohort Groups & Custom Fields
            </button>
          </li>
        </ul>

        {activeSubView === 'suite' && (
          <div className="d-flex gap-2 align-items-center">
            <div className="input-group input-group-sm" style={{ width: '280px' }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="isax isax-search-normal-1 text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search administration settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. SUB-VIEW A: ALL 9 ADMIN SUITES & TOOLS GRID                 */}
      {/* ============================================================== */}
      {activeSubView === 'suite' && (
        <div>
          {/* Category Pills Filter */}
          <div className="d-flex gap-2 flex-wrap mb-4">
            <button
              className={`btn btn-xs rounded-pill px-3 ${selectedCategoryKey === 'all' ? 'btn-dark' : 'btn-light border'}`}
              onClick={() => setSelectedCategoryKey('all')}
            >
              All Categories ({totalSectionsCount})
            </button>
            {categoryKeys.map((key) => {
              const node = adminTree[key];
              const count = node?.sections?.length || 0;
              const isSelected = selectedCategoryKey === key;
              return (
                <button
                  key={key}
                  className={`btn btn-xs rounded-pill px-3 ${isSelected ? 'btn-primary' : 'btn-light border'}`}
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
                  <div className={`card border-0 shadow-sm rounded-4 overflow-hidden ${isCourses ? 'border-primary' : ''}`}>
                    <div
                      className="card-header border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                      style={{
                        background: isCourses
                          ? 'linear-gradient(135deg, #f0f7ff 0%, #e1effe 100%)'
                          : '#fafafa',
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className={`p-2 rounded-3 text-white d-flex align-items-center justify-content-center ${
                            isCourses ? 'bg-primary' : 'bg-dark'
                          }`}
                          style={{ width: '36px', height: '36px' }}
                        >
                          <i className={`${node.icon} fs-18`} />
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                            {node.title}
                            <span className="badge bg-secondary-subtle text-secondary fs-11">
                              {node.sections.length} administrative actions
                            </span>
                            {isCourses && (
                              <span className="badge bg-warning text-dark fs-10 fw-bold">
                                Primary Curriculum Suite
                              </span>
                            )}
                          </h6>
                          <p className="text-muted fs-12 mb-0">{node.description}</p>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <a
                          href={node.moodle_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-medium"
                        >
                          <i className="isax isax-export-1 me-1" /> Open {node.title} in Moodle (SSO)
                        </a>
                      </div>
                    </div>

                    <div className="card-body p-3">
                      <div className="row g-3">
                        {node.sections.map((sec, idx) => (
                          <div key={idx} className="col-md-6 col-lg-4">
                            <div className="h-100 p-3 rounded-3 border bg-white d-flex flex-column justify-content-between hover-shadow transition-all">
                              <div>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="fw-semibold mb-1 text-dark fs-13">
                                    {sec.name}
                                  </h6>
                                  <span className="badge bg-light text-muted border fs-10">
                                    {sec.path.split('?')[0].replace('/admin/', '').replace('.php', '')}
                                  </span>
                                </div>
                                <p className="text-muted fs-12 mb-3 line-clamp-2">
                                  {sec.description}
                                </p>
                              </div>
                              <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                                <code className="fs-11 text-muted text-truncate" style={{ maxWidth: '140px' }}>
                                  {sec.path}
                                </code>
                                <a
                                  href={sec.sso_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm btn-outline-primary rounded-pill px-2 py-1 fs-11 fw-medium d-inline-flex align-items-center gap-1"
                                >
                                  <span>Open Tool (No Login)</span>
                                  <i className="isax isax-arrow-right-3 fs-10" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
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
      {/* 4. SUB-VIEW B: FACULTIES & CATEGORIES MANAGEMENT               */}
      {/* ============================================================== */}
      {activeSubView === 'categories' && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-0">University Faculties & Academic Categories</h5>
              <p className="text-muted fs-13 mb-0">
                Organize departments, programs, and manage course allocations directly via Moodle API.
              </p>
            </div>
            <div className="d-flex gap-2">
              <a
                href={adminService.getMoodleSsoUrl('/course/management.php')}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-primary btn-sm rounded-pill px-3"
              >
                <i className="isax isax-export-1 me-1" /> Open Moodle Management (SSO)
              </a>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
              >
                <i className="isax isax-add me-1" /> + Add New Faculty / Category
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Category Name</th>
                    <th>ID Number</th>
                    <th>Parent Category</th>
                    <th>Courses</th>
                    <th>Visibility</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        No categories found in Moodle.
                      </td>
                    </tr>
                  ) : (
                    adminCategories.map((cat) => {
                      const parentCat = adminCategories.find((c) => c.id === cat.parent);
                      return (
                        <tr key={cat.id}>
                          <td className="ps-3">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="p-2 rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px' }}
                              >
                                <i className="isax isax-folder fs-16" />
                              </div>
                              <div>
                                <span className="fw-bold text-dark">{cat.name}</span>
                                {cat.description && (
                                  <div className="text-muted fs-12">{cat.description}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <code>{cat.idnumber || '—'}</code>
                          </td>
                          <td>
                            {cat.parent === 0 ? (
                              <span className="badge bg-secondary-subtle text-secondary">
                                Root Category
                              </span>
                            ) : (
                              <span className="text-dark fw-medium">
                                {parentCat ? parentCat.name : `Parent #${cat.parent}`}
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary fw-bold">
                              {cat.coursecount} courses
                            </span>
                          </td>
                          <td>
                            {cat.visible ? (
                              <span className="badge bg-success-subtle text-success">Visible</span>
                            ) : (
                              <span className="badge bg-secondary-subtle text-secondary">Hidden</span>
                            )}
                          </td>
                          <td className="text-end pe-3">
                            <div className="d-flex justify-content-end gap-1">
                              <a
                                href={adminService.getMoodleSsoUrl(
                                  `/course/editcategory.php?id=${cat.id}`
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline-secondary btn-sm px-2 py-1 fs-11"
                                title="Edit in Moodle (SSO)"
                              >
                                Edit (SSO)
                              </a>
                              {cat.id > 1 && (
                                <button
                                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                  className="btn btn-outline-danger btn-sm px-2 py-1 fs-11"
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
      {/* 5. SUB-VIEW C: COURSE DEFAULT SETTINGS                         */}
      {/* ============================================================== */}
      {activeSubView === 'defaults' && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-0">Site-Wide Course Default Settings</h5>
              <p className="text-muted fs-13 mb-0">
                Institutional standards applied automatically whenever instructors or administrators create new courses.
              </p>
            </div>
            <a
              href={adminService.getMoodleSsoUrl('/admin/settings.php?section=coursesettings')}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-primary btn-sm rounded-pill px-3"
            >
              <i className="isax isax-export-1 me-1" /> Open in Moodle (SSO)
            </a>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSaveDefaults}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fs-13 fw-semibold">Default Course Format</label>
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
                  <div className="form-text fs-12">
                    Controls the primary structural layout of new learning spaces.
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fs-13 fw-semibold">Default Number of Sections</label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    className="form-control"
                    value={defaultsForm.numsections}
                    onChange={(e) =>
                      setDefaultsForm({ ...defaultsForm, numsections: parseInt(e.target.value) || 4 })
                    }
                  />
                  <div className="form-text fs-12">
                    Default number of modules/topics automatically generated for new courses.
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fs-13 fw-semibold">Maximum File Upload Limit</label>
                  <select
                    className="form-select"
                    value={defaultsForm.maxbytes}
                    onChange={(e) =>
                      setDefaultsForm({ ...defaultsForm, maxbytes: parseInt(e.target.value) || 0 })
                    }
                  >
                    <option value={0}>Site maximum limit (Unlimited / Server defined)</option>
                    <option value={2097152}>2 MB (Lightweight text/PDF only)</option>
                    <option value={10485760}>10 MB (Assignments & Presentations)</option>
                    <option value={52428800}>50 MB (Media & Project Submissions)</option>
                    <option value={104857600}>100 MB (Large Video & Dataset packages)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fs-13 fw-semibold">Activity Completion Tracking</label>
                  <select
                    className="form-select"
                    value={defaultsForm.enablecompletion}
                    onChange={(e) =>
                      setDefaultsForm({
                        ...defaultsForm,
                        enablecompletion: parseInt(e.target.value) || 0,
                      })
                    }
                  >
                    <option value={1}>Enabled (Track student progress & certificates)</option>
                    <option value={0}>Disabled (Manual tracking only)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fs-13 fw-semibold">Gradebook Visibility</label>
                  <select
                    className="form-select"
                    value={defaultsForm.showgrades}
                    onChange={(e) =>
                      setDefaultsForm({ ...defaultsForm, showgrades: parseInt(e.target.value) || 0 })
                    }
                  >
                    <option value={1}>Show gradebook to students</option>
                    <option value={0}>Hide gradebook from students</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fs-13 fw-semibold">Show Activity Reports</label>
                  <select
                    className="form-select"
                    value={defaultsForm.showreports}
                    onChange={(e) =>
                      setDefaultsForm({ ...defaultsForm, showreports: parseInt(e.target.value) || 0 })
                    }
                  >
                    <option value={1}>Yes (Students can view their activity logs)</option>
                    <option value={0}>No (Restricted to teachers & admins)</option>
                  </select>
                </div>

                <div className="col-12 pt-3 border-top d-flex justify-content-end gap-2">
                  <button
                    type="submit"
                    disabled={isSavingDefaults}
                    className="btn btn-primary rounded-pill px-4 shadow-sm"
                  >
                    {isSavingDefaults ? 'Saving Defaults...' : 'Save Course Defaults'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SUB-VIEW D: COHORT GROUPS & CUSTOM FIELDS                   */}
      {/* ============================================================== */}
      {activeSubView === 'groups' && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-0">Course Cohort Groups & Custom Fields</h5>
              <p className="text-muted fs-13 mb-0">
                Segment students into tutorial groups, seminar cohorts, or regional study centers.
              </p>
            </div>
            <div className="d-flex gap-2">
              <a
                href={adminService.getMoodleSsoUrl('/admin/category.php?category=groups')}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-primary btn-sm rounded-pill px-3"
              >
                <i className="isax isax-export-1 me-1" /> Open Groups Settings (SSO)
              </a>
              <button
                onClick={() => setShowGroupModal(true)}
                className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
              >
                <i className="isax isax-add me-1" /> + Create Cohort Group
              </button>
            </div>
          </div>
          <div className="card-body p-4">
            {/* Select Course */}
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fs-13 fw-semibold">Select Course</label>
                <select
                  className="form-select"
                  value={selectedCourseForGroups}
                  onChange={(e) => setSelectedCourseForGroups(parseInt(e.target.value) || 2)}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullname} ({c.shortname})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Groups Table */}
            <div className="table-responsive border rounded-3">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Group Name</th>
                    <th>Description</th>
                    <th>Member Count</th>
                    <th>Created At</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingGroups ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        Loading groups for selected course...
                      </td>
                    </tr>
                  ) : groupsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No groups found in this course. Click "+ Create Cohort Group" to add one.
                      </td>
                    </tr>
                  ) : (
                    groupsList.map((grp) => (
                      <tr key={grp.id}>
                        <td className="ps-3">
                          <span className="fw-bold text-dark">{grp.name}</span>
                        </td>
                        <td>{grp.description || '—'}</td>
                        <td>
                          <span className="badge bg-info-subtle text-info fw-bold">
                            {grp.member_count} scholars
                          </span>
                        </td>
                        <td>
                          {grp.timecreated ? new Date(grp.timecreated * 1000).toLocaleDateString() : '—'}
                        </td>
                        <td className="text-end pe-3">
                          <button
                            onClick={() => handleDeleteGroup(grp.id, grp.name)}
                            className="btn btn-outline-danger btn-sm px-2 py-1 fs-11"
                          >
                            Delete Group
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Custom Fields Quick Access */}
            <div className="mt-4 p-3 bg-light rounded-3 border">
              <h6 className="fw-bold mb-2">Moodle Custom Fields Shortcuts (Direct SSO)</h6>
              <div className="d-flex gap-2 flex-wrap">
                <a
                  href={adminService.getMoodleSsoUrl('/course/customfield.php')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-dark btn-sm rounded-pill px-3 fs-12"
                >
                  <i className="isax isax-tag me-1" /> Course Custom Fields (Semester, Credits)
                </a>
                <a
                  href={adminService.getMoodleSsoUrl('/group/customfield.php')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-dark btn-sm rounded-pill px-3 fs-12"
                >
                  <i className="isax isax-people me-1" /> Group Custom Fields (Study Center, Batch)
                </a>
                <a
                  href={adminService.getMoodleSsoUrl('/group/grouping_customfield.php')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-dark btn-sm rounded-pill px-3 fs-12"
                >
                  <i className="isax isax-hierarchy me-1" /> Grouping Custom Fields (Clusters)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD NEW CATEGORY                                      */}
      {/* ============================================================== */}
      {showCategoryModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold text-white">
                  <i className="isax isax-folder-add me-2" /> Add University Faculty / Category
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCategoryModal(false)}
                />
              </div>
              <form onSubmit={handleCreateCategory}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fs-13 fw-semibold">Faculty / Category Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Faculty of Education, Arts and Humanities"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fs-13 fw-semibold">Parent Category</label>
                    <select
                      className="form-select"
                      value={newCategory.parent}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, parent: parseInt(e.target.value) || 0 })
                      }
                    >
                      <option value={0}>Top / Root (New Academic Faculty)</option>
                      {adminCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fs-13 fw-semibold">Category ID Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. FEAH-2026"
                      value={newCategory.idnumber}
                      onChange={(e) => setNewCategory({ ...newCategory, idnumber: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fs-13 fw-semibold">Description</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      placeholder="Academic degree, diploma programs, and faculty mandates..."
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowCategoryModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm">
                    Create Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CREATE COHORT GROUP                                   */}
      {/* ============================================================== */}
      {showGroupModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-dark text-white border-0">
                <h5 className="modal-title fw-bold text-white">
                  <i className="isax isax-people me-2" /> Create Student Cohort Group
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowGroupModal(false)}
                />
              </div>
              <form onSubmit={handleCreateGroup}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fs-13 fw-semibold">Target Course</label>
                    <select
                      className="form-select"
                      value={selectedCourseForGroups}
                      onChange={(e) => setSelectedCourseForGroups(parseInt(e.target.value) || 2)}
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullname} ({c.shortname})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fs-13 fw-semibold">Group Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Cohort 2026 - Dar es Salaam Center"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fs-13 fw-semibold">Enrolment Key (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Optional group password"
                      value={newGroup.enrolmentkey}
                      onChange={(e) => setNewGroup({ ...newGroup, enrolmentkey: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fs-13 fw-semibold">Group Description</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      placeholder="Cohort objectives, tutorial timetable, regional center notes..."
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowGroupModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-dark rounded-pill px-4 shadow-sm">
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
