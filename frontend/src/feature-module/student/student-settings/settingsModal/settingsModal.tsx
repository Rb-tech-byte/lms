import React from 'react';
import { useAuth } from '../../../../core/auth/authContext';

const SettingsModal: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="modal fade" id="delete_account" tabIndex={-1} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Academic Record Governance ({user?.username || 'student'})</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>
          <div className="modal-body">
            <p className="mb-0 small text-muted">
              Open University of Tanzania student registration records and academic transcripts are
              preserved in accordance with TCU academic regulations. Contact the Registrar for
              official withdrawal requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
