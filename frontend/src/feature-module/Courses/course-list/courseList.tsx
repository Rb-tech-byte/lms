import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import {
  courseService,
  PublicCatalogCourse,
  PublicCatalogCategory,
} from '../../../core/api/courseService';

const PAGE_SIZE = 6;

const CourseList: React.FC = () => {
  const route = all_routes;
  const [searchParams] = useSearchParams();
  const rawCatParam = searchParams.get('category') || searchParams.get('id') || '';
  const initialCategoryId = !isNaN(Number(rawCatParam)) && Number(rawCatParam) > 0 ? Number(rawCatParam) : 0;

  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);
  const [categories, setCategories] = useState<PublicCatalogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(initialCategoryId);
  const [programFilter, setProgramFilter] = useState<'all' | 'psc' | 'mooc'>('all');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<'popular' | 'title' | 'fee_asc'>('popular');
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    let mounted = true;
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const res = await courseService.getPublicCatalog();
        if (!mounted) return;
        setCourses(res.courses || []);
        setCategories(res.categories || []);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  // Sync category filter if URL param is either numeric ID or faculty name string
  useEffect(() => {
    const catParam = searchParams.get('category') || searchParams.get('id');
    if (catParam) {
      const num = Number(catParam);
      if (!isNaN(num) && num > 0) {
        setSelectedCategory(num);
      } else if (categories.length > 0) {
        const decoded = decodeURIComponent(catParam).toLowerCase().trim();
        const found = categories.find(
          (c) =>
            c.name.toLowerCase() === decoded ||
            c.name.toLowerCase().includes(decoded) ||
            decoded.includes(c.name.toLowerCase()) ||
            (c.idnumber && c.idnumber.toLowerCase() === decoded) ||
            (c.badgeText && c.badgeText.toLowerCase() === decoded)
        );
        if (found) {
          setSelectedCategory(found.id);
        }
      }
    }
  }, [searchParams, categories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, programFilter, searchQuery, sortBy]);

  const clearFilters = () => {
    setSelectedCategory(0);
    setProgramFilter('all');
    setSearchQuery('');
    setSortBy('popular');
    setCurrentPage(1);
  };

  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => {
        if (programFilter === 'psc' && !c.isPSC) return false;
        if (programFilter === 'mooc' && !c.isMOOC) return false;
        if (selectedCategory > 0 && c.categoryid !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            c.fullname.toLowerCase().includes(q) ||
            c.shortname.toLowerCase().includes(q) ||
            c.summary.toLowerCase().includes(q) ||
            c.categoryName.toLowerCase().includes(q) ||
            c.instructor.fullname.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.fullname.localeCompare(b.fullname);
        if (sortBy === 'fee_asc') return a.tuitionFee - b.tuitionFee;
        return b.enrolledCount - a.enrolledCount;
      });
  }, [courses, programFilter, selectedCategory, searchQuery, sortBy]);

  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCourses, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 160, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '82vh' }}>
      <section
        className="py-3.5"
        style={{
          background: 'linear-gradient(135deg, #005B97 0%, #0171BB 55%, #0082D6 100%)',
          borderBottom: '3px solid #FFD200',
        }}
      >
        <div className="container">
          <div className="row align-items-center g-3">
            <div className="col-lg-7">
              <span
                className="badge rounded-pill px-2.5 py-1 fw-bold mb-1.5"
                style={{ background: '#FFD200', color: '#051426', fontSize: '0.7rem' }}
              >
                PROGRAMME DIRECTORY
              </span>
              <h1 className="fw-bold text-white mb-1" style={{ fontSize: 'clamp(1.3rem, 2vw, 1.7rem)' }}>
                University Course Directory
              </h1>
              <p className="mb-0 text-white-50" style={{ fontSize: '0.84rem' }}>
                Showing {totalItems} accredited university courses with structured learning units.
              </p>
            </div>
            <div className="col-lg-5">
              <div className="d-flex align-items-center justify-content-lg-end gap-2">
                <div className="input-group input-group-sm" style={{ maxWidth: 280 }}>
                  <span className="input-group-text bg-white border-0 text-muted">
                    <i className="feather-search" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search course code or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  />
                  {searchQuery && (
                    <button type="button" className="btn btn-light border-0" onClick={() => setSearchQuery('')}>
                      <i className="feather-x" />
                    </button>
                  )}
                </div>
                <Link to={route.courseGrid} className="btn btn-sm btn-outline-light rounded-pill px-2.5" title="Grid View">
                  <i className="feather-grid" />
                </Link>
                <Link to={route.courseList} className="btn btn-sm btn-warning rounded-pill px-2.5 fw-semibold" title="List View">
                  <i className="feather-list" />
                </Link>
              </div>
            </div>
          </div>

          {/* Faculty Filter Pills with Authentic Icons and Active Colors */}
          <div className="d-flex align-items-center gap-1.5 flex-wrap mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              type="button"
              onClick={() => setSelectedCategory(0)}
              className="btn btn-sm rounded-pill px-3 py-1 fw-semibold"
              style={{
                fontSize: '0.74rem',
                background: selectedCategory === 0 ? '#FFD200' : 'rgba(255,255,255,0.12)',
                color: selectedCategory === 0 ? '#0f172a' : '#ffffff',
                border: selectedCategory === 0 ? '1px solid #FFD200' : '1px solid rgba(255,255,255,0.2)',
              }}
            >
              All Faculties ({courses.length})
            </button>
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              const accent = cat.accentColor || '#0171BB';
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(active ? 0 : cat.id)}
                  className="btn btn-sm rounded-pill px-3 py-1 fw-medium d-flex align-items-center gap-1.5"
                  style={{
                    fontSize: '0.74rem',
                    background: active ? '#FFD200' : 'rgba(255,255,255,0.1)',
                    color: active ? '#0f172a' : '#ffffff',
                    border: active ? '1px solid #FFD200' : `1px solid ${accent}60`,
                  }}
                >
                  {cat.icon && (
                    <img
                      src={cat.icon}
                      alt=""
                      style={{ width: 14, height: 14, objectFit: 'contain' }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container">
          {/* Top Bar Options */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 p-2 bg-white rounded-3 shadow-sm border">
            <div className="d-flex align-items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setProgramFilter('all')}
                className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${
                  programFilter === 'all' ? 'btn-primary' : 'btn-light text-dark'
                }`}
                style={{ fontSize: '0.74rem' }}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setProgramFilter('psc')}
                className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${
                  programFilter === 'psc' ? 'btn-warning text-dark' : 'btn-light text-dark'
                }`}
                style={{ fontSize: '0.74rem' }}
              >
                🎯 Professional Short Courses
              </button>
              <button
                type="button"
                onClick={() => setProgramFilter('mooc')}
                className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${
                  programFilter === 'mooc' ? 'btn-success text-white' : 'btn-light text-dark'
                }`}
                style={{ fontSize: '0.74rem' }}
              >
                🌐 MOOCs • Free
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
                Showing <strong>{totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalItems)}</strong> of <strong>{totalItems}</strong>
              </span>
              <select
                className="form-select form-select-sm rounded-2 py-1"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ fontSize: '0.74rem', width: 'auto' }}
              >
                <option value="popular">Most Enrolled</option>
                <option value="title">Alphabetical (A-Z)</option>
                <option value="fee_asc">Tuition: Low to High</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
              <span className="small text-muted">Loading courses...</span>
            </div>
          ) : paginatedCourses.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <h6 className="fw-bold text-dark mb-1">No courses found</h6>
              <p className="text-muted small mb-3">Adjust your search or filter parameters to find courses.</p>
              <div>
                <button type="button" onClick={clearFilters} className="btn btn-sm btn-primary rounded-pill px-4">
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {paginatedCourses.map((c) => {
                const accent = c.accentColor || '#0171BB';
                const courseSlug = (c.shortname || `course-${c.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-');
                const thumbUrl = c.courseImage || c.image || `/assets/img/course/thumbnails/course-${c.id}-${courseSlug}.svg`;

                return (
                  <div
                    className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden p-3"
                    key={c.id}
                    style={{
                      border: '1.5px solid #E2E8F0',
                      borderLeft: `5px solid ${accent}`,
                      borderBottom: '2.5px solid #FFD200',
                    }}
                  >
                    <div className="row align-items-center g-3">
                      <div className="col-md-3">
                        {/* Guaranteed Height Course Cover Banner */}
                        <div
                          className="position-relative rounded-3 overflow-hidden w-100"
                          style={{
                            height: 140,
                            border: '1px solid #E2E8F0',
                            background: `linear-gradient(135deg, ${accent}22 0%, ${accent}44 100%)`,
                          }}
                        >
                          <Link to={`${route.courseDetails}?id=${c.id}`} className="d-block w-100 h-100">
                            <img
                              src={thumbUrl}
                              alt={c.fullname}
                              className="w-100 h-100 d-block"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.onerror = null;
                                target.src = '/assets/img/course/thumbnails/course-2-cs101.svg';
                              }}
                            />
                          </Link>
                          <span
                            className="badge rounded-pill position-absolute top-0 start-0 m-2 px-2.5 py-1 fw-bold"
                            style={{
                              background: accent,
                              color: '#ffffff',
                              border: '1px solid #FFD200',
                              fontSize: '0.68rem',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            }}
                          >
                            {c.shortname}
                          </span>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="badge fw-semibold"
                            style={{ background: `${accent}18`, color: accent, fontSize: '0.68rem' }}
                          >
                            {c.categoryName}
                          </span>
                          {c.isPSC && (
                            <span className="badge bg-warning-subtle text-dark border border-warning" style={{ fontSize: '0.64rem' }}>
                              PSC • {c.cpdCredits || 20} CPD
                            </span>
                          )}
                          {c.isMOOC && (
                            <span className="badge bg-success-subtle text-success border border-success" style={{ fontSize: '0.64rem' }}>
                              MOOC • Free
                            </span>
                          )}
                        </div>
                        <h5 className="fw-bold mb-1.5" style={{ fontSize: '0.96rem' }}>
                          <Link to={`${route.courseDetails}?id=${c.id}`} className="text-dark text-decoration-none">
                            {c.fullname}
                          </Link>
                        </h5>
                        <p className="text-muted small mb-2 text-truncate" style={{ maxWidth: 540, fontSize: '0.78rem' }}>
                          {c.summary || 'Structured university study units and academic assessment.'}
                        </p>
                        <div className="d-flex align-items-center gap-3 text-muted small" style={{ fontSize: '0.74rem' }}>
                          <span>
                            <i className="feather-book-open text-primary me-1" />
                            {c.sectionsCount} Units
                          </span>
                          <span>
                            <i className="feather-users text-secondary me-1" />
                            {c.enrolledCount} Scholars
                          </span>
                          <span>
                            <i className="fas fa-star text-warning me-1" />
                            {c.rating}
                          </span>
                        </div>
                      </div>

                      <div className="col-md-3 text-md-end border-start-md">
                        <div className="fw-bold text-dark fs-5 mb-2">{c.priceFormatted}</div>
                        <div className="d-flex flex-column gap-1.5">
                          {c.isMOOC ? (
                            <Link
                              to={`/course/course-watch?courseId=${c.id}`}
                              className="btn btn-sm btn-success rounded-pill fw-semibold text-white"
                              style={{ fontSize: '0.76rem' }}
                            >
                              Enrol Free
                            </Link>
                          ) : (
                            <Link
                              to={`/course/course-checkout?courseId=${c.id}`}
                              className="btn btn-sm btn-warning rounded-pill fw-semibold text-dark"
                              style={{ fontSize: '0.76rem' }}
                            >
                              Enrol Now
                            </Link>
                          )}
                          <Link
                            to={`${route.courseDetails}?id=${c.id}`}
                            className="btn btn-sm btn-outline-primary rounded-pill fw-semibold"
                            style={{ fontSize: '0.76rem' }}
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-4 pt-3 border-top">
              <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </div>
              <ul className="pagination pagination-sm mb-0 gap-1">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link rounded-2 px-2.5 py-1"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ fontSize: '0.78rem' }}
                  >
                    Prev
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item ${currentPage === p ? 'active' : ''}`}>
                    <button
                      type="button"
                      className={`page-link rounded-2 px-3 py-1 fw-semibold ${
                        currentPage === p ? 'bg-primary text-white border-primary' : ''
                      }`}
                      onClick={() => handlePageChange(p)}
                      style={{ fontSize: '0.78rem' }}
                    >
                      {p}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link rounded-2 px-2.5 py-1"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{ fontSize: '0.78rem' }}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseList;
