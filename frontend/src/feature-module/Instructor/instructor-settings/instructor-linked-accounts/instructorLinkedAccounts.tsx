import React, { useEffect, useState } from 'react';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import {
  instructorService,
  InstructorLinkedAccountItem,
} from '../../../../core/api/instructorService';
import { SectionCard } from '../../common/instructorUi';

const InstructorLinkedAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<InstructorLinkedAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    instructorService.fetchLinkedAccounts().then((data) => {
      if (mounted) {
        setAccounts(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleToggle = async (id: string, currentlyConnected: boolean) => {
    setMessage(null);
    try {
      const res = await instructorService.toggleLinkedAccount(id, !currentlyConnected);
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id
            ? {
                ...acc,
                connected: !currentlyConnected,
                accountIdentifier: !currentlyConnected ? 'Connected via SSO' : 'Not linked',
                connectedAt: !currentlyConnected ? 'Today' : '—',
              }
            : acc
        )
      );
      setMessage({ type: 'success', text: res.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Operation failed.' });
    }
  };

  if (loading) {
    return (
      <div className="ins-content p-4">
        <InstructorSettingsLink />
        <div className="ins-empty">
          <span className="spinner-border spinner-border-sm text-primary me-2" />
          Loading linked accounts...
        </div>
      </div>
    );
  }

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
        title="Single Sign-On (SSO) &amp; Institutional Linked Accounts"
        subtitle="Manage external academic authorization providers linked to your OUT Faculty profile."
      >
        <div className="d-flex flex-column gap-3">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-3 rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-3 bg-white"
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: 44, height: 44, background: '#e8f4fc', fontSize: 22 }}
                >
                  <i className={acc.icon} />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: 14 }}>
                      {acc.name}
                    </h6>
                    {acc.connected ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5" style={{ fontSize: 10.5 }}>
                        Connected
                      </span>
                    ) : (
                      <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-0.5" style={{ fontSize: 10.5 }}>
                        Not Connected
                      </span>
                    )}
                  </div>
                  <div className="text-muted small">
                    {acc.provider} • <span className="text-dark fw-medium">{acc.accountIdentifier}</span>
                  </div>
                  {acc.connected && (
                    <small className="text-muted" style={{ fontSize: 11 }}>
                      Linked on: {acc.connectedAt}
                    </small>
                  )}
                </div>
              </div>

              <div>
                {acc.connected ? (
                  <button
                    type="button"
                    className="ins-btn ins-btn-ghost text-danger border-danger-subtle"
                    onClick={() => handleToggle(acc.id, true)}
                  >
                    <i className="feather-unlink me-1" /> Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ins-btn ins-btn-primary"
                    onClick={() => handleToggle(acc.id, false)}
                  >
                    <i className="feather-link me-1" /> Connect Account
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="alert alert-info d-flex align-items-center gap-2 mt-4 mb-0 py-2.5 px-3 rounded-3" style={{ fontSize: 12 }}>
          <i className="feather-info text-info fs-16" />
          <span>
            Institutional accounts are governed by OUT ICT Directorate Security Policies. Unlinking an SSO provider may require re-authenticating with your primary staff password.
          </span>
        </div>
      </SectionCard>
    </div>
  );
};

export default InstructorLinkedAccounts;
