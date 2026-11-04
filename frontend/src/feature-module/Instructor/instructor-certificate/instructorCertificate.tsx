import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { courseService, PublicCatalogCourse } from '../../../core/api/courseService';

const InstructorCertificate: React.FC = () => {
  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);

  useEffect(() => {
    courseService.getPublicCatalog().then((res) => {
      setCourses(res.courses || []);
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Course Certificate Templates" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5>Official OUT Course Completion Certificates</h5>
              </div>
              <div className="row g-4">
                {courses.slice(0, 4).map((c) => (
                  <div className="col-md-6" key={c.id}>
                    <div className="card border-0 shadow-sm p-4">
                      <span className="badge bg-primary-transparent text-primary mb-2 w-auto align-self-start">
                        {c.shortname}
                      </span>
                      <h6 className="fw-bold mb-1">{c.fullname}</h6>
                      <p className="text-muted small mb-2">
                        Conferred upon 100% Moodle activity completion &amp; passing final grade.
                      </p>
                      <span className="badge bg-success-subtle text-success border border-success align-self-start">
                        TCU Accredited Template Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorCertificate;
