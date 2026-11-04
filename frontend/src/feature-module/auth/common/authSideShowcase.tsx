import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { courseService } from '../../../core/api/courseService';

export const AuthBrandHeader: React.FC = () => {
  const route = all_routes;
  return (
    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
      <Link
        to={route.home}
        className="d-inline-flex align-items-center gap-2 text-decoration-none"
      >
        <img
          src="/assets/img/out-logo.png"
          alt="LMS"
          style={{ width: 36, height: 36, objectFit: 'contain' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span
          className="fw-bold"
          style={{
            fontSize: '1.25rem',
            letterSpacing: '-0.02em',
            color: '#071F38',
          }}
        >
          LMS
        </span>
        <span
          className="badge rounded-pill"
          style={{
            background: '#eff6ff',
            color: '#0171BB',
            fontSize: '0.68rem',
            fontWeight: 700,
          }}
        >
          PORTAL
        </span>
      </Link>

      <Link
        to={route.home}
        className="btn btn-sm btn-light rounded-pill px-3 py-1 fw-semibold text-secondary border"
        style={{ fontSize: '0.76rem' }}
      >
        <i className="isax isax-arrow-left-2 me-1" />
        Home
      </Link>
    </div>
  );
};

interface AuthSideShowcaseProps {
  badge?: string;
  headline?: string;
  subheadline?: string;
}

export const AuthSideShowcase: React.FC<AuthSideShowcaseProps> = ({
  badge = 'ACCREDITED DIGITAL UNIVERSITY CAMPUS',
  headline = 'Advance Your Degree & Career Through Flexible Digital Learning',
  subheadline = 'Access structured study units, interactive seminars, continuous assessments, and official academic records from anywhere across East Africa.',
}) => {
  const [stats, setStats] = useState({
    scholars: '14,820+',
    faculties: '5',
    centres: '30',
    rating: '99.2%',
  });

  useEffect(() => {
    let mounted = true;
    courseService
      .getPublicCatalog()
      .then((res) => {
        if (!mounted || !res?.stats) return;
        setStats({
          scholars: `${(res.stats.totalScholars || 14820).toLocaleString()}+`,
          faculties: String(res.stats.totalFaculties || 5),
          centres: String(res.stats.regionalCenters || 30),
          rating: res.stats.satisfactionRate || '99.2%',
        });
      })
      .catch(() => null);
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      className="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-4 p-xl-5 position-relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #005B97 0%, #0171BB 55%, #0082D6 100%)',
        color: '#ffffff',
        minHeight: '100vh',
      }}
    >
      {/* Top Institutional Tag */}
      <div className="d-flex align-items-center justify-content-between position-relative" style={{ zIndex: 2 }}>
        <div className="d-flex align-items-center gap-2">
          <span
            className="badge rounded-pill px-3 py-1.5 fw-bold"
            style={{
              background: 'rgba(245, 158, 11, 0.18)',
              color: '#fbbf24',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              fontSize: '0.7rem',
              letterSpacing: '0.04em',
            }}
          >
            {badge}
          </span>
        </div>
        <span
          className="badge rounded-pill px-2.5 py-1"
          style={{
            background: 'rgba(16, 185, 129, 0.18)',
            color: '#6ee7b7',
            fontSize: '0.7rem',
          }}
        >
          ● 2026/2027 Intake Active
        </span>
      </div>

      {/* Center Niche Academic SVG Illustration */}
      <div className="my-auto py-3 text-center position-relative" style={{ zIndex: 2 }}>
        <div className="mx-auto mb-3" style={{ maxWidth: 470 }}>
          <img
            src="/assets/img/auth/auth-1.svg"
            alt="University Digital Learning Portal"
            className="img-fluid"
            style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 16px 28px rgba(0,0,0,0.28))' }}
          />
        </div>

        <div className="mx-auto" style={{ maxWidth: 480 }}>
          <h2
            className="fw-bold text-white mb-2"
            style={{ fontSize: 'clamp(1.35rem, 2vw, 1.7rem)', lineHeight: 1.3 }}
          >
            {headline}
          </h2>
          <p className="mb-0" style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
            {subheadline}
          </p>
        </div>
      </div>

      {/* Bottom Live University Metrics Strip */}
      <div
        className="row g-2 pt-3 position-relative"
        style={{
          zIndex: 2,
          borderTop: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {[
          { label: 'Active Scholars', value: stats.scholars },
          { label: 'Faculties', value: stats.faculties },
          { label: 'Regional Centres', value: stats.centres },
          { label: 'Satisfaction', value: stats.rating },
        ].map((m) => (
          <div className="col-3 text-center" key={m.label}>
            <div className="fw-bold text-warning" style={{ fontSize: '1.05rem' }}>
              {m.value}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthSideShowcase;

