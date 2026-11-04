import React, { useEffect } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { courseService } from '../../../core/api/courseService';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    courseService.getRestV2OpenApiInfo().catch(() => null);
  }, []);

  return (
    <>
      <Breadcrumb title="OUT Data Protection & Privacy Policy" />
      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 mx-auto">
              <div className="mb-4">
                <p>
                  The Open University of Tanzania (OUT) is committed to safeguarding the privacy and
                  academic records of all students, faculty members, and visitors using the OUT
                  Headless Moodle 5.3 Learning Management System, in compliance with the Tanzania
                  Personal Data Protection Act (PDPA).
                </p>
              </div>
              <div className="mb-4">
                <h6 className="mb-2">1. Academic &amp; Personal Information We Collect</h6>
                <p className="mb-2">
                  When you register or sign in to the OUT LMS portal, we collect and synchronize:
                </p>
                <ul className="list-unstyled mb-0">
                  <li className="d-flex mb-2">
                    Full Name, Registration Number, and Official Email Address
                  </li>
                  <li className="d-flex mb-2">
                    Enrolled Courses, Quiz Attempts, Assignment Submissions, and Moodle Gradebook
                    Scores
                  </li>
                  <li className="d-flex mb-2">
                    Pesapal / Selcom Tuition Transaction References (no raw card PINs are stored on
                    OUT servers)
                  </li>
                </ul>
              </div>
              <div className="mb-4">
                <h6 className="mb-2">2. How We Use Your Data</h6>
                <p className="mb-0">
                  Your information is used strictly for academic administration, course delivery,
                  assessment grading, digital certificate verification, and statutory reporting to
                  the Tanzania Commission for Universities (TCU).
                </p>
              </div>
              <div className="mb-4">
                <h6 className="mb-2">3. Role-Based Access Control (RBAC) &amp; Security</h6>
                <p className="mb-0">
                  All communication between the React frontend and the Moodle 5.3 core uses token-authenticated
                  Web Services and OpenAPI 3.1 REST v2 endpoints. Only authorized lecturers and
                  administrators can view or grade student coursework within their assigned courses.
                </p>
              </div>
              <div className="mb-0">
                <h6 className="mb-2">4. Contact the OUT Data Protection Officer</h6>
                <p className="mb-0">
                  For inquiries regarding your personal or academic data, contact the Directorate of
                  ICT Services, The Open University of Tanzania, Kawawa Road, Kinondoni, P.O. Box
                  23409, Dar es Salaam, Tanzania (Email: helpdesk@out.ac.tz).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
