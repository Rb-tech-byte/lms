import React, { useEffect } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { courseService } from '../../../core/api/courseService';

const TermsCondition: React.FC = () => {
  useEffect(() => {
    courseService.getRestV2OpenApiInfo().catch(() => null);
  }, []);

  return (
    <>
      <Breadcrumb title="Academic Regulations & Terms of Use" />
      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 mx-auto">
              <div className="mb-4">
                <h5 className="mb-3">Open University of Tanzania Digital Learning Terms</h5>
                <p className="mb-0">
                  By accessing or using the Open University of Tanzania (OUT) Learning Management
                  System (LMS), you agree to abide by the University Charter, Student Examination
                  Regulations, and ICT Acceptable Use Policy.
                </p>
              </div>
              <div className="mb-4">
                <h6 className="mb-2">1. Academic Integrity &amp; Assessment Honesty</h6>
                <p className="mb-0">
                  All quizzes, timed tests, and written assignments submitted through the OUT LMS
                  must be the student&apos;s own original work. Plagiarism, credential sharing, or
                  unauthorized assistance is subject to disciplinary action under OUT Examination
                  Regulations.
                </p>
              </div>
              <div className="mb-4">
                <h6 className="mb-2">2. Course Enrollment &amp; Tuition Payments</h6>
                <p className="mb-0">
                  Course enrollment is activated upon verification of tuition payment via Pesapal or
                  Selcom (or immediately for open-access courses). Tuition fees are governed by the
                  official OUT Prospectus and Fee Schedule.
                </p>
              </div>
              <div className="mb-4">
                <h6 className="mb-2">3. Intellectual Property of Study Materials</h6>
                <p className="mb-0">
                  Lecture videos, SCORM packages, PDF study guides, and assessment banks published
                  on the platform remain the intellectual property of The Open University of
                  Tanzania and may not be redistributed commercially.
                </p>
              </div>
              <div className="mb-0">
                <h6 className="mb-2">4. Governing Law</h6>
                <p className="mb-0">
                  These terms are governed by the laws of the United Republic of Tanzania and the
                  regulations of the Tanzania Commission for Universities (TCU).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsCondition;
