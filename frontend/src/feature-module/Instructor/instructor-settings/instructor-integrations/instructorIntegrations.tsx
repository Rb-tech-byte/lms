import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../../common/profileCard';
import InstructorSidebar from '../../common/instructorSidebar';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import { courseService } from '../../../../core/api/courseService';

const InstructorIntegrations: React.FC = () => {
  const [apiTitle, setApiTitle] = useState('Moodle 5.3 OpenAPI 3.1 REST v2');

  useEffect(() => {
    courseService.getRestV2OpenApiInfo().then((spec) => {
      if (spec?.info?.title) setApiTitle(spec.info.title);
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Classroom & Video Integrations" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card mb-0">
                <div className="card-body">
                  <InstructorSettingsLink />
                  <div className="border rounded-3 p-3 mb-3 d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-1">BigBlueButton Live Virtual Classroom</h6>
                      <p className="text-muted small mb-0">
                        Integrated with Moodle 5.3 mod_bigbluebuttonbn
                      </p>
                    </div>
                    <span className="badge bg-success">Active</span>
                  </div>
                  <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-1">{apiTitle}</h6>
                      <p className="text-muted small mb-0">
                        REST v2 + Core Web Services Bridge Connected
                      </p>
                    </div>
                    <span className="badge bg-primary">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorIntegrations;
