import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { instructorService, EnrolledStudentRecord } from '../../../core/api/instructorService';

const InstructorQuizResult: React.FC = () => {
  const [students, setStudents] = useState<EnrolledStudentRecord[]>([]);

  useEffect(() => {
    instructorService.getInstructorStudents([2, 3, 4]).then((list) => {
      setStudents(list || []);
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Student Quiz Results & Gradebook" />
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
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Course Progress</th>
                      <th>Average Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td className="fw-bold">{s.fullname}</td>
                        <td>{s.email}</td>
                        <td>{s.averageProgress}%</td>
                        <td>{s.averageGrade}</td>
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

export default InstructorQuizResult;
