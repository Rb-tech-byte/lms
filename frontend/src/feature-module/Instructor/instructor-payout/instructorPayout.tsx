import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { instructorService, InstructorCourseSummary } from '../../../core/api/instructorService';

const InstructorPayout: React.FC = () => {
  const [courses, setCourses] = useState<InstructorCourseSummary[]>([]);

  useEffect(() => {
    instructorService.getInstructorDashboardStats().then((res) => {
      setCourses(res.courses || []);
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Academic Supervision Disbursements" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm p-4">
                <h5 className="fw-bold mb-3">OUT Bursar Supervision Statements ({courses.length} Courses)</h5>
                <p className="text-muted small mb-0">
                  All faculty supervision allowances and marking disbursements are processed through
                  The Open University of Tanzania Directorate of Finance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorPayout;
