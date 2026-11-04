import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { courseService, PublicCatalogCourse } from '../../../core/api/courseService';
import { useCmsConfig } from '../../../core/api/cmsService';

const BlogGrid: React.FC = () => {
  const route = all_routes;
  const { cms } = useCmsConfig();
  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    courseService
      .getPublicCatalog()
      .then((res) => {
        if (mounted) setCourses(res.courses || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Merge CMS bulletins + dynamic course notices
  const cmsItems = (cms.sections?.bulletins?.items || []).map((b: any, idx: number) => ({
    id: b.id || `cms-${idx}`,
    title: b.title,
    category: b.category || 'Academic Notice',
    date: b.date || 'Current Semester',
    summary: b.summary,
    image: b.image || `/assets/img/course/course-0${(idx % 4) + 1}.jpg`,
    link: b.route || route.courseGrid,
    author: 'Office of the Deputy Vice Chancellor (Academics)',
  }));

  const courseItems = courses.map((c) => ({
    id: `course-${c.id}`,
    title: `${c.shortname}: ${c.fullname} — Study Schedule & Assessment Guide`,
    category: c.categoryName,
    date: 'Active Semester',
    summary:
      c.summary ||
      `Updated syllabus units, continuous assessment timelines, and study materials for ${c.fullname}.`,
    image: c.courseImage,
    link: `${route.courseDetails}?id=${c.id}`,
    author: c.instructor.fullname,
  }));

  const allNotices = [...cmsItems, ...courseItems];
  const categories = Array.from(new Set(allNotices.map((n) => n.category)));

  const filtered = allNotices.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '82vh' }}>
      <section
        className="py-4"
        style={{
          background: 'linear-gradient(135deg, #005B97 0%, #0171BB 55%, #0082D6 100%)',
          borderBottom: '3px solid #FFD200',
        }}
      >
        <div className="container">
          <div className="row align-items-center g-3">
            <div className="col-lg-7">
              <span
                className="badge rounded-pill px-3 py-1 fw-bold mb-2"
                style={{ background: '#FFD200', color: '#051426', fontSize: '0.72rem' }}
              >
                {cms.sections?.bulletins?.eyebrow || 'OFFICIAL NOTICES & BULLETINS'}
              </span>
              <h1 className="fw-bold text-white mb-1" style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.8rem)' }}>
                {cms.sections?.bulletins?.title || 'University Academic Notices & Announcements'}
              </h1>
              <p className="mb-0" style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>
                {cms.sections?.bulletins?.subtitle ||
                  'Official semester dates, examination timetables, admissions updates, and programme circulars.'}
              </p>
            </div>
            <div className="col-lg-5">
              <div className="d-flex justify-content-lg-end">
                <div className="input-group input-group-sm" style={{ maxWidth: 320 }}>
                  <span className="input-group-text bg-white border-0 text-muted">
                    <i className="feather-search" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search notices, dates, or programmes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="d-flex align-items-center gap-1.5 flex-wrap mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="btn btn-sm rounded-pill px-3 py-1 fw-semibold"
                style={{
                  fontSize: '0.73rem',
                  background: selectedCategory === 'all' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                  color: selectedCategory === 'all' ? '#0f172a' : '#e2e8f0',
                  border: 'none',
                }}
              >
                All Notices ({allNotices.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="btn btn-sm rounded-pill px-3 py-1 fw-medium"
                  style={{
                    fontSize: '0.73rem',
                    background: selectedCategory === cat ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                    color: selectedCategory === cat ? '#0f172a' : '#e2e8f0',
                    border: 'none',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-4">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
              <span className="text-muted small">Loading official notices...</span>
            </div>
          ) : (
            <div className="row g-3">
              {filtered.map((item) => (
                <div className="col-lg-4 col-md-6 d-flex" key={item.id}>
                  <div className="card border-0 shadow-sm rounded-4 w-100 d-flex flex-column justify-content-between bg-white overflow-hidden">
                    <div>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-100"
                        style={{ height: 150, objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/img/course/course-01.jpg';
                        }}
                      />
                      <div className="p-3">
                        <div className="d-flex align-items-center justify-content-between mb-1.5">
                          <span className="badge bg-primary-subtle text-primary rounded-pill" style={{ fontSize: '0.68rem' }}>
                            {item.category}
                          </span>
                          <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                            <i className="isax isax-calendar-1 me-1" />
                            {item.date}
                          </small>
                        </div>
                        <h6 className="fw-bold text-dark mb-1.5" style={{ fontSize: '0.93rem', lineHeight: 1.35 }}>
                          <Link to={item.link} className="text-dark text-decoration-none">
                            {item.title}
                          </Link>
                        </h6>
                        <p className="text-muted small mb-0" style={{ fontSize: '0.79rem', lineHeight: 1.5 }}>
                          {item.summary}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-2.5 bg-light border-top d-flex align-items-center justify-content-between">
                      <span className="small text-muted text-truncate" style={{ fontSize: '0.73rem', maxWidth: '68%' }}>
                        {item.author}
                      </span>
                      <Link
                        to={item.link}
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                        style={{ fontSize: '0.73rem' }}
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogGrid;
