import React, { useEffect, useState } from 'react';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import {
  instructorService,
  InstructorIntegrationItem,
} from '../../../../core/api/instructorService';
import { SectionCard } from '../../common/instructorUi';

const InstructorIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<InstructorIntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    instructorService.fetchIntegrations().then((data) => {
      if (mounted) {
        setIntegrations(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleTest = async (id: string, name: string) => {
    setTestingId(id);
    setMessage(null);
    try {
      const res = await instructorService.testIntegration(id);
      setMessage({ type: 'success', text: `${name}: ${res.message}` });
    } catch (err: any) {
      setMessage({ type: 'error', text: `${name}: Connection check failed.` });
    } finally {
      setTestingId(null);
    }
  };

  if (loading) {
    return (
      <div className="ins-content p-4">
        <InstructorSettingsLink />
        <div className="ins-empty">
          <span className="spinner-border spinner-border-sm text-primary me-2" />
          Loading Moodle integrations...
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
        title="Moodle 5.3 &amp; Educational Technology Integrations"
        subtitle="Manage live external learning tools, video conferencing clusters, and academic integrity checkers connected to your teaching console."
      >
        <div className="d-flex flex-column gap-3">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-3 bg-white"
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: 44, height: 44, background: '#e8f4fc', fontSize: 22 }}
                >
                  <i className={item.icon} />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: 14 }}>
                      {item.name}
                    </h6>
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5" style={{ fontSize: 10.5 }}>
                      Active
                    </span>
                  </div>
                  <div className="text-muted small mb-1">{item.category}</div>
                  <div className="text-secondary small">{item.description}</div>
                  <div className="d-flex align-items-center gap-3 mt-1 text-muted" style={{ fontSize: 11 }}>
                    <span>
                      <i className="feather-server me-1" />
                      Endpoint: <code>{item.endpoint}</code>
                    </span>
                    <span>
                      <i className="feather-activity me-1 text-success" />
                      {item.lastChecked}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="ins-btn ins-btn-ghost ins-btn-sm"
                  onClick={() => handleTest(item.id, item.name)}
                  disabled={testingId === item.id}
                >
                  {testingId === item.id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" />
                      Pinging...
                    </>
                  ) : (
                    <>
                      <i className="feather-refresh-cw me-1" />
                      Test Connection
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="alert alert-light border mt-4 mb-0 py-2.5 px-3 rounded-3 d-flex align-items-center justify-content-between" style={{ fontSize: 12 }}>
          <div className="d-flex align-items-center gap-2">
            <i className="feather-shield text-primary fs-16" />
            <span>
              All integrations utilize TLS 1.3 encryption and are audited in accordance with the Open University of Tanzania ICT Security Standard.
            </span>
          </div>
          <span className="badge bg-primary px-2 py-1">OUT Enterprise LTI 1.3</span>
        </div>
      </SectionCard>
    </div>
  );
};

export default InstructorIntegrations;
