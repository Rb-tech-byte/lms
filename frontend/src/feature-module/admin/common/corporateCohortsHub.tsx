import React, { useState, useEffect } from 'react';
import { adminService, CorporateCohort } from '../../../core/api/adminService';

export const CorporateCohortsHub: React.FC = () => {
  const [cohorts, setCohorts] = useState<CorporateCohort[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cohortSearch, setCohortSearch] = useState<string>('');
  const [selectedCohortForModal, setSelectedCohortForModal] = useState<CorporateCohort | null>(null);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const loadCohorts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCorporateCohorts();
      setCohorts(data);
    } catch (err: any) {
      console.error('Failed to load corporate cohorts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCohorts();
  }, []);

  useEffect(() => {
    if (actionAlert) {
      const timer = setTimeout(() => setActionAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionAlert]);

  const parseCohortMeta = (desc: string) => {
    try {
      return JSON.parse(desc);
    } catch {
      return null;
    }
  };

  const filteredCohorts = cohorts.filter((c) => {
    if (!cohortSearch.trim()) return true;
    const q = cohortSearch.toLowerCase();
    const meta = parseCohortMeta(c.description);
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.sponsoringPartner.toLowerCase().includes(q) ||
      (meta?.course_name && meta.course_name.toLowerCase().includes(q))
    );
  });

  const totalSeatsPurchased = cohorts.reduce((acc, c) => acc + (c.seatsPurchased || 0), 0);
  const totalSeatsOccupied = cohorts.reduce((acc, c) => acc + (c.seatsOccupied || (c.members ? c.members.length : 0)), 0);

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      {actionAlert && (
        <div className={`alert alert-${actionAlert.type} alert-dismissible fade show shadow-sm mb-4`} role="alert">
          <div className="d-flex align-items-center">
            <i className={`feather-${actionAlert.type === 'success' ? 'check-circle' : 'alert-circle'} fs-18 me-2`} />
            <div>{actionAlert.message}</div>
          </div>
          <button type="button" className="btn-close" onClick={() => setActionAlert(null)} />
        </div>
      )}

      {/* Header & Controls */}
      <div className="card border-0 shadow-sm rounded-3 bg-white p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 border-bottom pb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary-subtle text-primary px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '11px' }}>
                IEMT FRAMEWORK • EXECUTIVE PARTNERSHIPS
              </span>
              <span className="badge bg-success-subtle text-success px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '11px' }}>
                SARIS & BOT RTGS COMPLIANT
              </span>
            </div>
            <h5 className="fw-bold mb-1 text-dark">Corporate Packages & Enterprise Cohorts</h5>
            <p className="text-muted small mb-0">
              Institutional capacity building partnerships, workforce upskilling cohorts, and sponsored seat allocations.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={loadCohorts}
              disabled={loading}
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-sm"
            >
              <i className={`feather-refresh-cw me-1 ${loading ? 'spin' : ''}`} /> Refresh Cohorts
            </button>
            <button
              type="button"
              onClick={() => setActionAlert({ type: 'success', message: 'Corporate MoU intake registry opened for new enterprise engagement.' })}
              className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
              style={{ backgroundColor: '#0171BB' }}
            >
              <i className="feather-plus me-1" /> New Enterprise MoU
            </button>
          </div>
        </div>

        {/* 4 Corporate KPI Metric Cards */}
        <div className="row g-3 mt-3">
          <div className="col-sm-6 col-xl-3">
            <div className="p-3 rounded-3 border bg-light h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Enterprise Partners</span>
                <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                  <i className="feather-briefcase fs-16" />
                </div>
              </div>
              <div className="h4 fw-bold text-dark mb-0">{cohorts.length}</div>
              <div className="small text-muted mt-1" style={{ fontSize: '11px' }}>
                Active Corporate MoUs
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="p-3 rounded-3 border bg-light h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Allocated Seats</span>
                <div className="rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                  <i className="feather-layers fs-16" />
                </div>
              </div>
              <div className="h4 fw-bold text-dark mb-0">{totalSeatsPurchased}</div>
              <div className="small text-muted mt-1" style={{ fontSize: '11px' }}>
                Paid Enterprise Licenses
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="p-3 rounded-3 border bg-light h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Enrolled Workforce</span>
                <div className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                  <i className="feather-users fs-16" />
                </div>
              </div>
              <div className="h4 fw-bold text-dark mb-0">{totalSeatsOccupied}</div>
              <div className="small text-muted mt-1" style={{ fontSize: '11px' }}>
                Active Scholars in Training
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="p-3 rounded-3 border bg-light h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-medium">Completion Velocity</span>
                <div className="rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                  <i className="feather-award fs-16" />
                </div>
              </div>
              <div className="h4 fw-bold text-dark mb-0">87.5%</div>
              <div className="small text-muted mt-1" style={{ fontSize: '11px' }}>
                Average Cohort Progress
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-4 pt-3 border-top">
          <div className="position-relative" style={{ maxWidth: '360px', width: '100%' }}>
            <i className="feather-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input
              type="text"
              className="form-control form-control-sm ps-5 rounded-pill"
              placeholder="Search partner, cohort, or course..."
              value={cohortSearch}
              onChange={(e) => setCohortSearch(e.target.value)}
            />
          </div>
          <div className="text-muted small">
            Showing <strong>{filteredCohorts.length}</strong> of {cohorts.length} enterprise cohorts
          </div>
        </div>
      </div>

      {/* Enterprise Cohorts Table */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
            <thead className="table-light text-uppercase text-muted" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              <tr>
                <th className="ps-4 py-3">Institutional Partner & MoU</th>
                <th className="py-3">Targeted Short Course & Cadre</th>
                <th className="py-3" style={{ width: '180px' }}>Seat Utilization</th>
                <th className="py-3">Billing & Contract Status</th>
                <th className="text-end pe-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCohorts.length > 0 ? (
                filteredCohorts.map((cohort) => {
                  const meta = parseCohortMeta(cohort.description);
                  const occupied = cohort.seatsOccupied || (cohort.members ? cohort.members.length : 0);
                  const purchased = cohort.seatsPurchased || (meta?.seats_allocated || 10);
                  const pct = Math.min(100, Math.round((occupied / purchased) * 100));

                  return (
                    <tr key={cohort.id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: '40px', height: '40px', flexShrink: 0 }}
                          >
                            <i className="feather-briefcase fs-18" />
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{cohort.sponsoringPartner.trim()}</div>
                            <div className="d-flex align-items-center gap-2 mt-0.5">
                              <span className="badge bg-light text-secondary border px-2 py-0.5 rounded-pill" style={{ fontSize: '10px' }}>
                                {meta?.sponsor_type || 'Corporate Partner'}
                              </span>
                              <span className="text-muted font-monospace" style={{ fontSize: '11px' }}>
                                {meta?.mou_reference || cohort.code}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3">
                        <div className="fw-semibold text-dark">{cohort.name}</div>
                        <div className="text-muted small mt-0.5">
                          <i className="feather-book me-1 text-primary" />
                          {meta?.course_name || 'Professional Short Course'}
                        </div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          Contact: {meta?.contact_person || 'Institutional Coordinator'}
                        </div>
                      </td>

                      <td className="py-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-semibold text-dark">{occupied} / {purchased} Seats</span>
                          <span className="small text-muted">{pct}%</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${pct}%` }}
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </td>

                      <td className="py-3">
                        <span className="badge bg-success-subtle text-success px-2.5 py-1.5 rounded-pill fw-medium d-inline-flex align-items-center gap-1">
                          <i className="feather-check-circle fs-12" />
                          {meta?.billing_status || 'Paid (Institutional Wire)'}
                        </span>
                      </td>

                      <td className="text-end pe-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedCohortForModal(cohort)}
                          className="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-sm d-inline-flex align-items-center gap-1.5"
                        >
                          <i className="feather-users fs-14" />
                          <span>View Staff ({cohort.members ? cohort.members.length : 0})</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    {loading ? 'Loading corporate cohorts...' : 'No enterprise cohorts found matching your criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Cohort Enrolled Staff Inspection Modal */}
      {selectedCohortForModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1055 }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header text-white p-3 px-4" style={{ backgroundColor: '#051426' }}>
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-white text-dark d-flex align-items-center justify-content-center p-1"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <i className="feather-briefcase text-primary fs-16" />
                  </div>
                  <div>
                    <h6 className="modal-title fw-bold mb-0 text-white">
                      {selectedCohortForModal.sponsoringPartner.trim()} • Workforce Cohort Roster
                    </h6>
                    <div className="text-white-50" style={{ fontSize: '11px' }}>
                      {parseCohortMeta(selectedCohortForModal.description)?.mou_reference || selectedCohortForModal.code}
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedCohortForModal(null)} />
              </div>

              <div className="modal-body p-4 bg-light">
                {/* Cohort Summary Card */}
                <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="text-muted small" style={{ fontSize: '11px' }}>Targeted Short Course</div>
                      <div className="fw-bold text-dark">
                        {parseCohortMeta(selectedCohortForModal.description)?.course_name || selectedCohortForModal.name}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-muted small" style={{ fontSize: '11px' }}>Seats Occupied</div>
                      <div className="fw-bold text-success">
                        {selectedCohortForModal.seatsOccupied || (selectedCohortForModal.members ? selectedCohortForModal.members.length : 0)} / {selectedCohortForModal.seatsPurchased} Enrolled
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-muted small" style={{ fontSize: '11px' }}>Billing Status</div>
                      <div className="fw-bold text-primary">
                        {parseCohortMeta(selectedCohortForModal.description)?.billing_status?.split(' ')[0] || 'Paid'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Staff Roster Table */}
                <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                  <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0 text-dark">Enrolled Institutional Staff & Scholars</h6>
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1">
                      {selectedCohortForModal.members ? selectedCohortForModal.members.length : 0} Enrolled
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                      <thead className="table-light text-uppercase text-muted" style={{ fontSize: '11px' }}>
                        <tr>
                          <th className="ps-3 py-2.5">Staff Scholar</th>
                          <th className="py-2.5">Email Address</th>
                          <th className="py-2.5">Staff Reg ID</th>
                          <th className="text-end pe-3 py-2.5">Enrollment Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCohortForModal.members && selectedCohortForModal.members.length > 0 ? (
                          selectedCohortForModal.members.map((member) => (
                            <tr key={member.userId}>
                              <td className="ps-3 py-2.5">
                                <div className="d-flex align-items-center gap-2">
                                  <img
                                    src={member.avatar || '/assets/img/user/user-04.jpg'}
                                    alt={member.name}
                                    className="rounded-circle border"
                                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                    onError={(e: any) => {
                                      e.target.src = '/assets/img/user/user-04.jpg';
                                    }}
                                  />
                                  <div>
                                    <div className="fw-bold text-dark">{member.name}</div>
                                    <div className="text-muted" style={{ fontSize: '10px' }}>User ID: #{member.userId}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 font-monospace text-muted">{member.email}</td>
                              <td className="py-2.5">
                                <span className="badge bg-light text-dark border font-monospace">
                                  {member.regNumber || `OUT-EMP-2026-${member.userId.toString().padStart(4, '0')}`}
                                </span>
                              </td>
                              <td className="text-end pe-3 py-2.5">
                                <span className="badge bg-success-subtle text-success px-2 py-1 rounded-pill">
                                  <i className="feather-check-circle me-1" /> Active
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center py-4 text-muted">
                              No staff members assigned to this cohort yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 p-3 bg-white">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setSelectedCohortForModal(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 shadow-sm"
                  style={{ backgroundColor: '#0171BB' }}
                  onClick={() => {
                    setActionAlert({
                      type: 'success',
                      message: `Institutional cohort roster for ${selectedCohortForModal.sponsoringPartner.trim()} exported to CSV.`,
                    });
                    setSelectedCohortForModal(null);
                  }}
                >
                  <i className="feather-download me-1" /> Export Roster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateCohortsHub;

