import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import {
  courseService,
  PublicCatalogCategory,
  PublicCatalogCourse,
} from '../../../core/api/courseService';
import { adminService, AdminCourseCategory } from '../../../core/api/adminService';
import { useAuth } from '../../../core/auth/authContext';
import CorporateAdminLayout from '../../admin/common/corporateAdminLayout';
import CourseSettingsStudio from '../../admin/common/courseSettingsStudio';

export interface CourseCategoryProps {
  embeddedInAdmin?: boolean;
  onOpenCourseStudio?: (courseId: number) => void;
}

export const CourseCategory: React.FC<CourseCategoryProps> = ({
  embeddedInAdmin = false,
  onOpenCourseStudio,
}) => {
  const routes = all_routes;
  const { role } = useAuth();
  const isAdmin = role === 'admin' || embeddedInAdmin;
  const isStaff = isAdmin || role === 'instructor';

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCatId = Number(searchParams.get('id') || 0);

  const [categories, setCategories] = useState<PublicCatalogCategory[]>([]);
  const [adminCategories, setAdminCategories] = useState<AdminCourseCategory[]>([]);
  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number>(initialCatId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  // Category CUD Modal states
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<PublicCatalogCategory | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    idnumber: '',
    parent: 0,
    description: '',
    visible: 1,
  });

  // Course CUD Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<PublicCatalogCourse | null>(null);
  const [courseForm, setCourseForm] = useState({
    fullname: '',
    shortname: '',
    category_id: 2,
    format: 'topics',
    num_sections: 6,
    tuition_fee: 180000,
    summary: '',
    visible: 1,
  });

  // Embedded Course Content Studio Modal
  const [studioCourseId, setStudioCourseId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catalog, adminCats] = await Promise.all([
        courseService.getPublicCatalog(),
        isStaff ? adminService.getCategories().catch(() => []) : Promise.resolve([]),
      ]);
      const mergedCats: PublicCatalogCategory[] =
        adminCats.length > 0
          ? adminCats.map((ac) => {
              const matchedPub = (catalog.categories || []).find((pc) => pc.id === ac.id);
              return {
                id: ac.id,
                name: ac.name,
                idnumber: ac.idnumber || matchedPub?.idnumber || `FAC-0${ac.id}`,
                description: ac.description || matchedPub?.description || '',
                coursecount: ac.coursecount || matchedPub?.coursecount || 0,
                parent: ac.parent || 0,
                visible: ac.visible ?? 1,
                icon: ac.icon || ac.categoryIcon || matchedPub?.icon || matchedPub?.categoryIcon,
                categoryIcon: ac.categoryIcon || ac.icon || matchedPub?.categoryIcon || matchedPub?.icon,
                cover: ac.cover || ac.categoryCover || matchedPub?.cover || matchedPub?.categoryCover,
                categoryCover: ac.categoryCover || ac.cover || matchedPub?.categoryCover || matchedPub?.cover,
                accentColor: ac.accentColor || matchedPub?.accentColor || '#013BA6',
                badgeText: ac.badgeText || matchedPub?.badgeText || ac.idnumber,
              };
            })
          : catalog.categories || [];
      setCategories(mergedCats);
      setAdminCategories(adminCats);
      setCourses(catalog.courses || []);
    } catch (err: any) {
      setAlert({ type: 'danger', message: err?.message || 'Unable to load categories and courses.' });
    } finally {
      setIsLoading(false);
    }
  }, [isStaff]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      (cat.idnumber && cat.idnumber.toLowerCase().includes(q)) ||
      (cat.description && cat.description.toLowerCase().includes(q))
    );
  });

  // Category Create / Update handler (API + Internal state)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    setSubmitting(true);
    setAlert(null);
    try {
      if (editingCat) {
        await adminService.updateCategory({
          category_id: editingCat.id,
          name: catForm.name.trim(),
          idnumber: catForm.idnumber.trim(),
          parent: catForm.parent,
          description: catForm.description.trim(),
          visible: catForm.visible,
        });
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCat.id
              ? {
                  ...c,
                  name: catForm.name.trim(),
                  idnumber: catForm.idnumber.trim(),
                  description: catForm.description.trim(),
                  visible: catForm.visible,
                }
              : c
          )
        );
        setAlert({ type: 'success', message: `Category "${catForm.name}" updated via API.` });
      } else {
        const res = await adminService.addCategory({
          name: catForm.name.trim(),
          idnumber: catForm.idnumber.trim(),
          parent: catForm.parent,
          description: catForm.description.trim(),
        });
        const newCat: PublicCatalogCategory = {
          id: res?.category?.id || Date.now(),
          name: catForm.name.trim(),
          idnumber: catForm.idnumber.trim() || `FAC-${Date.now().toString().slice(-3)}`,
          description: catForm.description.trim(),
          coursecount: 0,
          parent: catForm.parent,
          visible: catForm.visible,
        };
        setCategories((prev) => [...prev, newCat]);
        setAlert({ type: 'success', message: `Category "${catForm.name}" created via API.` });
      }
      setShowCatModal(false);
      setEditingCat(null);
      await loadData();
    } catch (err: any) {
      setAlert({ type: 'danger', message: err?.message || 'Failed to save category.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Category Visibility (API + Internal)
  const handleToggleCategoryVisibility = async (cat: PublicCatalogCategory) => {
    const nextVisible = (cat as any).visible === 0 ? 1 : 0;
    try {
      await adminService.updateCategory({
        category_id: cat.id,
        visible: nextVisible,
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? ({ ...c, visible: nextVisible } as any) : c))
      );
      setAlert({
        type: 'success',
        message: `Category "${cat.name}" is now ${nextVisible ? 'Visible' : 'Hidden'}.`,
      });
    } catch (err: any) {
      setAlert({ type: 'danger', message: err?.message || 'Failed to toggle visibility.' });
    }
  };

  // Category Delete handler (API + Internal)
  const handleDeleteCategory = async (cat: PublicCatalogCategory) => {
    if (!window.confirm(`Delete category "${cat.name}"? Any courses inside will be reassigned.`)) return;
    setSubmitting(true);
    try {
      const fallbackId = categories.find((c) => c.id !== cat.id)?.id;
      await adminService.deleteCategory(cat.id, fallbackId);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      if (selectedFacultyId === cat.id) setSelectedFacultyId(0);
      setAlert({ type: 'success', message: `Category "${cat.name}" deleted.` });
      await loadData();
    } catch (err: any) {
      setAlert({ type: 'danger', message: err?.message || 'Failed to delete category.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Course Create / Update handler (API + Internal)
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.fullname.trim() || !courseForm.shortname.trim()) return;
    setSubmitting(true);
    setAlert(null);
    try {
      if (editingCourse) {
        await adminService.updateCourseSettings(editingCourse.id, {
          fullname: courseForm.fullname.trim(),
          shortname: courseForm.shortname.trim(),
          category_id: courseForm.category_id,
          format: courseForm.format,
          summary: courseForm.summary.trim(),
          visible: courseForm.visible,
        });
        setCourses((prev) =>
          prev.map((c) =>
            c.id === editingCourse.id
              ? {
                  ...c,
                  fullname: courseForm.fullname.trim(),
                  shortname: courseForm.shortname.trim(),
                  categoryid: courseForm.category_id,
                  categoryName:
                    categories.find((cat) => cat.id === courseForm.category_id)?.name || c.categoryName,
                  summary: courseForm.summary.trim(),
                }
              : c
          )
        );
        setAlert({ type: 'success', message: `Course "${courseForm.fullname}" updated via API.` });
      } else {
        await adminService.createCourse({
          fullname: courseForm.fullname.trim(),
          shortname: courseForm.shortname.trim(),
          category_id: courseForm.category_id,
          format: courseForm.format,
          num_sections: courseForm.num_sections,
          tuition_fee: courseForm.tuition_fee,
          summary: courseForm.summary.trim(),
        });
        setAlert({ type: 'success', message: `Course "${courseForm.fullname}" created via API.` });
      }
      setShowCourseModal(false);
      setEditingCourse(null);
      await loadData();
    } catch (err: any) {
      setAlert({ type: 'danger', message: err?.message || 'Failed to save course.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Course Delete handler (API + Internal)
  const handleDeleteCourse = async (course: PublicCatalogCourse) => {
    if (!window.confirm(`Delete course "${course.fullname}" (${course.shortname})?`)) return;
    setSubmitting(true);
    try {
      await adminService.deleteCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      setAlert({ type: 'success', message: `Course "${course.fullname}" deleted.` });
      await loadData();
    } catch (err: any) {
      setAlert({ type: 'danger', message: err?.message || 'Failed to delete course.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCourseStudio = (courseId: number) => {
    if (onOpenCourseStudio) {
      onOpenCourseStudio(courseId);
    } else {
      setStudioCourseId(courseId);
    }
  };

  const visibleCourses =
    selectedFacultyId > 0
      ? courses.filter((c) => c.categoryid === selectedFacultyId)
      : courses;

  const content = (
    <div className={isAdmin ? '' : 'py-4'} style={{ background: isAdmin ? 'transparent' : '#f8fafc', minHeight: isAdmin ? 'auto' : '82vh' }}>
      {/* Header Banner: Admin Compact Card vs Public Hero */}
      {isAdmin ? (
        <div className="card border-0 shadow-sm rounded-3 bg-white p-3.5 mb-3">
          <div className="d-flex justify-content-between align-items-start align-items-md-center flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h5 className="fw-bold mb-0 text-dark">Course Categories & Academic Faculties Manager</h5>
                <span
                  className="badge rounded-pill"
                  style={{ backgroundColor: '#E8F4FC', color: '#013BA6', fontSize: '11px', fontWeight: 700 }}
                >
                  {categories.length} Categories • {courses.length} Courses
                </span>
              </div>
              <p className="text-muted small mb-0">
                Create, update, toggle visibility, or remove academic faculties and manage courses within each category.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="input-group input-group-sm" style={{ width: '210px' }}>
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="feather-search" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Filter categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '12px' }}
                />
              </div>

              <button
                type="button"
                onClick={() => loadData()}
                className="btn btn-sm btn-light border fw-semibold d-inline-flex align-items-center gap-1"
                style={{ fontSize: '12px' }}
              >
                <i className="isax isax-refresh" /> Refresh
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCourse(null);
                  setCourseForm({
                    fullname: '',
                    shortname: '',
                    category_id: selectedFacultyId || categories[0]?.id || 2,
                    format: 'topics',
                    num_sections: 6,
                    tuition_fee: 180000,
                    summary: '',
                    visible: 1,
                  });
                  setShowCourseModal(true);
                }}
                className="btn btn-sm btn-dark fw-semibold d-inline-flex align-items-center gap-1"
                style={{ fontSize: '12px' }}
              >
                <i className="feather-plus" /> + New Course
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCat(null);
                  setCatForm({ name: '', idnumber: '', parent: 0, description: '', visible: 1 });
                  setShowCatModal(true);
                }}
                className="btn btn-sm btn-primary fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
                style={{ backgroundColor: '#013BA6', borderColor: '#013BA6', fontSize: '12px' }}
              >
                <i className="feather-folder-plus" /> + New Category
              </button>
            </div>
          </div>
        </div>
      ) : (
        <section
          className="py-4 mb-4"
          style={{
            background: 'linear-gradient(135deg, #013BA6 0%, #013BA6 55%, #228DDD 100%)',
            borderBottom: '3px solid #F4ED2D',
          }}
        >
          <div className="container">
            <div className="row align-items-center g-3">
              <div className="col-lg-7">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span
                    className="badge rounded-pill px-3 py-1 fw-bold"
                    style={{ background: '#F4ED2D', color: '#051426', fontSize: '0.72rem' }}
                  >
                    ACADEMIC FACULTIES & SCHOOLS
                  </span>
                  <span className="small" style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>
                    {categories.length} Accredited Faculties • {courses.length} Programmes
                  </span>
                </div>
                <h1 className="fw-bold text-white mb-1" style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.8rem)' }}>
                  University Faculties & Academic Departments
                </h1>
                <p className="mb-0" style={{ color: '#cbd5e1', fontSize: '0.88rem', maxWidth: 640 }}>
                  Explore degree, diploma, and certificate programmes organized across our academic faculties.
                </p>
              </div>
              <div className="col-lg-5">
                <div className="d-flex align-items-center justify-content-lg-end gap-2 flex-wrap">
                  <div className="input-group input-group-sm" style={{ maxWidth: 260 }}>
                    <span className="input-group-text bg-white border-0 text-muted">
                      <i className="feather-search" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="Search faculty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className={isAdmin ? '' : 'container'}>
        {alert && (
          <div className={`alert alert-${alert.type} d-flex align-items-center justify-content-between py-2 px-3 rounded-3 mb-3 small shadow-sm`}>
            <span>{alert.message}</span>
            <button type="button" className="btn-close btn-sm" onClick={() => setAlert(null)} />
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
            <span className="text-muted small">Loading categories & programmes...</span>
          </div>
        ) : (
          <>
            {/* Faculty / Category Cards Grid with Full CUD */}
            <div className="row g-3 mb-4">
              {filteredCategories.map((cat, idx) => {
                const catCourses = courses.filter((c) => c.categoryid === cat.id);
                const active = selectedFacultyId === cat.id;
                const isVisible = (cat as any).visible !== 0;
                const icons = ['isax-cpu-setting', 'isax-chart-21', 'isax-courthouse', 'isax-teacher', 'isax-book-1'];
                const icon = icons[idx % icons.length];
                const coverImg = cat.categoryCover || cat.cover;
                const iconImg = cat.categoryIcon || cat.icon;
                const accent = cat.accentColor || '#013BA6';

                return (
                  <div className="col-lg-4 col-md-6 d-flex" key={cat.id}>
                    <div
                      className="card border-0 shadow-sm rounded-3 w-100 d-flex flex-column justify-content-between bg-white overflow-hidden"
                      style={{
                        border: active ? `2px solid ${accent}` : '1px solid #e2e8f0',
                        opacity: isVisible ? 1 : 0.72,
                      }}
                    >
                      {/* Category Cover Banner */}
                      {coverImg && (
                        <div
                          className="position-relative overflow-hidden"
                          style={{
                            height: '115px',
                            background: `${accent}15`,
                            borderBottom: '3px solid #F4ED2D',
                          }}
                        >
                          <img
                            src={coverImg}
                            alt={cat.name}
                            className="w-100 h-100 object-fit-cover"
                            style={{ opacity: 1 }}
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              const fallback = `/assets/img/category/covers/cat-cover-${cat.id}-fstes.svg`;
                              if (target.src !== fallback && !target.src.endsWith(fallback)) {
                                target.src = fallback;
                              }
                            }}
                          />
                          <span
                            className="badge position-absolute top-2 start-2 px-2.5 py-1 rounded-pill fw-bold shadow-sm"
                            style={{
                              backgroundColor: accent,
                              color: '#ffffff',
                              border: '1px solid #F4ED2D',
                              fontSize: '0.68rem',
                            }}
                          >
                            {cat.badgeText || cat.idnumber || `FAC-0${cat.id}`}
                          </span>
                        </div>
                      )}

                      <div className="p-3">
                        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                          <div className="d-flex align-items-center gap-2.5">
                            {iconImg ? (
                              <img
                                src={iconImg}
                                alt=""
                                className="rounded-2 flex-shrink-0"
                                style={{
                                  width: 42,
                                  height: 42,
                                  padding: 3,
                                  backgroundColor: `${accent}15`,
                                  border: `1.5px solid ${accent}`,
                                }}
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span
                                className="rounded-3 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: 40,
                                  height: 40,
                                  background: active ? '#061838' : '#eff6ff',
                                  color: active ? '#fbbf24' : '#013BA6',
                                }}
                              >
                                <i className={`isax ${icon} fs-5`} />
                              </span>
                            )}
                            <div>
                              <div className="d-flex align-items-center gap-1 mb-0.5">
                                {!coverImg && (
                                  <span className="badge bg-light text-secondary border" style={{ fontSize: '0.65rem' }}>
                                    {cat.badgeText || cat.idnumber || `FAC-0${cat.id}`}
                                  </span>
                                )}
                                {!isVisible && (
                                  <span className="badge bg-warning-subtle text-warning" style={{ fontSize: '0.65rem' }}>
                                    Hidden
                                  </span>
                                )}
                              </div>
                              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.94rem' }}>
                                {cat.name}
                              </h6>
                            </div>
                          </div>

                          {isStaff && (
                            <div className="d-flex align-items-center gap-1">
                              <button
                                type="button"
                                className="btn btn-sm btn-light rounded-circle p-1 text-secondary"
                                title={isVisible ? 'Hide Category' : 'Show Category'}
                                onClick={() => handleToggleCategoryVisibility(cat)}
                              >
                                <i className={`feather-${isVisible ? 'eye' : 'eye-off'}`} style={{ fontSize: 12 }} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-light rounded-circle p-1 text-primary"
                                title="Edit Category"
                                onClick={() => {
                                  setEditingCat(cat);
                                  setCatForm({
                                    name: cat.name,
                                    idnumber: cat.idnumber || '',
                                    parent: (cat as any).parent || 0,
                                    description: cat.description || '',
                                    visible: (cat as any).visible ?? 1,
                                  });
                                  setShowCatModal(true);
                                }}
                              >
                                <i className="feather-edit-2" style={{ fontSize: 12 }} />
                              </button>
                              {categories.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light rounded-circle p-1 text-danger"
                                  title="Delete Category"
                                  onClick={() => handleDeleteCategory(cat)}
                                >
                                  <i className="feather-trash-2" style={{ fontSize: 12 }} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <p className="text-muted small mb-2.5" style={{ fontSize: '0.79rem', lineHeight: 1.45 }}>
                          {cat.description ||
                            `Accredited undergraduate and postgraduate degree programmes under ${cat.name}.`}
                        </p>

                        {catCourses.length > 0 && (
                          <div className="d-flex flex-wrap gap-1">
                            {catCourses.slice(0, 3).map((c) => (
                              <Link
                                key={c.id}
                                to={`${routes.courseDetails}?id=${c.id}`}
                                className="badge bg-light text-dark border text-decoration-none"
                                style={{ fontSize: '0.67rem' }}
                              >
                                {c.shortname}: {c.fullname}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="px-3 py-2 bg-light border-top d-flex align-items-center justify-content-between">
                        <span className="small text-muted" style={{ fontSize: '0.74rem' }}>
                          <strong className="text-dark">{catCourses.length || cat.coursecount}</strong> Courses
                        </span>
                        <div className="d-flex gap-1">
                          {isStaff && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCourse(null);
                                setCourseForm({
                                  fullname: '',
                                  shortname: '',
                                  category_id: cat.id,
                                  format: 'topics',
                                  num_sections: 6,
                                  tuition_fee: 180000,
                                  summary: '',
                                  visible: 1,
                                });
                                setShowCourseModal(true);
                              }}
                              className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-0.5 fw-semibold"
                              style={{ fontSize: '0.7rem' }}
                              title="Add Course to this Category"
                            >
                              + Course
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const nextId = active ? 0 : cat.id;
                              setSelectedFacultyId(nextId);
                              if (!embeddedInAdmin) {
                                setSearchParams(nextId ? { id: String(nextId) } : {});
                              }
                            }}
                            className={`btn btn-sm rounded-pill px-2.5 py-0.5 fw-semibold ${
                              active ? 'btn-dark' : 'btn-outline-primary'
                            }`}
                            style={{ fontSize: '0.72rem' }}
                          >
                            {active ? 'All Categories' : 'Filter Courses'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Courses Under Selected Category with Full CUD */}
            <div className="card border-0 shadow-sm rounded-3 p-3.5 bg-white">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
                <div>
                  <h6 className="fw-bold text-dark mb-0">
                    {selectedFacultyId > 0
                      ? `Courses in ${categories.find((c) => c.id === selectedFacultyId)?.name || 'Selected Category'}`
                      : 'All Category Programmes & Courses'}
                  </h6>
                  <small className="text-muted">
                    {isStaff
                      ? 'Create, edit, open Course Content Studio, or delete courses directly within categories.'
                      : 'Select any programme to view its syllabus, study units, and enrolment options.'}
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {selectedFacultyId > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFacultyId(0);
                        if (!embeddedInAdmin) setSearchParams({});
                      }}
                      className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      style={{ fontSize: '11.5px' }}
                    >
                      Show All Categories
                    </button>
                  )}
                  {isStaff && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourse(null);
                        setCourseForm({
                          fullname: '',
                          shortname: '',
                          category_id: selectedFacultyId || categories[0]?.id || 2,
                          format: 'topics',
                          num_sections: 6,
                          tuition_fee: 180000,
                          summary: '',
                          visible: 1,
                        });
                        setShowCourseModal(true);
                      }}
                      className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold"
                      style={{ backgroundColor: '#013BA6', borderColor: '#013BA6', fontSize: '11.5px' }}
                    >
                      + Add Course Here
                    </button>
                  )}
                </div>
              </div>

              <div className="row g-3">
                {(visibleCourses.length > 0 ? visibleCourses : courses).map((course) => (
                  <div className="col-lg-4 col-md-6 d-flex" key={course.id}>
                    <div
                      className="card border-0 shadow-sm rounded-3 w-100 d-flex flex-column justify-content-between bg-white overflow-hidden"
                      style={{
                        border: '1.5px solid #e2e8f0',
                        borderTop: `3.5px solid ${course.accentColor || '#013BA6'}`,
                        borderBottom: '3px solid #F4ED2D',
                      }}
                    >
                      {/* Course Thumbnail */}
                      <div
                        className="position-relative overflow-hidden"
                        style={{
                          height: 140,
                          background: `${course.accentColor || '#013BA6'}15`,
                          borderBottom: '3px solid #F4ED2D',
                        }}
                      >
                        <Link to={`${routes.courseDetails}?id=${course.id}`}>
                          <img
                            src={course.courseImage || course.image || `/assets/img/course/thumbnails/course-${course.id}-${(course.shortname || `course-${course.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`}
                            alt={course.fullname}
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              const ownSlug = (course.shortname || `course-${course.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-');
                              const ownThumbnail = `/assets/img/course/thumbnails/course-${course.id}-${ownSlug}.svg`;
                              if (target.src !== ownThumbnail && !target.src.endsWith(ownThumbnail)) {
                                target.src = ownThumbnail;
                              }
                            }}
                          />
                        </Link>
                        <span
                          className="badge position-absolute top-2 start-2 px-2.5 py-1 rounded-pill fw-bold"
                          style={{
                            backgroundColor: course.accentColor || '#013BA6',
                            color: '#ffffff',
                            border: '1px solid #F4ED2D',
                            fontSize: '0.68rem',
                          }}
                        >
                          {course.shortname}
                        </span>
                        <span
                          className="badge position-absolute top-2 end-2 px-2.5 py-1 rounded-pill fw-bold"
                          style={{
                            background: '#F4ED2D',
                            color: '#003B66',
                            fontSize: '0.72rem',
                          }}
                        >
                          {course.priceFormatted}
                        </span>
                      </div>

                      <div className="p-3">
                        <div className="d-flex align-items-center justify-content-between mb-1.5">
                          <span className="badge bg-light text-secondary border text-truncate" style={{ fontSize: '0.65rem', maxWidth: '85%' }}>
                            {course.categoryName}
                          </span>
                        </div>
                        <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
                          <Link to={`${routes.courseDetails}?id=${course.id}`} className="text-dark text-decoration-none">
                            {course.fullname}
                          </Link>
                        </h6>
                        <p className="text-muted small mb-2" style={{ fontSize: '0.77rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {course.summary}
                        </p>
                      </div>

                      <div className="d-flex align-items-center justify-content-between pt-2 border-top flex-wrap gap-1">
                        <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {course.sectionsCount} Units • {course.enrolledCount} Scholars
                        </small>
                        <div className="d-flex align-items-center gap-1">
                          {isStaff && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenCourseStudio(course.id)}
                                className="btn btn-sm btn-outline-primary rounded-pill px-2 py-0.5"
                                style={{ fontSize: '0.7rem' }}
                                title="Open Course Sections & Activity Studio"
                              >
                                Studio
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCourse(course);
                                  setCourseForm({
                                    fullname: course.fullname,
                                    shortname: course.shortname,
                                    category_id: course.categoryid || categories[0]?.id || 2,
                                    format: course.format || 'topics',
                                    num_sections: course.sectionsCount || 6,
                                    tuition_fee: course.price || 0,
                                    summary: course.summary || '',
                                    visible: 1,
                                  });
                                  setShowCourseModal(true);
                                }}
                                className="btn btn-sm btn-light border rounded-circle p-1 text-secondary"
                                title="Edit Course"
                              >
                                <i className="feather-edit-2" style={{ fontSize: 11 }} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCourse(course)}
                                className="btn btn-sm btn-light border rounded-circle p-1 text-danger"
                                title="Delete Course"
                              >
                                <i className="feather-trash-2" style={{ fontSize: 11 }} />
                              </button>
                            </>
                          )}
                          <Link
                            to={`${routes.courseDetails}?id=${course.id}`}
                            className="btn btn-sm btn-primary rounded-pill px-2.5 py-0.5"
                            style={{ fontSize: '0.71rem' }}
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Category Create / Edit Modal */}
      {showCatModal && (
        <div className="modal d-block" style={{ background: 'rgba(15,23,42,0.55)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <form onSubmit={handleSaveCategory}>
                <div className="modal-header bg-dark text-white p-3">
                  <h6 className="modal-title fw-bold mb-0">
                    {editingCat ? `Edit Category: ${editingCat.name}` : 'Create New Academic Category / Faculty'}
                  </h6>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowCatModal(false)} />
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category / Faculty Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={catForm.name}
                      onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                      placeholder="e.g., Faculty of Science, Technology & Environmental Studies"
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Category Code</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={catForm.idnumber}
                        onChange={(e) => setCatForm({ ...catForm, idnumber: e.target.value })}
                        placeholder="e.g., OUT-FAC-FSTES"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Parent Category</label>
                      <select
                        className="form-select form-select-sm"
                        value={catForm.parent}
                        onChange={(e) => setCatForm({ ...catForm, parent: Number(e.target.value) })}
                      >
                        <option value={0}>Top Level (Root Faculty)</option>
                        {categories
                          .filter((c) => !editingCat || c.id !== editingCat.id)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Academic Overview / Description</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      value={catForm.description}
                      onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    />
                  </div>
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="catVisibleSwitch"
                      checked={catForm.visible === 1}
                      onChange={(e) => setCatForm({ ...catForm, visible: e.target.checked ? 1 : 0 })}
                    />
                    <label className="form-check-label small fw-semibold" htmlFor="catVisibleSwitch">
                      Published & Visible in Catalogue
                    </label>
                  </div>
                </div>
                <div className="modal-footer border-0 bg-light p-3">
                  <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => setShowCatModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-sm btn-primary rounded-pill px-4">
                    {submitting ? 'Saving...' : editingCat ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Course Create / Edit Modal */}
      {showCourseModal && (
        <div className="modal d-block" style={{ background: 'rgba(15,23,42,0.55)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <form onSubmit={handleSaveCourse}>
                <div className="modal-header bg-dark text-white p-3">
                  <h6 className="modal-title fw-bold mb-0">
                    {editingCourse ? `Edit Course: ${editingCourse.shortname}` : 'Create New Course in Category'}
                  </h6>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowCourseModal(false)} />
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Course Full Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={courseForm.fullname}
                      onChange={(e) => setCourseForm({ ...courseForm, fullname: e.target.value })}
                      placeholder="e.g., Artificial Intelligence & Machine Learning"
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Course Code (Shortname)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={courseForm.shortname}
                        onChange={(e) => setCourseForm({ ...courseForm, shortname: e.target.value })}
                        placeholder="e.g., CS304"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Category / Faculty</label>
                      <select
                        className="form-select form-select-sm"
                        value={courseForm.category_id}
                        onChange={(e) => setCourseForm({ ...courseForm, category_id: Number(e.target.value) })}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Format</label>
                      <select
                        className="form-select form-select-sm"
                        value={courseForm.format}
                        onChange={(e) => setCourseForm({ ...courseForm, format: e.target.value })}
                      >
                        <option value="topics">Topics / Units</option>
                        <option value="weeks">Weekly Schedule</option>
                        <option value="singleactivity">Single Activity</option>
                      </select>
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Study Units</label>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        className="form-control form-control-sm"
                        value={courseForm.num_sections}
                        onChange={(e) => setCourseForm({ ...courseForm, num_sections: Number(e.target.value) || 6 })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold">Tuition (TZS)</label>
                      <input
                        type="number"
                        min={0}
                        step={10000}
                        className="form-control form-control-sm"
                        value={courseForm.tuition_fee}
                        onChange={(e) => setCourseForm({ ...courseForm, tuition_fee: Number(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Course Syllabus Summary</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      value={courseForm.summary}
                      onChange={(e) => setCourseForm({ ...courseForm, summary: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 bg-light p-3">
                  <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => setShowCourseModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-sm btn-primary rounded-pill px-4">
                    {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Course Studio Modal when not delegated to parent AdminDashboard */}
      {studioCourseId && !onOpenCourseStudio && (
        <CourseSettingsStudio
          courseId={studioCourseId}
          isOpen={Boolean(studioCourseId)}
          onClose={() => setStudioCourseId(null)}
          categories={adminCategories}
          onNotify={(type, message) => setAlert({ type, message })}
          onCourseUpdated={loadData}
        />
      )}
    </div>
  );

  // If accessed directly via /course/course-category by an Admin (and not already embedded in AdminDashboard),
  // wrap in CorporateAdminLayout so it displays with the Admin Dashboard Sidebar & Header navigation!
  if (role === 'admin' && !embeddedInAdmin) {
    return (
      <CorporateAdminLayout activeView="categories" onRefresh={loadData}>
        {content}
      </CorporateAdminLayout>
    );
  }

  return content;
};

export default CourseCategory;
