import React, { useEffect, useMemo, useState } from 'react';
import { instructorService, InstructorStatementItem } from '../../../core/api/instructorService';
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

const InstructorStatement: React.FC = () => {
  const shell = useInstructorShell();
  const [statements, setStatements] = useState<InstructorStatementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Preview modal
  const [previewTarget, setPreviewTarget] = useState<InstructorStatementItem | null>(null);

  useEffect(() => {
    instructorService.fetchStatements().then((list) => {
      setStatements(list);
      setLoading(false);
    });
  }, []);

  const formatTZS = (n: number) => `TZS ${(n || 0).toLocaleString()}`;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return statements.filter((s) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'settled' && s.status === 'Settled');
      const matchSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.period.toLowerCase().includes(q) ||
        s.payoutRef.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [statements, searchQuery, statusFilter]);

  const pager = usePaged(filtered, PAGE_SIZE, [searchQuery, statusFilter]);

  const handleExport = () => {
    exportToCsv(
      'OUT_Faculty_Fiscal_Statements',
      filtered.map((s) => ({
        Statement_ID: s.id,
        Period: s.period,
        Issued_Date: s.issuedDate,
        Gross_Earned: `TZS ${s.grossEarned.toLocaleString()}`,
        Faculty_Share_70: `TZS ${s.facultyShare.toLocaleString()}`,
        Tax_Withholding_5: `TZS ${s.taxWithholding.toLocaleString()}`,
        Net_Disbursed: `TZS ${s.netDisbursed.toLocaleString()}`,
        Status: s.status,
        Disbursement_Ref: s.payoutRef,
      }))
    );
  };

  const totalGross = statements.reduce((acc, s) => acc + (s.grossEarned || 0), 0);
  const totalNet = statements.reduce((acc, s) => acc + (s.netDisbursed || 0), 0);
  const totalTax = statements.reduce((acc, s) => acc + (s.taxWithholding || 0), 0);

  return (
    <div className="ins-page">
      {/* KPI Overview */}
      <KpiGrid>
        <KpiCard
          label="Total Gross Billed"
          value={formatTZS(totalGross)}
          hint="From accredited tuition fee pool"
          icon="isax isax-receipt-item5"
          tone="primary"
        />
        <KpiCard
          label="Net Honoraria Disbursed"
          value={formatTZS(totalNet)}
          hint="Directly transferred to faculty"
          icon="isax isax-tick-circle5"
          tone="success"
        />
        <KpiCard
          label="Statutory Tax Remitted"
          value={formatTZS(totalTax)}
          hint="TRA 5% professional withholding"
          icon="isax isax-percentage-square5"
          tone="warning"
        />
        <KpiCard
          label="Audited Statements"
          value={`${statements.length} Cycles`}
          hint="Certified by OUT Bursar"
          icon="isax isax-document-text5"
          tone="info"
        />
      </KpiGrid>

      {/* Main Table Card */}
      <SectionCard
        title="Official Faculty Fiscal Statements & Vouchers"
        subtitle="Audited financial summaries, statutory tax schedules, and Bursar disbursement receipts"
        actions={
          <button type="button" className="ins-btn ins-btn-ghost" onClick={handleExport}>
            <i className="feather-download" /> Export CSV
          </button>
        }
      >
        {/* Search & Filters */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search statements by cycle ID, month, or reference..."
          />
          <FilterPills
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Statements', count: statements.length },
              { value: 'settled', label: 'Settled' },
            ]}
          />
        </div>

        {loading ? (
          <LoadingState text="Loading fiscal vouchers..." />
        ) : filtered.length === 0 ? (
          <EmptyState text="No statements found." />
        ) : (
          <div className="table-responsive">
            <table className="table ins-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Statement Voucher</th>
                  <th>Billing Cycle</th>
                  <th>Issue Date</th>
                  <th>Gross Collected</th>
                  <th>Faculty 70%</th>
                  <th>TRA Tax (5%)</th>
                  <th>Net Disbursed</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {pager.slice.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="badge bg-light text-primary font-monospace fw-bold px-2 py-1">
                        {s.id}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark" style={{ fontSize: 13.5 }}>
                        {s.period}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: 12.5 }}>
                        {s.issuedDate}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: 13 }}>
                        {formatTZS(s.grossEarned)}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark" style={{ fontSize: 13 }}>
                        {formatTZS(s.facultyShare)}
                      </span>
                    </td>
                    <td>
                      <span className="text-danger" style={{ fontSize: 12 }}>
                        - {formatTZS(s.taxWithholding)}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success fw-bold px-2.5 py-1" style={{ fontSize: 13 }}>
                        {formatTZS(s.netDisbursed)}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success fw-bold px-2 py-0.5">
                        {s.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="ins-btn ins-btn-ghost px-2 py-1"
                        onClick={() => setPreviewTarget(s)}
                      >
                        <i className="feather-printer me-1" /> View Voucher
                      </button>
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
            noun="statements"
          />
        </div>
      </SectionCard>

      {/* Modal: Statement Voucher Preview */}
      <Modal
        open={!!previewTarget}
        title="Faculty Fiscal Remittance Voucher"
        subtitle={`Voucher Number: ${previewTarget?.id} • OUT Bursar`}
        onClose={() => setPreviewTarget(null)}
        submitLabel="Print Official Voucher"
        onSubmit={() => window.print()}
      >
        <div className="p-4 rounded-3 border bg-white shadow-sm" style={{ border: '1px solid #cbd5e1' }}>
          <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
            <div>
              <h5 className="fw-bold text-primary mb-1">THE OPEN UNIVERSITY OF TANZANIA</h5>
              <p className="text-muted small mb-0">Directorate of Finance &amp; Bursar Operations</p>
              <p className="text-muted small mb-0">Kawawa Road, Kinondoni, P.O. Box 23409, Dar es Salaam</p>
            </div>
            <div className="text-end">
              <span className="badge bg-success-subtle text-success fw-bold px-2 py-1 mb-1">
                SETTLED &amp; DISBURSED
              </span>
              <div className="text-muted font-monospace" style={{ fontSize: 11 }}>
                VOUCHER: {previewTarget?.id}
              </div>
            </div>
          </div>

          <div className="row g-3 mb-3" style={{ fontSize: 13 }}>
            <div className="col-6">
              <span className="text-muted d-block">Payee Faculty:</span>
              <strong className="text-dark">Dr. Amina Kilindo</strong>
              <div className="text-muted small">Senior Lecturer • Staff ID: FAC/CS/004</div>
            </div>
            <div className="col-6 text-end">
              <span className="text-muted d-block">Billing Cycle:</span>
              <strong className="text-dark">{previewTarget?.period}</strong>
              <div className="text-muted small">Issued: {previewTarget?.issuedDate}</div>
            </div>
          </div>

          <div className="table-responsive mb-3">
            <table className="table table-bordered table-sm mb-0" style={{ fontSize: 12.5 }}>
              <thead className="table-light">
                <tr>
                  <th>Description</th>
                  <th className="text-end">Amount (TZS)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gross Accredited Course Tuition Revenue Pool</td>
                  <td className="text-end">{formatTZS(previewTarget?.grossEarned || 0)}</td>
                </tr>
                <tr>
                  <td>Faculty Academic Honorarium Entitlement (70%)</td>
                  <td className="text-end fw-semibold">{formatTZS(previewTarget?.facultyShare || 0)}</td>
                </tr>
                <tr>
                  <td>Tanzania Revenue Authority (TRA) Statutory Withholding (5%)</td>
                  <td className="text-end text-danger">- {formatTZS(previewTarget?.taxWithholding || 0)}</td>
                </tr>
                <tr className="table-light fw-bold">
                  <td>NET DISBURSED TO FACULTY BENEFICIARY</td>
                  <td className="text-end text-primary" style={{ fontSize: 14 }}>
                    {formatTZS(previewTarget?.netDisbursed || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-2.5 bg-light rounded text-muted" style={{ fontSize: 11.5 }}>
            <strong>Disbursement Reference:</strong> {previewTarget?.payoutRef} • Transferred via Electronic Financial Settlement.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InstructorStatement;
