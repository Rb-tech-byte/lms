import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { instructorService, EnrolledStudentRecord } from '../../../core/api/instructorService';

const StudentsDetails: React.FC = () => {
  const [student, setStudent] = useState<EnrolledStudentRecord | null>(null);

  useEffect(() => {
    instructorService.getInstructorStudents([2, 3, 4]).then((list) => {
      if (list && list.length > 0) setStudent(list[0]);
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Supervised Student Academic Dossier" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              {student && (
                <div className="card border-0 shadow-sm p-4">
                  <h5 className="fw-bold mb-1">{student.fullname}</h5>
                  <p className="text-muted small mb-3">
                    {student.regNumber} • {student.email} • {student.city}
                  </p>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="border rounded p-3">
                        <small className="text-muted d-block">Average Progress</small>
                        <h5 className="fw-bold mb-0">{student.averageProgress}%</h5>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="border rounded p-3">
                        <small className="text-muted d-block">Current Standing</small>
                        <h5 className="fw-bold mb-0">{student.averageGrade}</h5>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="border rounded p-3">
                        <small className="text-muted d-block">Last Access</small>
                        <h5 className="fw-bold mb-0">{student.lastAccessFormatted}</h5>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentsDetails;
