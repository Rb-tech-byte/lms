import React, { useEffect, useState } from 'react';
import { courseService } from '../../../../core/api/courseService';
import { useCmsConfig } from '../../../../core/api/cmsService';

const Counter: React.FC = () => {
  const { cms } = useCmsConfig();
  const [liveStats, setLiveStats] = useState<{
    totalScholars: number;
    totalCourses: number;
    totalFaculties: number;
    regionalCenters: number;
  } | null>(null);

  useEffect(() => {
    let active = true;
    courseService.getPublicCatalog().then((res) => {
      if (active && res?.stats) {
        setLiveStats(res.stats);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!cms.stats.visible) return null;

  const items = (cms.stats.items || []).map((item) => {
    if (liveStats) {
      if (item.id === 'stat-scholars') {
        return { ...item, value: liveStats.totalScholars.toLocaleString() };
      }
      if (item.id === 'stat-courses') {
        return { ...item, value: String(liveStats.totalCourses) };
      }
      if (item.id === 'stat-faculties') {
        return { ...item, value: String(liveStats.totalFaculties) };
      }
    }
    return item;
  });

  return (
    <section className="py-3" style={{ background: 'linear-gradient(180deg, #FFFDF2 0%, #F0F8FF 100%)', borderBottom: '2px solid #93C5FD' }}>
      <div className="container">
        <div className="row g-3">
          {items.map((stat, idx) => {
            const isGold = idx % 2 === 1;
            return (
              <div key={stat.id} className="col-lg-3 col-sm-6">
                <div
                  className="card shadow-sm h-100"
                  style={{
                    borderRadius: '12px',
                    border: '1.5px solid #93C5FD',
                    borderTop: '3px solid #0171BB',
                    borderBottom: '3px solid #FFD200',
                    borderLeft: `5px solid ${isGold ? '#FFD200' : '#0171BB'}`,
                  }}
                >
                  <div className="card-body p-3 d-flex align-items-center justify-content-between">
                    <div>
                      <div
                        className="text-uppercase fw-bold mb-1"
                        style={{ fontSize: '11px', color: '#0171BB', letterSpacing: '0.03em' }}
                      >
                        {stat.label}
                      </div>
                      <div className="d-flex align-items-baseline gap-2">
                        <span className="fw-bold" style={{ fontSize: '22px', color: '#003B66' }}>
                          {stat.value}
                        </span>
                        <span
                          className="badge rounded-pill px-2 py-0 fw-bold"
                          style={{
                            background: '#FFD200',
                            color: '#003B66',
                            fontSize: '10.5px',
                          }}
                        >
                          {stat.badge}
                        </span>
                      </div>
                    </div>
                    <div
                      className="rounded-3 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '42px',
                        height: '42px',
                        background: isGold ? '#FFFDE7' : '#E8F4FC',
                        border: `1.5px solid ${isGold ? '#FFD200' : '#0171BB'}`,
                        color: '#0171BB',
                      }}
                    >
                      <i className={`isax ${stat.icon || 'isax-award'} fs-20`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Counter;
