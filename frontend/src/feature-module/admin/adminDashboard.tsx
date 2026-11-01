import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from './common/adminSidebar';
import { all_routes } from '../router/all_routes';
import {
  adminService,
  PlatformTelemetry,
  UniversityUserRecord,
  AuditLedgerRecord,
  SystemHealthRecord,
} from '../../core/api/adminService';

const AdminDashboard: React.FC = () => {
  const route = all_routes;
  const [telemetry, setTelemetry] = useState<PlatformTelemetry>({
    totalStudents: 14820,
    activeInstructors: 342,
    publishedCourses: 3,
    totalTuitionTzs: 'TZS 184,500,000',
    pesapalTransactionsCount: 1248,
    systemUptime: '99.98%',
  });
  const [users, setUsers] = useState<UniversityUserRecord[]>([]);
  const [ledger, setLedger] = useState<AuditLedgerRecord[]>([]);
  const [health, setHealth] = useState<SystemHealthRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'ledger' | 'health'>('users');

  useEffect(() => {
    let isMounted = true;
    const loadAdminData = async () => {
      try {
        const [tData, uData, lData, hData] = await Promise.all([
          adminService.getPlatformStats(),
          adminService.getUniversityUsers(),
          adminService.getAuditLedger(),
          adminService.getSystemHealth(),
        ]);
        if (isMounted) {
          setTelemetry(tData);
          setUsers(uData);
          setLedger(lData);
          setHealth(hData);
        }
      } catch (err) {
        console.error("Failed to load admin telemetry", err);
      }
    };
    loadAdminData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="page-content py-4">
      <div className="container">
        {/* Header Banner */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="rounded-4 p-4 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #0d3b66 0%, #028090 100%)", color: "#ffffff" }}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-warning text-dark px-3 py-1 fw-bold">
                      Senate & Registrar Directorate
                    </span>
                    <span className="badge bg-white-50 text-white px-2 py-1">
                      Moodle 5.x Backend
                    </span>
                  </div>
                  <h3 className="fw-bold text-white mb-1">OUT LMS Administrator & Registrar Portal</h3>
                  <p className="text-white-50 mb-0 fs-14">
                    The Open University of Tanzania • Unified Governance, Audit Ledger & System Telemetry
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <Link to={route.courseCategory} className="btn btn-outline-light rounded-pill btn-sm px-3">
                    <i className="isax isax-category me-1" /> Faculties
                  </Link>
                  <Link to={route.addNewCourse} className="btn btn-warning text-dark fw-bold rounded-pill btn-sm px-3 shadow-sm">
                    <i className="isax isax-add me-1" /> New Course
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Admin Sidebar */}
          <AdminSidebar />

          {/* Main Content Area */}
          <div className="col-lg-9">
            {/* Stat Cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted fs-13 fw-medium">Total Scholars</span>
                    <div className="p-2 rounded-circle bg-primary-subtle text-primary">
                      <i className="isax isax-profile-2user fs-18" />
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1">{telemetry.totalStudents.toLocaleString()}</h4>
                  <small className="fw-semibold text-success">+12.5% vs. Last Semester</small>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted fs-13 fw-medium">Academic Staff</span>
                    <div className="p-2 rounded-circle bg-info-subtle text-info">
                      <i className="isax isax-teacher fs-18" />
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1">{telemetry.activeInstructors} Lecturers</h4>
                  <small className="fw-semibold text-info">3 Faculties Connected</small>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted fs-13 fw-medium">Active Courses</span>
                    <div className="p-2 rounded-circle bg-success-subtle text-success">
                      <i className="isax isax-book-1 fs-18" />
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1">{telemetry.publishedCourses} Courses</h4>
                  <small className="fw-semibold text-success">All Published in Moodle</small>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted fs-13 fw-medium">Tuition Revenue</span>
                    <div className="p-2 rounded-circle bg-warning-subtle text-warning">
                      <i className="isax isax-wallet-2 fs-18" />
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1">{telemetry.totalTuitionTzs}</h4>
                  <small className="fw-semibold text-success">Pesapal 3.0 Real-time</small>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom p-3">
                <ul className="nav nav-pills gap-2">
                  <li className="nav-item">
                    <button
                      className={`btn btn-sm rounded-pill px-4 ${activeTab === 'users' ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => setActiveTab('users')}
                    >
                      <i className="isax isax-user-tag me-1" />
                      University User Directory ({users.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`btn btn-sm rounded-pill px-4 ${activeTab === 'ledger' ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => setActiveTab('ledger')}
                    >
                      <i className="isax isax-receipt-2 me-1" />
                      Pesapal Reconciliation Ledger ({ledger.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`btn btn-sm rounded-pill px-4 ${activeTab === 'health' ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => setActiveTab('health')}
                    >
                      <i className="isax isax-health me-1" />
                      System Health & Nodes ({health.length})
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body p-0">
                {/* 1. User Directory Table */}
                {activeTab === 'users' && (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>User / Academic Scholar</th>
                          <th>Role</th>
                          <th>Registration / Staff ID</th>
                          <th>Department / Faculty</th>
                          <th>Status</th>
                          <th>Last Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div
                                  className={`avatar avatar-md rounded-circle me-3 d-flex align-items-center justify-content-center text-white fw-bold ${
                                    u.role === 'Administrator' ? 'bg-danger' : u.role === 'Instructor' ? 'bg-primary' : 'bg-success'
                                  }`}
                                  style={{ width: "40px", height: "40px" }}
                                >
                                  {u.fullname.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-0 fs-14 text-dark">{u.fullname}</h6>
                                  <span className="text-muted small" style={{ fontSize: "11px" }}>{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  u.role === 'Administrator'
                                    ? 'bg-danger-subtle text-danger border border-danger'
                                    : u.role === 'Instructor'
                                    ? 'bg-primary-subtle text-primary border border-primary'
                                    : 'bg-success-subtle text-success border border-success'
                                } px-3 py-1`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">{u.regNumber || 'N/A'}</span>
                            </td>
                            <td className="text-muted small">{u.department}</td>
                            <td>
                              <span className="badge bg-success-subtle text-success px-2 py-1">
                                <i className="isax isax-tick-circle me-1" />
                                {u.status}
                              </span>
                            </td>
                            <td className="text-muted small">{u.lastAccess}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 2. Pesapal IPN Ledger */}
                {activeTab === 'ledger' && (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Order Tracking ID</th>
                          <th>Scholar</th>
                          <th>Course</th>
                          <th>Tuition Paid</th>
                          <th>Payment Gateway</th>
                          <th>Status</th>
                          <th>Audit Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.map((item) => (
                          <tr key={item.trackingId}>
                            <td>
                              <code className="text-primary small fw-bold">
                                {item.trackingId.substring(0, 13)}...
                              </code>
                              <span className="d-block text-muted small" style={{ fontSize: "10px" }}>
                                Ref: {item.reference}
                              </span>
                            </td>
                            <td>
                              <span className="fw-bold text-dark fs-13">{item.studentName}</span>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border me-1">{item.courseCode}</span>
                              <span className="text-muted small d-block" style={{ fontSize: "11px" }}>{item.courseTitle}</span>
                            </td>
                            <td>
                              <span className="fw-bold text-dark fs-13">{item.amount}</span>
                            </td>
                            <td>
                              <span className="badge bg-info-subtle text-info border border-info px-2 py-1">
                                {item.method}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-success text-white px-2 py-1">
                                <i className="isax isax-tick-circle me-1" />
                                {item.status}
                              </span>
                            </td>
                            <td className="text-muted small">{item.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. System Health Matrix */}
                {activeTab === 'health' && (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Cluster Subsystem</th>
                          <th>Status</th>
                          <th>Response Latency</th>
                          <th>Operational Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {health.map((h, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className="fw-bold text-dark fs-14">{h.component}</span>
                            </td>
                            <td>
                              <span className="badge bg-success-subtle text-success border border-success px-3 py-1">
                                <i className="isax isax-tick-circle me-1" />
                                {h.status}
                              </span>
                            </td>
                            <td>
                              <code className="text-dark fw-bold">{h.latency}</code>
                            </td>
                            <td className="text-muted small">{h.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* University Governance Notice */}
            <div className="card bg-light border-0 p-4 rounded-3 shadow-sm">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <span className="avatar avatar-xl rounded-circle bg-dark text-white d-flex align-items-center justify-content-center">
                    <i className="isax isax-shield-tick fs-28" />
                  </span>
                  <div>
                    <h5 className="fw-bold text-dark mb-1">Open University of Tanzania Senate Regulations</h5>
                    <p className="text-muted small mb-0">
                      All course admissions, assessment submissions, and fee records conform to the Universities Act of Tanzania.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-dark rounded-pill px-4"
                  onClick={() => window.open('http://localhost/outlmstheme/moodle-backend/admin/index.php', '_blank')}
                >
                  <i className="isax isax-external-drive me-1" />
                  Moodle Admin Console
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
