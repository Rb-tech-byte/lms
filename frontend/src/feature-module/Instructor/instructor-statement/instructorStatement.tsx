import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { instructorService, InstructorCourseSummary } from '../../../core/api/instructorService';

const InstructorStatement: React.FC = () => {
  const [courses, setCourses] = useState<InstructorCourseSummary[]>([]);

  useEffect(() => {
    instructorService.getInstructorDashboardStats().then((res) => {
      setCourses(res.courses || []);
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Academic Course Statements" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="table-responsive custom-table">
                <table className="table">
                  <thead className="thead-light">
                    <tr>
                      <th>Course Code</th>
                      <th>Course Title</th>
                      <th>Enrolled Students</th>
                      <th>Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id}>
                        <td className="fw-bold">{c.shortname}</td>
                        <td>{c.fullname}</td>
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
    </>
  );
};

export default InstructorStatement;
