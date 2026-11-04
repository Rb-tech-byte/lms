import React from 'react';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import { useAuth } from '../../../../core/auth/authContext';
import { SectionCard } from '../../common/instructorUi';

const InstructorDeleteAccount: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="ins-content">
      <InstructorSettingsLink />

      <SectionCard
        title="Institutional Staff Account Governance"
        subtitle="Policies and procedures regarding academic staff accounts and service continuity."
      >
        <div className="p-4 rounded-3 border bg-light text-center">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center text-danger bg-danger-subtle mb-3"
            style={{ width: 56, height: 56, fontSize: 24 }}
          >
            <i className="feather-shield" />
          </div>
          <h5 className="fw-bold text-dark mb-2">
            Protected Academic Staff Record ({user?.email || 'amina.kilindo@out.ac.tz'})
          </h5>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: 540, fontSize: 13.5, lineHeight: 1.6 }}>
            In accordance with The Open University of Tanzania Human Resource &amp; Academic Senate Regulations, faculty accounts cannot be autonomously terminated while active directed courses, pending grading queues, or student examination records remain assigned.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3">
            <a
              href="mailto:dhr@out.ac.tz?subject=Faculty%20Account%20Inquiry%20-%20Dr.%20Amina%20Kilindo"
              className="ins-btn ins-btn-ghost"
            >
              <i className="feather-mail me-1" /> Contact Directorate of HR
            </a>
            <a
              href="mailto:helpdesk@out.ac.tz?subject=LMS%20Faculty%20Support"
              className="ins-btn ins-btn-primary"
            >
              <i className="feather-help-circle me-1" /> Contact ICT Directorate
            </a>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default InstructorDeleteAccount;
