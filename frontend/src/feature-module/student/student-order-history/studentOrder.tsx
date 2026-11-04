import React, { useEffect, useState, useMemo } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import StudentSidebar from '../common/studentSidebar';
import ProfileCard from '../common/profileCard';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { useAuth } from '../../../core/auth/authContext';
import { paymentService, PaymentTransaction } from '../../../core/api/paymentService';

const PAGE_SIZE = 6;

const StudentOrder: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    try {
      const history = paymentService.getTransactionHistory(user?.id);
      if (mounted) {
        setTransactions(history || []);
      }
    } finally {
      if (mounted) setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesStatus =
        statusFilter === 'all' ||
        tx.status.toLowerCase() === statusFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.reference.toLowerCase().includes(q) ||
        tx.courseTitle.toLowerCase().includes(q) ||
        tx.channel.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [transactions, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, page]);

  return (
    <>
      <Breadcrumb title="Tuition Receipts & Enrollment Orders" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                    <div>
                      <h4 className="fw-bold text-dark mb-1">Tuition Receipts &amp; Payment History</h4>
                      <p className="text-muted small mb-0">
                        Official Pesapal &amp; Selcom transaction vouchers for tuition fees and examination registrations.
                      </p>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <div className="input-group input-group-sm" style={{ width: 240 }}>
                        <span className="input-group-text bg-white border-end-0">
                          <i className="feather-search text-muted" style={{ fontSize: 13 }} />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Search receipts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ fontSize: 13 }}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            className="btn btn-sm btn-white border border-start-0"
                            onClick={() => setSearchQuery('')}
                          >
                            <i className="feather-x" style={{ fontSize: 12 }} />
                          </button>
                        )}
                      </div>

                      <Link to={all_routes.pricePlanning} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                        Fee Schedule
                      </Link>
                    </div>
                  </div>

                  {/* Status Filter Tabs */}
                  <div className="d-flex flex-wrap align-items-center gap-1.5 mb-3">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'
                        }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      All Receipts ({transactions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('completed')}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${statusFilter === 'completed' ? 'btn-primary' : 'btn-outline-secondary'
                        }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      Completed ({transactions.filter((t) => t.status.toLowerCase() === 'completed').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('pending')}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${statusFilter === 'pending' ? 'btn-primary' : 'btn-outline-secondary'
                        }`}
                      style={{ fontSize: '0.78rem' }}
                    >
                      Pending ({transactions.filter((t) => t.status.toLowerCase() === 'pending').length})
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                      <span className="text-muted small">Loading payment ledger...</span>
                    </div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="text-muted mb-2">
                        <i className="feather-credit-card fs-36 text-muted" />
                      </div>
                      <h6 className="fw-semibold text-dark">No Payment Receipts on Record</h6>
                      <p className="text-muted small mb-3">
                        Tuition vouchers and invoices will appear here once you enrol in professional certificate courses.
                      </p>
                      <Link to={all_routes.courseGrid} className="btn btn-sm btn-primary rounded-pill px-4">
                        Browse Course Catalog
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              <th>Receipt Reference</th>
                              <th>Course Programme</th>
                              <th>Date</th>
                              <th>Amount Paid</th>
                              <th>Channel</th>
                              <th>Status</th>
                              <th className="text-end">Receipt</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedTransactions.map((tx) => (
                              <tr key={tx.reference}>
                                <td>
                                  <code className="text-primary fw-bold fs-13">{tx.reference}</code>
                                </td>
                                <td>
                                  <span className="fw-medium text-dark fs-13 d-block">
                                    {tx.courseTitle}
                                  </span>
                                  <small className="text-muted">Moodle Tuition Payment</small>
                                </td>
                                <td>
                                  <span className="small text-muted">
                                    {new Date(tx.timestamp).toLocaleDateString()}
                                  </span>
                                </td>
                                <td>
                                  <span className="fw-bold text-dark fs-13">
                                    {tx.currency} {tx.amount.toLocaleString()}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge bg-light text-secondary border text-uppercase" style={{ fontSize: 11 }}>
                                    {tx.channel}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge rounded-pill px-2.5 py-1 ${tx.status.toLowerCase() === 'completed'
                                      ? 'bg-success-subtle text-success border border-success'
                                      : 'bg-warning-subtle text-warning border border-warning'
                                      }`}
                                  >
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1"
                                    style={{ fontSize: '0.78rem' }}
                                  >
                                    <i className="feather-printer me-1" /> Voucher
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-4 pt-3 border-top">
                          <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                            Showing{' '}
                            <strong>
                              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredTransactions.length)}
                            </strong>{' '}
                            of <strong>{filteredTransactions.length}</strong> receipts
                          </div>
                          <ul className="pagination pagination-sm mb-0 gap-1">
                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                              <button
                                type="button"
                                className="page-link rounded-2 px-2.5 py-1"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                style={{ fontSize: '0.78rem' }}
                              >
                                Prev
                              </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                              <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                <button
                                  type="button"
                                  className={`page-link rounded-2 px-3 py-1 fw-semibold ${page === p ? 'bg-primary text-white border-primary' : ''
                                    }`}
                                  onClick={() => setPage(p)}
                                  style={{ fontSize: '0.78rem' }}
                                >
                                  {p}
                                </button>
                              </li>
                            ))}
                            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                              <button
                                type="button"
                                className="page-link rounded-2 px-2.5 py-1"
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                style={{ fontSize: '0.78rem' }}
                              >
                                Next
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentOrder;
