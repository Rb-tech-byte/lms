import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { instructorService, InstructorEarningsData } from '../../../core/api/instructorService';
import {
  KpiCard,
  KpiGrid,
  SectionCard,
  FilterPills,
  LoadingState,
  exportToCsv,
} from '../common/instructorUi';

const InstructorEarning: React.FC = () => {
  const [earnings, setEarnings] = useState<InstructorEarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('all');

  useEffect(() => {
    instructorService.fetchEarnings().then((data) => {
      setEarnings(data);
      setLoading(false);
    });
  }, []);

  const formatTZS = (n: number) =>
    `TZS ${(n || 0).toLocaleString()}`;

  const handleExport = () => {
    if (!earnings) return;
    exportToCsv(
      'OUT_Faculty_Earnings_Report',
      earnings.byCourse.map((c) => ({
        Course: c.course,
        Enrolled_Scholars: c.enrolled,
        Gross_Revenue: `TZS ${c.gross.toLocaleString()}`,
        Faculty_Net_70Pct: `TZS ${c.facultyNet.toLocaleString()}`,
      }))
    );
  };

  return (
    <div className="ins-page">
      {/* KPI Overview */}
      <KpiGrid>
        <KpiCard
          label="Total Gross Tuition"
          value={formatTZS(earnings?.grossRevenue || 14850000)}
          hint="From accredited enrollments"
          icon="isax isax-wallet-25"
          tone="primary"
        />
        <KpiCard
          label="Faculty Honorarium (70%)"
          value={formatTZS(earnings?.netHonorarium || 10395000)}
          hint="OUT Faculty Statutory Allocation"
          icon="isax isax-money-recive5"
          tone="success"
        />
        <KpiCard
          label="Disbursed To Date"
          value={formatTZS(earnings?.paidOut || 7500000)}
          hint="Bank & Mobile Money Payouts"
          icon="isax isax-tick-circle5"
          tone="info"
        />
        <KpiCard
          label="Available For Payout"
          value={formatTZS(earnings?.availableBalance || 2895000)}
          hint="Ready for immediate withdrawal"
          icon="isax isax-coin-15"
          tone="warning"
        />
      </KpiGrid>

      {/* Main Breakdown Card */}
      <SectionCard
        title="Faculty Tuition Allocation & Honoraria Breakdown"
        subtitle="Departmental revenue sharing agreement (70% Academic Faculty / 30% Institutional Infrastructure)"
        actions={
          <div className="d-flex align-items-center gap-2">
            <button type="button" className="ins-btn ins-btn-ghost" onClick={handleExport}>
              <i className="feather-download" /> Export Report
            </button>
            <Link to={all_routes.instructorPayout} className="ins-btn ins-btn-primary">
              <i className="feather-arrow-up-right me-1" /> Request Payout
            </Link>
          </div>
        }
      >
        {/* Filters */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <FilterPills
            value={periodFilter}
            onChange={setPeriodFilter}
            options={[
              { value: 'all', label: 'All Semesters' },
              { value: 'q4', label: 'Semester 2 (Jul - Oct 2024)' },
              { value: 'q3', label: 'Semester 1 (Jan - Jun 2024)' },
            ]}
          />
        </div>

        {loading ? (
          <LoadingState text="Loading fiscal revenue allocation..." />
        ) : (
          <div className="row g-4">
            {/* Monthly Trend Table */}
            <div className="col-lg-5">
              <div className="p-3 border rounded-3 bg-light-subtle h-100">
                <h6 className="fw-bold text-dark mb-3">
                  <i className="feather-calendar me-1 text-primary" /> Monthly Honorarium Allocation
                </h6>
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0" style={{ fontSize: 13 }}>
                    <thead>
                      <tr className="text-muted">
                        <th>Billing Cycle</th>
                        <th className="text-end">Gross Collected</th>
                        <th className="text-end">Faculty Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(earnings?.monthly || []).map((m, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold text-dark">{m.month}</td>
                          <td className="text-end text-muted">{formatTZS(m.gross)}</td>
                          <td className="text-end fw-bold text-primary">{formatTZS(m.facultyShare)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Course-by-Course Contribution */}
            <div className="col-lg-7">
              <div className="p-3 border rounded-3 bg-white h-100">
                <h6 className="fw-bold text-dark mb-3">
                  <i className="feather-book-open me-1 text-primary" /> Programme Revenue Contribution
                </h6>
                <div className="table-responsive">
                  <table className="table ins-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Accredited Programme</th>
                        <th>Scholars</th>
                        <th>Gross Collected</th>
                        <th className="text-end">Faculty Net (70%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(earnings?.byCourse || []).map((c, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="fw-bold text-dark" style={{ fontSize: 13.5 }}>
                              {c.course}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark fw-bold">
                              {c.enrolled} Scholars
                            </span>
                          </td>
                          <td>
                            <span className="text-muted" style={{ fontSize: 12.5 }}>
                              {formatTZS(c.gross)}
                            </span>
                          </td>
                          <td className="text-end">
                            <span className="badge bg-success-subtle text-success fw-bold px-2 py-1" style={{ fontSize: 13 }}>
                              {formatTZS(c.facultyNet)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default InstructorEarning;
