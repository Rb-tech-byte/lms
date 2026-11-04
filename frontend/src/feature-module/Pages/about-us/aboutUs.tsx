import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import {
  courseService,
  PublicCatalogCategory,
  PublicInstructor,
} from '../../../core/api/courseService';
import { useCmsConfig } from '../../../core/api/cmsService';

const AboutUs: React.FC = () => {
  const routes = all_routes;
  const { cms } = useCmsConfig();
  const [categories, setCategories] = useState<PublicCatalogCategory[]>([]);
  const [instructors, setInstructors] = useState<PublicInstructor[]>([]);
  const [stats, setStats] = useState({
    totalScholars: 14820,
    totalCourses: 3,
    totalFaculties: 5,
    regionalCenters: 30,
    satisfactionRate: '99.2%',
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([courseService.getPublicCatalog(), courseService.getPublicInstructors()])
      .then(([catRes, instRes]) => {
        if (!mounted) return;
        setCategories(catRes.categories || []);
        setInstructors(instRes || []);
        if (catRes.stats) {
          setStats({
            totalScholars: catRes.stats.totalScholars,
            totalCourses: catRes.stats.totalCourses,
            totalFaculties: catRes.stats.totalFaculties,
            regionalCenters: catRes.stats.regionalCenters,
            satisfactionRate: catRes.stats.satisfactionRate,
          });
        }
      })
      .catch(() => null);
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ background: '#f8fafc', minHeight: '82vh' }}>
      {/* Compact Native Hero Card */}
      <section
        className="py-4"
        style={{
          background: 'linear-gradient(135deg, #005B97 0%, #0171BB 55%, #0082D6 100%)',
          borderBottom: '3px solid #FFD200',
        }}
      >
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span
                className="badge rounded-pill px-3 py-1 fw-bold mb-2"
                style={{ background: '#FFD200', color: '#051426', fontSize: '0.72rem' }}
              >
                {cms.sections?.capabilities?.eyebrow || 'NATIONAL OPEN & DISTANCE UNIVERSITY'}
              </span>
              <h1 className="fw-bold text-white mb-2" style={{ fontSize: 'clamp(1.4rem, 2.4vw, 1.95rem)' }}>
                {cms.sections?.capabilities?.title || 'Empowering Scholars Across East Africa Through Flexible Higher Education'}
              </h1>
              <p className="mb-0" style={{ color: '#cbd5e1', fontSize: '0.9rem', maxWidth: 680 }}>
                {cms.sections?.capabilities?.subtitle ||
                  'Established by Act of Parliament No. 17 of 1992, the Open University of Tanzania provides accredited degree, diploma, and research programmes across 30 regional centres.'}
              </p>
            </div>
            <div className="col-lg-4">
              <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                <Link to={routes.courseGrid} className="btn btn-warning btn-sm rounded-pill px-3.5 py-2 fw-bold" style={{ color: '#0f172a' }}>
                  Explore Programmes
                </Link>
                <Link to={routes.contactUs} className="btn btn-outline-light btn-sm rounded-pill px-3.5 py-2 fw-semibold">
                  Contact Helpdesk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Metrics Strip */}
      <section className="py-4">
        <div className="container">
          <div className="row g-3 mb-4">
            {[
              { label: 'Active Scholars', value: stats.totalScholars.toLocaleString() + '+', icon: 'isax-profile-2user', color: '#0171BB' },
              { label: 'Accredited Faculties', value: String(stats.totalFaculties), icon: 'isax-buildings-2', color: '#059669' },
              { label: 'Regional Study Centres', value: String(stats.regionalCenters), icon: 'isax-location', color: '#d97706' },
              { label: 'Scholar Satisfaction', value: stats.satisfactionRate, icon: 'isax-verify', color: '#7c3aed' },
            ].map((item) => (
              <div className="col-lg-3 col-sm-6" key={item.label}>
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row align-items-center gap-3">
                  <span
                    className="rounded-3 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 46, height: 46, background: `${item.color}15`, color: item.color }}
                  >
                    <i className={`isax ${item.icon} fs-4`} />
                  </span>
                  <div>
                    <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.25rem' }}>
                      {item.value}
                    </h4>
                    <small className="text-muted" style={{ fontSize: '0.76rem' }}>
                      {item.label}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Core Pillars from CMS */}
          <div className="row g-3 mb-4">
            {(cms.sections?.capabilities?.cards || []).map((pillar: any, idx: number) => (
              <div className="col-lg-3 col-md-6 d-flex" key={idx}>
                <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white w-100">
                  <div className="p-3">
                    <span
                      className="rounded-3 d-inline-flex align-items-center justify-content-center mb-2.5"
                      style={{ width: 40, height: 40, background: '#eff6ff', color: '#0171BB' }}
                    >
                      <i className={`isax ${pillar.icon || 'isax-award'} fs-5`} />
                    </span>
                    <h6 className="fw-bold text-dark mb-1.5" style={{ fontSize: '0.94rem' }}>
                      {pillar.title}
                    </h6>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Faculties + Academic Leadership */}
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold text-dark mb-0">Academic Faculties & Schools</h6>
                  <Link to={routes.courseCategory} className="btn btn-sm btn-light text-primary rounded-pill px-3" style={{ fontSize: '0.75rem' }}>
                    View All
                  </Link>
                </div>
                <div className="d-flex flex-column gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`${routes.courseCategory}?id=${cat.id}`}
                      className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-light text-decoration-none"
                    >
                      <span className="fw-semibold text-dark small">{cat.name}</span>
                      <span className="badge bg-white text-primary border rounded-pill">
                        {cat.coursecount} Courses
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold text-dark mb-0">Senior Academic Senate & Lecturers</h6>
                  <Link to={routes.instructorGrid} className="btn btn-sm btn-light text-primary rounded-pill px-3" style={{ fontSize: '0.75rem' }}>
                    Directory
                  </Link>
                </div>
                <div className="d-flex flex-column gap-2.5">
                  {instructors.slice(0, 4).map((inst) => (
                    <Link
                      key={inst.id}
                      to={`${routes.instructorDetails}?id=${inst.id}`}
                      className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light text-decoration-none"
                    >
                      <div className="d-flex align-items-center gap-2.5">
                        <img
                          src={inst.avatar}
                          alt={inst.fullname}
                          className="rounded-circle"
                          style={{ width: 38, height: 38, objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/img/user/user-01.jpg';
                          }}
                        />
                        <div>
                          <div className="fw-bold text-dark" style={{ fontSize: '0.84rem' }}>
                            {inst.fullname}
                          </div>
                          <small className="text-muted" style={{ fontSize: '0.73rem' }}>
                            {inst.role}
                          </small>
                        </div>
                      </div>
                      <span className="badge bg-white text-secondary border rounded-pill" style={{ fontSize: '0.7rem' }}>
                        {inst.studentCount} Scholars
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
