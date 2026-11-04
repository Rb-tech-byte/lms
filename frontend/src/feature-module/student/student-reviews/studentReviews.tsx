import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import StudentSidebar from '../common/studentSidebar';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { courseService, PublicCatalogCourse } from '../../../core/api/courseService';

const StudentReviews: React.FC = () => {
  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);

  useEffect(() => {
    courseService.getPublicCatalog().then((res) => {
      setCourses((res.courses || []).slice(0, 4));
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Course Evaluations & Reviews" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5>Submitted Course Evaluations</h5>
              </div>
              {courses.map((c) => (
                <div className="border mb-3 p-3 rounded-2 bg-white" key={c.id}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div>
                      <span className="badge bg-primary-transparent text-primary me-2">
                        {c.shortname}
                      </span>
                      <strong>
                        <Link to={`${all_routes.courseDetails}?id=${c.id}`}>{c.fullname}</Link>
                      </strong>
                    </div>
                    <div className="text-warning">
                      <i className="fa-solid fa-star" /> {c.rating}
                    </div>
                  </div>
                  <p className="text-muted small mb-0">
                    Well-structured academic course units and responsive supervision from{' '}
                    {c.instructor.fullname}.
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

export default StudentReviews;
