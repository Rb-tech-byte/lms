import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import { all_routes } from '../../../router/all_routes';
import {
  instructorService,
  InstructorWithdrawMethod,
} from '../../../../core/api/instructorService';
import { SectionCard, Modal } from '../../common/instructorUi';

const PROVIDERS = [
  { label: 'Vodacom M-Pesa (Tanzania)', type: 'mobile_money' },
  { label: 'Airtel Money (Tanzania)', type: 'mobile_money' },
  { label: 'Tigo Pesa / Mixx by Yas', type: 'mobile_money' },
  { label: 'Halopesa (Halotel)', type: 'mobile_money' },
  { label: 'CRDB Bank Tanzania', type: 'bank' },
  { label: 'NMB Bank Tanzania', type: 'bank' },
  { label: 'NBC Bank Tanzania', type: 'bank' },
  { label: 'Stanbic Bank Tanzania', type: 'bank' },
];

const InstructorWithdraw: React.FC = () => {
  const [methods, setMethods] = useState<InstructorWithdrawMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New method form state
  const [provider, setProvider] = useState(PROVIDERS[0].label);
  const [accountName, setAccountName] = useState('Dr. Amina Kilindo');
  const [accountNumber, setAccountNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [swift, setSwift] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    let mounted = true;
    instructorService.fetchWithdrawSettings().then((data) => {
      if (mounted) {
        setMethods(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleSetDefault = async (id: string) => {
    setMessage(null);
    try {
      const res = await instructorService.setDefaultWithdrawMethod(id);
      setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
      setMessage({ type: 'success', text: res.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update default method.' });
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this payout destination?')) return;
    setMessage(null);
    try {
      const res = await instructorService.removeWithdrawMethod(id);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      setMessage({ type: 'success', text: res.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to remove account.' });
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      alert('Please enter an account or telephone number.');
      return;
    }

    setSubmitting(true);
    const selectedObj = PROVIDERS.find((p) => p.label === provider);
    const methodType = (selectedObj?.type || 'mobile_money') as 'mobile_money' | 'bank';

    try {
      const res = await instructorService.addWithdrawMethod({
        type: methodType,
        provider,
        accountName,
        accountNumber,
        branch: methodType === 'bank' ? branch : undefined,
        swift: methodType === 'bank' ? swift : undefined,
        isDefault,
        verified: true,
      });

      const updated = await instructorService.fetchWithdrawSettings();
      setMethods(updated);
      setModalOpen(false);
      setAccountNumber('');
      setBranch('');
      setSwift('');
      setMessage({ type: 'success', text: res.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to add method.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="ins-content p-4">
        <InstructorSettingsLink />
        <div className="ins-empty">
          <span className="spinner-border spinner-border-sm text-primary me-2" />
          Loading payout accounts...
        </div>
      </div>
    );
  }

  const selectedProviderObj = PROVIDERS.find((p) => p.label === provider);

  return (
    <div className="ins-content">
      <InstructorSettingsLink />

      {message && (
        <div
          className={`alert ${
            message.type === 'success' ? 'alert-success border-success' : 'alert-danger border-danger'
          } d-flex align-items-center justify-content-between py-2 px-3 mb-4 rounded-3`}
        >
          <div className="d-flex align-items-center gap-2">
            <i className={`feather-${message.type === 'success' ? 'check-circle' : 'alert-circle'}`} />
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-sm"
            onClick={() => setMessage(null)}
            aria-label="Close"
          />
        </div>
      )}

      <SectionCard
        title="Bursar Remittance &amp; Payout Accounts"
        subtitle="Manage bank accounts and mobile money wallets where OUT teaching allowances and course revenue shares are deposited."
        actions={
          <div className="d-flex gap-2">
            <Link to={all_routes.instructorPayout} className="ins-btn ins-btn-ghost ins-btn-sm">
              <i className="feather-clock me-1" /> View Payout History
            </Link>
            <button
              type="button"
              className="ins-btn ins-btn-primary ins-btn-sm"
              onClick={() => setModalOpen(true)}
            >
              <i className="feather-plus me-1" /> Add Account
            </button>
          </div>
        }
      >
        <div className="d-flex flex-column gap-3">
          {methods.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-3 bg-white ${
                m.isDefault ? 'border-primary' : ''
              }`}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className={`rounded-3 d-flex align-items-center justify-content-center ${
                    m.type === 'mobile_money' ? 'text-success bg-success-subtle' : 'text-primary bg-primary-subtle'
                  }`}
                  style={{ width: 44, height: 44, fontSize: 20 }}
                >
                  <i className={m.type === 'mobile_money' ? 'feather-smartphone' : 'feather-briefcase'} />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: 14 }}>
                      {m.provider}
                    </h6>
                    {m.isDefault && (
                      <span className="badge bg-primary px-2 py-0.5" style={{ fontSize: 10.5 }}>
                        Default Destination
                      </span>
                    )}
                    {m.verified && (
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5" style={{ fontSize: 10.5 }}>
                        Verified by Bursar
                      </span>
                    )}
                  </div>
                  <div className="text-dark small mt-0.5">
                    <strong>{m.accountNumber}</strong> • {m.accountName}
                  </div>
                  {m.branch && (
                    <small className="text-muted" style={{ fontSize: 11 }}>
                      Branch: {m.branch} {m.swift ? `• SWIFT: ${m.swift}` : ''}
                    </small>
                  )}
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                {!m.isDefault && (
                  <button
                    type="button"
                    className="ins-btn ins-btn-ghost ins-btn-sm"
                    onClick={() => handleSetDefault(m.id)}
                  >
                    Make Default
                  </button>
                )}
                <button
                  type="button"
                  className="ins-action-btn is-delete"
                  onClick={() => handleRemove(m.id)}
                  title="Remove account"
                >
                  <i className="feather-trash-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Add Account Modal */}
      <Modal
        open={modalOpen}
        title="Register Payout Destination"
        subtitle="Ensure the account name strictly matches your official staff identity for OUT Bursar clearance."
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddSubmit}
        submitLabel="Register Account"
        submitting={submitting}
      >
        <div className="mb-3">
          <label className="form-label fw-semibold text-dark small mb-1">
            Payment Service Provider <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            {PROVIDERS.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label} ({p.type === 'mobile_money' ? 'Mobile Money' : 'Bank Transfer'})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold text-dark small mb-1">
            Account Holder Name (Official Staff Name) <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold text-dark small mb-1">
            {selectedProviderObj?.type === 'mobile_money' ? 'Mobile Money MSISDN' : 'Bank Account Number'}{' '}
            <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder={
              selectedProviderObj?.type === 'mobile_money' ? '+255 7XX XXX XXX' : 'Enter 13-digit account number'
            }
            required
          />
        </div>

        {selectedProviderObj?.type === 'bank' && (
          <div className="row g-2 mb-3">
            <div className="col-md-7">
              <label className="form-label fw-semibold text-dark small mb-1">Bank Branch</label>
              <input
                type="text"
                className="form-control"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Kinondoni Branch"
              />
            </div>
            <div className="col-md-5">
              <label className="form-label fw-semibold text-dark small mb-1">SWIFT Code</label>
              <input
                type="text"
                className="form-control"
                value={swift}
                onChange={(e) => setSwift(e.target.value)}
                placeholder="e.g. CORUTZTZ"
              />
            </div>
          </div>
        )}

        <div className="form-check mt-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="set-default-check"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          <label className="form-check-label text-dark small" htmlFor="set-default-check">
            Set as my primary default payout destination
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default InstructorWithdraw;
