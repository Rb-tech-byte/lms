import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { instructorService, InstructorCourseSummary } from '../../../core/api/instructorService';

const InstructorEarning: React.FC = () => {
  const [courses, setCourses] = useState<InstructorCourseSummary[]>([]);

  useEffect(() => {
    instructorService.getInstructorDashboardStats().then((res) => {
      setCourses(res.courses || []);
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Departmental Tuition Allocation & Honoraria" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm p-4">
                <h5 className="fw-bold mb-3">Course Enrollment &amp; Supervision Summary</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Enrolled Students</th>
                        <th>Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c) => (
                        <tr key={c.id}>
                          <td>
                            {c.shortname} — {c.fullname}
                          </td>
                          <td>{c.enrolledCount}</td>
                          <td>{c.completionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorEarning;
