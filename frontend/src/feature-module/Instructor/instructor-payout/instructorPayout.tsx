import React, { useEffect, useMemo, useState } from 'react';
import { instructorService, InstructorPayoutItem } from '../../../core/api/instructorService';
import { useInstructorShell } from '../common/instructorLayout';
import {
  KpiCard,
  KpiGrid,
  SectionCard,
  SearchInput,
  FilterPills,
  Pagination,
  EmptyState,
  LoadingState,
  Modal,
  exportToCsv,
  usePaged,
} from '../common/instructorUi';

const PAGE_SIZE = 5;

const InstructorPayout: React.FC = () => {
  const shell = useInstructorShell();
  const [payouts, setPayouts] = useState<InstructorPayoutItem[]>([]);
  const [availableBalance, setAvailableBalance] = useState<number>(2895000);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Request payout modal
  const [requestOpen, setRequestOpen] = useState(false);
  const [amount, setAmount] = useState(1000000);
  const [method, setMethod] = useState('Vodacom M-Pesa');
  const [account, setAccount] = useState('+255 754 112 233');
  const [note, setNote] = useState('Faculty monthly honorarium withdrawal');
  const [submitting, setSubmitting] = useState(false);

  const notify = shell?.notify ?? ((m: string) => window.alert(m));

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await instructorService.fetchPayouts();
      setPayouts(res.payouts);
      setAvailableBalance(res.availableBalance);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatTZS = (n: number) => `TZS ${(n || 0).toLocaleString()}`;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return payouts.filter((p) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && p.status === 'Completed') ||
        (statusFilter === 'processing' && p.status === 'Processing');
      const matchSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.method.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.account.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [payouts, searchQuery, statusFilter]);

  const pager = usePaged(filtered, PAGE_SIZE, [searchQuery, statusFilter]);

  const handleExport = () => {
    exportToCsv(
      'OUT_Faculty_Disbursements',
      filtered.map((p) => ({
        Payout_ID: p.id,
        Date: p.date,
        Amount: `TZS ${p.amount.toLocaleString()}`,
        Method: p.method,
        Account: p.account,
        Reference_No: p.reference,
        Status: p.status,
        Purpose: p.note,
      }))
    );
  };

  const handleRequest = async () => {
    if (amount <= 0) {
      notify('Please enter a valid withdrawal amount.');
      return;
    }
    if (amount > availableBalance) {
      notify(`Requested amount exceeds available balance (${formatTZS(availableBalance)}).`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await instructorService.requestPayout(amount, method, account, note);
      if (res.success) {
        notify('Disbursement request submitted to OUT Bursar Finance Directorate.');
        setRequestOpen(false);
        await loadData();
      } else {
        notify(res.message || 'Failed to submit disbursement request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const completedTotal = payouts
    .filter((p) => p.status === 'Completed')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="ins-page">
      {/* KPI Overview */}
      <KpiGrid>
        <KpiCard
          label="Available For Payout"
          value={formatTZS(availableBalance)}
          hint="Ready for immediate withdrawal"
          icon="isax isax-coin-15"
          tone="warning"
        />
        <KpiCard
          label="Total Disbursed"
          value={formatTZS(completedTotal)}
          hint="Confirmed bank & mobile credits"
          icon="isax isax-tick-circle5"
          tone="success"
        />
        <KpiCard
          label="Withdrawal Turnaround"
          value="< 12 Hours"
          hint="M-Pesa / Tigo / Bank API"
          icon="isax isax-clock5"
          tone="info"
        />
        <KpiCard
          label="TCU & Bursar Tax"
          value="5% Withholding"
          hint="Automated statutory tax deduction"
          icon="isax isax-receipt-item5"
          tone="primary"
        />
      </KpiGrid>

      {/* Main Table Card */}
      <SectionCard
        title="Faculty Disbursement & Honoraria Payouts"
        subtitle="Manage bank transfers, mobile money payouts (M-Pesa, Airtel, Tigo Pesa), and disbursement audit logs"
        actions={
          <div className="d-flex align-items-center gap-2">
            <button type="button" className="ins-btn ins-btn-ghost" onClick={handleExport}>
              <i className="feather-download" /> Export CSV
            </button>
            <button
              type="button"
              className="ins-btn ins-btn-primary"
              onClick={() => setRequestOpen(true)}
            >
              <i className="feather-arrow-up-right me-1" /> Request Payout
            </button>
          </div>
        }
      >
        {/* Search & Filters */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search payouts by ref #, method, or account..."
          />
          <FilterPills
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Payouts', count: payouts.length },
              { value: 'completed', label: 'Completed' },
              { value: 'processing', label: 'Processing' },
            ]}
          />
        </div>

        {loading ? (
          <LoadingState text="Loading disbursement transactions..." />
        ) : filtered.length === 0 ? (
          <EmptyState text="No payout records match your criteria." />
        ) : (
          <div className="table-responsive">
            <table className="table ins-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Disbursement ID</th>
                  <th>Date Processed</th>
                  <th>Amount</th>
                  <th>Disbursement Rail</th>
                  <th>Receiving Account / Phone</th>
                  <th>Transaction Reference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pager.slice.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="badge bg-light text-primary font-monospace fw-bold px-2 py-1">
                        {p.id}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: 12.5 }}>
                        {p.date}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark" style={{ fontSize: 14 }}>
                        {formatTZS(p.amount)}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark" style={{ fontSize: 12.5 }}>
                        {p.method}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted font-monospace" style={{ fontSize: 12 }}>
                        {p.account}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark font-monospace" style={{ fontSize: 11 }}>
                        {p.reference}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === 'Completed'
                            ? 'bg-success-subtle text-success'
                            : 'bg-warning-subtle text-warning'
                        } fw-bold px-2 py-1`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4">
          <Pagination
            page={pager.page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={pager.setPage}
            noun="disbursements"
          />
        </div>
      </SectionCard>

      {/* Modal: Request Payout */}
      <Modal
        open={requestOpen}
        title="Request Faculty Honorarium Disbursement"
        subtitle={`Available balance: ${formatTZS(availableBalance)} • OUT Directorate of Finance`}
        onClose={() => setRequestOpen(false)}
        onSubmit={handleRequest}
        submitLabel="Submit Disbursement Request"
        submitting={submitting}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Withdrawal Amount (TZS) *
            </label>
            <input
              type="number"
              min={50000}
              max={availableBalance}
              step={10000}
              className="form-control form-control-sm"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Disbursement Rail / Gateway *
            </label>
            <select
              className="form-select form-select-sm"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="Vodacom M-Pesa">Vodacom M-Pesa (Instant)</option>
              <option value="Tigo Pesa">Tigo Pesa (Instant)</option>
              <option value="Airtel Money">Airtel Money (Instant)</option>
              <option value="CRDB Bank Transfer">CRDB Bank Transfer</option>
              <option value="NMB Bank Transfer">NMB Bank Transfer</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Destination Account / Mobile Number *
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. +255 754 112 233 or CRDB A/C 01529849200"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Faculty Purpose & Remarks
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={2}
              value={note}
              placeholder="e.g. Continuous assessment marking honorarium distribution"
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InstructorPayout;
