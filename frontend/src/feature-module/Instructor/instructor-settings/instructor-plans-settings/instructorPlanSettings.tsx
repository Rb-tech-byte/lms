import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../../common/profileCard';
import InstructorSidebar from '../../common/instructorSidebar';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import { instructorService, InstructorCourseSummary } from '../../../../core/api/instructorService';

const InstructorPlanSettings: React.FC = () => {
  const [courses, setCourses] = useState<InstructorCourseSummary[]>([]);

  useEffect(() => {
    instructorService.getInstructorDashboardStats().then((res) => {
      setCourses(res.courses || []);
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Faculty Teaching Load & Assignments" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card mb-0">
                <div className="card-body">
                  <InstructorSettingsLink />
                  <h6 className="fw-bold mb-3">
                    Assigned Academic Teaching Load ({courses.length} Active Moodle Courses)
                  </h6>
                  <ul className="list-group">
                    {courses.map((c) => (
                      <li
                        key={c.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span>
                          <strong>{c.shortname}</strong> — {c.fullname}
                        </span>
                        <span className="badge bg-primary rounded-pill">
                          {c.enrolledCount} Students
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorPlanSettings;
