import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { instructorService, InstructorCourseSummary } from '../../../core/api/instructorService';

const InstructorReview: React.FC = () => {
  const [courses, setCourses] = useState<InstructorCourseSummary[]>([]);

  useEffect(() => {
    instructorService.getInstructorDashboardStats().then((res) => {
      setCourses(res.courses || []);
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Student Course Evaluations" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              {courses.map((c) => (
                <div className="border rounded-3 p-3 mb-3 bg-white" key={c.id}>
                  <div className="d-flex justify-content-between">
                    <h6 className="fw-bold mb-1">
                      {c.shortname}: {c.fullname}
                    </h6>
                    <span className="text-warning fw-bold">
                      <i className="fa-solid fa-star me-1" />
                      {c.rating}
                    </span>
                  </div>
                  <p className="text-muted small mb-0">
                    Evaluated by {c.enrolledCount} enrolled OUT students.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorReview;

