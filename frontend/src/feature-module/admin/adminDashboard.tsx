import React from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from './common/adminSidebar';
import { all_routes } from '../router/all_routes';

const AdminDashboard = () => {
  const route = all_routes;

  const stats = [
    { title: 'Total Enrolled Students', count: '14,820', change: '+12.5%', isUp: true, icon: 'isax isax-profile-2user', color: 'primary' },
    { title: 'Active Instructors', count: '342', change: '+8 this month', isUp: true, icon: 'isax isax-teacher', color: 'secondary' },
    { title: 'Published Courses', count: '215', change: '14 pending review', isUp: false, icon: 'isax isax-book-1', color: 'success' },
    { title: 'Platform Tuition / Revenue', count: 'TZS 184.5M', change: '82% of Semester Target', isUp: true, icon: 'isax isax-wallet-2', color: 'info' },
  ];

  const pendingApprovals = [
    { title: 'Advanced Machine Learning & AI with Python', instructor: 'Dr. Amina Kilindo', category: 'Computer Science', date: 'Oct 28, 2026', students: 85 },
    { title: 'Public Health in Sub-Saharan Africa', instructor: 'Prof. Joseph Mzava', category: 'Health Sciences', date: 'Oct 29, 2026', students: 120 },
    { title: 'East African Commercial Law & Regulations', instructor: 'Adv. Fatma Rashid', category: 'Law', date: 'Oct 30, 2026', students: 64 },
    { title: 'Educational Technology & Distance Learning', instructor: 'Dr. Charles Mkenda', category: 'Education', date: 'Oct 31, 2026', students: 95 },
  ];

  return (
    <div className="page-content">
      <div className="container">
        {/* Breadcrumb */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h3 className="fw-bold text-dark mb-1">OUT LMS Administrator Portal</h3>
                <p className="text-muted mb-0">Open University of Tanzania • System-wide Overview & Academic Control</p>
              </div>
              <div className="d-flex gap-2">
                <Link to={route.courseCategory} className="btn btn-outline-primary btn-sm">
                  <i className="isax isax-category me-1" /> Manage Categories
                </Link>
                <Link to={route.addNewCourse} className="btn btn-primary btn-sm">
                  <i className="isax isax-add me-1" /> New Course
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Admin Sidebar */}
          <AdminSidebar />

          {/* Main Dashboard Content */}
          <div className="col-lg-9">
            {/* Stat Cards */}
            <div className="row g-3 mb-4">
              {stats.map((s, idx) => (
                <div key={idx} className="col-md-6 col-xl-3">
                  <div className="card h-100 border-0 shadow-sm p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted fs-13 fw-medium">{s.title}</span>
                      <div className={`p-2 rounded-circle bg-${s.color}-transparent text-${s.color}`}>
                        <i className={`${s.icon} fs-18`} />
                      </div>
                    </div>
                    <h4 className="fw-bold mb-1">{s.count}</h4>
                    <small className={`fw-semibold ${s.isUp ? 'text-success' : 'text-warning'}`}>
                      {s.change}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Overview Tables */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="isax isax-verify text-primary me-2" />
                  Courses Pending Academic Board Approval
                </h5>
                <span className="badge bg-warning text-dark px-3 py-1">4 Pending</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Course Title</th>
                        <th>Instructor</th>
                        <th>Category</th>
                        <th>Submitted</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApprovals.map((c, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="fw-semibold text-dark">{c.title}</span>
                          </td>
                          <td>{c.instructor}</td>
                          <td>
                            <span className="badge bg-light text-dark border">{c.category}</span>
                          </td>
                          <td className="text-muted fs-13">{c.date}</td>
                          <td className="text-end">
                            <button type="button" className="btn btn-sm btn-success me-2 px-3">
                              Approve
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-secondary px-2">
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* System Status Banner */}
            <div className="card bg-light border-0 p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h5 className="fw-bold text-dark mb-1">University Cloud Learning Environment</h5>
                  <p className="text-muted mb-0 fs-14">
                    All e-learning services, video streaming nodes, and examination servers are operating at 99.98% uptime.
                  </p>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <span className="badge bg-success px-3 py-2 fs-13">
                    <i className="isax isax-tick-circle me-1" /> Systems Normal
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
