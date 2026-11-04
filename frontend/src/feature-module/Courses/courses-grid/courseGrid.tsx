import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import {
  courseService,
  PublicCatalogCourse,
  PublicCatalogCategory,
  PublicInstructor,
} from '../../../core/api/courseService';

const PAGE_SIZE = 6;

const CourseGrid: React.FC = () => {
  const route = all_routes;
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = Number(searchParams.get('category') || searchParams.get('id') || 0);
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';

  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);
  const [categories, setCategories] = useState<PublicCatalogCategory[]>([]);
  const [instructors, setInstructors] = useState<PublicInstructor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(initialCategory);
  const [selectedInstructor, setSelectedInstructor] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<'all' | 'psc' | 'mooc' | 'micro'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Foundational' | 'Intermediate' | 'Advanced'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<'popular' | 'title' | 'fee_asc' | 'fee_desc'>('popular');
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    let mounted = true;
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const [catalog, instList] = await Promise.all([
          courseService.getPublicCatalog(),
          courseService.getPublicInstructors(),
        ]);
        if (!mounted) return;
        setCourses(catalog.courses || []);
        setCategories(catalog.categories || []);
        setInstructors(instList || []);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedInstructor, programFilter, difficultyFilter, priceFilter, searchQuery, sortBy]);

  const clearFilters = () => {
    setSelectedCategory(0);
    setSelectedInstructor('all');
    setProgramFilter('all');
    setDifficultyFilter('all');
    setPriceFilter('all');
    setSearchQuery('');
    setSortBy('popular');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Real-time dynamic filtered courses
  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => {
        if (programFilter === 'psc' && !c.isPSC) return false;
        if (programFilter === 'mooc' && !c.isMOOC) return false;
        if (programFilter === 'micro' && (!c.hasLiveClassroom && !c.isMOOC)) return false;
        if (priceFilter === 'free' && c.tuitionFee > 0) return false;
        if (priceFilter === 'paid' && c.tuitionFee === 0) return false;
        if (difficultyFilter !== 'all' && c.difficultyLevel !== difficultyFilter) return false;
        if (selectedCategory > 0 && c.categoryid !== selectedCategory) return false;
        if (selectedInstructor !== 'all' && c.instructor.fullname !== selectedInstructor) return false;
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
        if (sortBy === 'fee_desc') return b.tuitionFee - a.tuitionFee;
        return b.enrolledCount - a.enrolledCount;
      });
  }, [courses, programFilter, priceFilter, difficultyFilter, selectedCategory, selectedInstructor, searchQuery, sortBy]);

  // Pagination calculation
  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCourses, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '82vh' }}>
      {/* Compact Dark-Navy Header Card */}
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
              <div className="d-flex align-items-center gap-2 mb-1.5">
                <span
                  className="badge rounded-pill px-2.5 py-1 fw-bold"
                  style={{ background: '#FFD200', color: '#051426', fontSize: '0.7rem' }}
                >
                  PROGRAMME CATALOGUE
                </span>
                <span className="small" style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>
                  {courses.length} Accredited Courses • {categories.length} Faculties
                </span>
              </div>
              <h1 className="fw-bold text-white mb-1" style={{ fontSize: 'clamp(1.3rem, 2vw, 1.7rem)' }}>
                University Courses & Degree Modules
              </h1>
              <p className="mb-0" style={{ color: '#cbd5e1', fontSize: '0.84rem', maxWidth: 620 }}>
                Explore accredited undergraduate, postgraduate, and continuing professional development programmes with modular microlearning.
              </p>
            </div>

            <div className="col-lg-5">
              <div className="d-flex align-items-center justify-content-lg-end gap-2 flex-wrap">
                <div className="input-group input-group-sm" style={{ maxWidth: 290 }}>
                  <span className="input-group-text bg-white border-0 text-muted">
                    <i className="feather-search" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search code, title, or faculty..."
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

                <Link
                  to={route.courseGrid}
                  className="btn btn-sm btn-warning rounded-pill px-2.5 fw-semibold"
                  title="Grid View"
                >
                  <i className="feather-grid" />
                </Link>
                <Link
                  to={route.courseList}
                  className="btn btn-sm btn-outline-light rounded-pill px-2.5"
                  title="List View"
                >
                  <i className="feather-list" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-4">
        <div className="container">
          <div className="row g-4">
            {/* Left Dynamic Filter Sidebar */}
            <div className="col-lg-3">
              <div
                className="card border-0 shadow-sm rounded-4 p-3 bg-white sticky-top"
                style={{ top: 80, border: '1px solid #e2e8f0' }}
              >
                <div className="d-flex align-items-center justify-content-between pb-2 mb-2.5 border-bottom">
                  <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.88rem' }}>
                    <i className="feather-filter text-primary me-1.5" />
                    Filter Catalog
                  </h6>
                  {(selectedCategory > 0 ||
                    selectedInstructor !== 'all' ||
                    programFilter !== 'all' ||
                    difficultyFilter !== 'all' ||
                    priceFilter !== 'all' ||
                    searchQuery) && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                      style={{ fontSize: '0.74rem' }}
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Real-time Search Within Filters */}
                <div className="mb-3">
                  <label className="text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                    Quick Search
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="feather-search" style={{ fontSize: 12 }} />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0"
                      placeholder="Keyword or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ fontSize: '0.78rem' }}
                    />
                  </div>
                </div>

                {/* Tuition Fee Filter */}
                <div className="mb-3">
                  <div className="text-uppercase fw-bold text-muted mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                    Tuition Fee
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      onClick={() => setPriceFilter('all')}
                      className={`btn btn-sm flex-fill rounded-2 py-1 ${
                        priceFilter === 'all' ? 'btn-primary fw-semibold' : 'btn-light text-dark'
                      }`}
                      style={{ fontSize: '0.74rem' }}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceFilter('free')}
                      className={`btn btn-sm flex-fill rounded-2 py-1 ${
                        priceFilter === 'free' ? 'btn-success text-white fw-semibold' : 'btn-light text-dark'
                      }`}
                      style={{ fontSize: '0.74rem' }}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceFilter('paid')}
                      className={`btn btn-sm flex-fill rounded-2 py-1 ${
                        priceFilter === 'paid' ? 'btn-warning text-dark fw-semibold' : 'btn-light text-dark'
                      }`}
                      style={{ fontSize: '0.74rem' }}
                    >
                      Paid
                    </button>
                  </div>
                </div>

                {/* Difficulty / Level Filter */}
                <div className="mb-3">
                  <div className="text-uppercase fw-bold text-muted mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                    Academic Level
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {(['all', 'Foundational', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficultyFilter(lvl)}
                        className={`btn btn-sm rounded-pill px-2.5 py-0.5 ${
                          difficultyFilter === lvl ? 'btn-dark fw-semibold' : 'btn-light text-muted'
                        }`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {lvl === 'all' ? 'All Levels' : lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Academic Faculties Filter */}
                <div className="mb-3 pt-2 border-top">
                  <div className="text-uppercase fw-bold text-muted mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                    Academic Faculties
                  </div>
                  <div className="d-flex flex-column gap-1" style={{ maxHeight: 200, overflowY: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(0)}
                      className={`btn btn-sm text-start rounded-2 d-flex align-items-center justify-content-between px-2.5 py-1 ${
                        selectedCategory === 0 ? 'btn-primary fw-semibold' : 'btn-light text-dark'
                      }`}
                      style={{ fontSize: '0.76rem' }}
                    >
                      <span>All Faculties</span>
                      <span className="badge rounded-pill bg-white text-dark" style={{ fontSize: '0.66rem' }}>
                        {courses.length}
                      </span>
                    </button>
                    {categories.map((cat) => {
                      const count = courses.filter((c) => c.categoryid === cat.id).length || cat.coursecount;
                      const active = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(active ? 0 : cat.id)}
                          className={`btn btn-sm text-start rounded-2 d-flex align-items-center justify-content-between px-2.5 py-1 ${
                            active ? 'btn-primary fw-semibold' : 'btn-light text-dark'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <span className="text-truncate me-1">{cat.name}</span>
                          <span className="badge rounded-pill bg-white text-dark" style={{ fontSize: '0.66rem' }}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Course Coordinators Filter */}
                {instructors.length > 0 && (
                  <div className="mb-3 pt-2 border-top">
                    <div className="text-uppercase fw-bold text-muted mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                      Course Coordinator
                    </div>
                    <div className="d-flex flex-column gap-1" style={{ maxHeight: 150, overflowY: 'auto' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedInstructor('all')}
                        className={`btn btn-sm text-start rounded-2 px-2.5 py-1 ${
                          selectedInstructor === 'all' ? 'btn-primary fw-semibold' : 'btn-light text-dark'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        All Coordinators
                      </button>
                      {instructors.map((inst) => (
                        <button
                          key={inst.id}
                          type="button"
                          onClick={() =>
                            setSelectedInstructor(selectedInstructor === inst.fullname ? 'all' : inst.fullname)
                          }
                          className={`btn btn-sm text-start rounded-2 d-flex align-items-center gap-1.5 px-2.5 py-1 ${
                            selectedInstructor === inst.fullname ? 'btn-primary fw-semibold' : 'btn-light text-dark'
                          }`}
                          style={{ fontSize: '0.74rem' }}
                        >
                          <img
                            src={inst.avatar}
                            alt={inst.fullname}
                            className="rounded-circle flex-shrink-0"
                            style={{ width: 18, height: 18, objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                            }}
                          />
                          <span className="text-truncate">{inst.fullname}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sort Order Selector */}
                <div className="pt-2 border-top">
                  <div className="text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                    Sort Catalog
                  </div>
                  <select
                    className="form-select form-select-sm rounded-2"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{ fontSize: '0.76rem' }}
                  >
                    <option value="popular">Most Enrolled Scholars</option>
                    <option value="title">Alphabetical (A – Z)</option>
                    <option value="fee_asc">Tuition: Low to High</option>
                    <option value="fee_desc">Tuition: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Course Cards Grid + Pagination */}
            <div className="col-lg-9">
              {/* Specialized Track Filter Bar */}
              <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3 p-2 bg-white rounded-3 shadow-sm border">
                <div className="d-flex align-items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setProgramFilter('all')}
                    className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${
                      programFilter === 'all' ? 'btn-primary' : 'btn-light text-dark'
                    }`}
                    style={{ fontSize: '0.74rem' }}
                  >
                    All ({courses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgramFilter('psc')}
                    className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${
                      programFilter === 'psc' ? 'btn-warning text-dark' : 'btn-light text-dark'
                    }`}
                    style={{ fontSize: '0.74rem' }}
                  >
                    🎯 Professional Short Courses ({courses.filter((c) => c.isPSC).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgramFilter('mooc')}
                    className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${
                      programFilter === 'mooc' ? 'btn-success text-white' : 'btn-light text-dark'
                    }`}
                    style={{ fontSize: '0.74rem' }}
                  >
                    🌐 MOOCs • Free ({courses.filter((c) => c.isMOOC).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgramFilter('micro')}
                    className={`btn btn-sm rounded-pill px-2.5 py-1 fw-semibold ${
                      programFilter === 'micro' ? 'btn-info text-white' : 'btn-light text-dark'
                    }`}
                    style={{ fontSize: '0.74rem' }}
                  >
                    ⚡ Live Classrooms
                  </button>
                </div>

                <div className="text-muted small" style={{ fontSize: '0.74rem' }}>
                  Showing <strong>{totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalItems)}</strong> of <strong>{totalItems}</strong>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                  <span className="text-muted small">Loading dynamic course catalogue...</span>
                </div>
              ) : paginatedCourses.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                  <div className="mb-2">
                    <i className="feather-search text-muted" style={{ fontSize: 36 }} />
                  </div>
                  <h6 className="fw-bold text-dark mb-1">No courses match your active filter</h6>
                  <p className="text-muted small mb-3">
                    Try adjusting your search keyword, category, or tuition filter.
                  </p>
                  <div>
                    <button type="button" onClick={clearFilters} className="btn btn-sm btn-primary rounded-pill px-4">
                      Reset Filters
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="row g-3">
                    {paginatedCourses.map((course) => (
                      <div className="col-xl-4 col-md-6 d-flex" key={course.id}>
                        <div
                          className="card border-0 shadow-sm rounded-3 w-100 d-flex flex-column justify-content-between bg-white overflow-hidden"
                          style={{
                            border: '1.5px solid #E2E8F0',
                            borderTop: `3.5px solid ${course.accentColor || '#0171BB'}`,
                            borderBottom: '3px solid #FFD200',
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <div>
                            {/* Card Image Banner */}
                            <div className="position-relative overflow-hidden" style={{ background: course.accentColor ? `${course.accentColor}12` : '#F0F8FF', borderBottom: '3px solid #FFD200' }}>
                              <Link to={`${route.courseDetails}?id=${course.id}`}>
                                <img
                                  src={course.courseImage}
                                  alt={course.fullname}
                                  className="w-100"
                                  style={{
                                    height: 140,
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease',
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const ownSlug = (course.shortname || `course-${course.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-');
                                    const ownThumbnail = `/assets/img/course/thumbnails/course-${course.id}-${ownSlug}.svg`;
                                    if (target.src !== ownThumbnail && !target.src.endsWith(ownThumbnail)) {
                                      target.src = ownThumbnail;
                                    }
                                  }}
                                />
                              </Link>
                              <span
                                className="badge rounded-pill position-absolute top-0 start-0 m-2 px-2.5 py-1 fw-bold"
                                style={{ background: course.accentColor || '#0171BB', color: '#ffffff', border: '1px solid #FFD200', fontSize: '0.68rem', boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }}
                              >
                                {course.shortname}
                              </span>
                              <span
                                className="badge rounded-pill position-absolute top-0 end-0 m-2 px-2.5 py-1 fw-bold"
                                style={{ background: '#FFD200', color: '#003B66', fontSize: '0.72rem', boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }}
                              >
                                {course.priceFormatted}
                              </span>
                            </div>

                            {/* Card Body */}
                            <div className="p-3">
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <span
                                  className="text-primary fw-semibold text-truncate"
                                  style={{ fontSize: '0.7rem', maxWidth: '75%' }}
                                >
                                  {course.categoryName}
                                </span>
                                <span className="small text-muted" style={{ fontSize: '0.7rem' }}>
                                  <i className="fas fa-star text-warning me-1" />
                                  {course.rating}
                                </span>
                              </div>

                              <h6 className="fw-bold mb-1.5" style={{ fontSize: '0.88rem', lineHeight: 1.35 }}>
                                <Link
                                  to={`${route.courseDetails}?id=${course.id}`}
                                  className="text-dark text-decoration-none"
                                >
                                  {course.fullname}
                                </Link>
                              </h6>

                              {/* Badges Row */}
                              <div className="d-flex align-items-center gap-1 flex-wrap my-1.5">
                                {course.isPSC && (
                                  <span
                                    className="badge bg-warning-subtle text-dark border border-warning fw-bold px-1.5 py-0.5"
                                    style={{ fontSize: '0.64rem' }}
                                  >
                                    PSC • {course.cpdCredits || 20} CPD
                                  </span>
                                )}
                                {course.isMOOC && (
                                  <span
                                    className="badge bg-success-subtle text-success border border-success fw-bold px-1.5 py-0.5"
                                    style={{ fontSize: '0.64rem' }}
                                  >
                                    MOOC • Free
                                  </span>
                                )}
                                {course.hasLiveClassroom && (
                                  <span
                                    className="badge bg-info-subtle text-info border border-info px-1.5 py-0.5"
                                    style={{ fontSize: '0.64rem' }}
                                    title="BigBlueButton Live Interactive Webinars"
                                  >
                                    <i className="fas fa-video me-1" />Live Class
                                  </span>
                                )}
                                {course.hasCertificate && (
                                  <span
                                    className="badge bg-primary-subtle text-primary border border-primary px-1.5 py-0.5"
                                    style={{ fontSize: '0.64rem' }}
                                    title="Digital Verifiable Certificate"
                                  >
                                    <i className="fas fa-award me-1" />Cert
                                  </span>
                                )}
                              </div>

                              <p
                                className="text-muted mb-2"
                                style={{
                                  fontSize: '0.76rem',
                                  lineHeight: 1.45,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {course.summary ||
                                  'Structured university study units, digital readings, and continuous assessments.'}
                              </p>

                              <div className="d-flex align-items-center justify-content-between small text-muted pt-2 border-top" style={{ fontSize: '0.72rem' }}>
                                <span>
                                  <i className="isax isax-book-1 text-primary me-1" />
                                  {course.sectionsCount} Units • {course.modulesCount} Activities
                                </span>
                                <span>
                                  <i className="isax isax-profile-2user text-secondary me-1" />
                                  {course.enrolledCount} Scholars
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="px-3 py-2 bg-light border-top d-flex align-items-center justify-content-between">
                            <Link
                              to={`${route.instructorDetails}?id=${course.instructor.id}`}
                              className="d-flex align-items-center gap-1.5 text-decoration-none overflow-hidden"
                            >
                              <img
                                src={course.instructor.avatar}
                                alt={course.instructor.fullname}
                                className="rounded-circle flex-shrink-0"
                                style={{ width: 22, height: 22, objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                                }}
                              />
                              <span className="text-dark fw-medium text-truncate" style={{ fontSize: '0.74rem', maxWidth: 110 }}>
                                {course.instructor.fullname}
                              </span>
                            </Link>

                            <div className="d-flex gap-1">
                              {course.isMOOC ? (
                                <Link
                                  to={`/course/course-watch?courseId=${course.id}`}
                                  className="btn btn-sm btn-success rounded-pill px-2 py-0.5 fw-semibold text-white"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  Enrol Free
                                </Link>
                              ) : (
                                <Link
                                  to={`/course/course-checkout?courseId=${course.id}`}
                                  className="btn btn-sm btn-warning rounded-pill px-2 py-0.5 fw-semibold text-dark"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  Enrol Now
                                </Link>
                              )}
                              <Link
                                to={`${route.courseDetails}?id=${course.id}`}
                                className="btn btn-sm btn-outline-primary rounded-pill px-2 py-0.5 fw-semibold"
                                style={{ fontSize: '0.7rem' }}
                              >
                                Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clean Modern Pagination Controls (6 per page) */}
                  {totalPages > 1 && (
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-4 pt-3 border-top">
                      <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} total programmes)
                      </div>
                      <nav aria-label="Course catalogue pagination">
                        <ul className="pagination pagination-sm mb-0 gap-1">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              type="button"
                              className="page-link rounded-2 px-2.5 py-1"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              style={{ fontSize: '0.78rem' }}
                            >
                              <i className="feather-chevron-left me-1" /> Prev
                            </button>
                          </li>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <li
                              key={pageNum}
                              className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                            >
                              <button
                                type="button"
                                className={`page-link rounded-2 px-3 py-1 fw-semibold ${
                                  currentPage === pageNum ? 'bg-primary text-white border-primary' : ''
                                }`}
                                onClick={() => handlePageChange(pageNum)}
                                style={{ fontSize: '0.78rem' }}
                              >
                                {pageNum}
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
                              Next <i className="feather-chevron-right ms-1" />
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseGrid;
