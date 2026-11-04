import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import StudentSidebar from '../common/studentSidebar';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { courseService, PublicCatalogCourse } from '../../../core/api/courseService';

const StudentWishlist: React.FC = () => {
  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);

  useEffect(() => {
    courseService.getPublicCatalog().then((res) => {
      setCourses((res.courses || []).slice(0, 6));
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Saved Courses & Study Plan" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5>Saved OUT Academic Courses ({courses.length})</h5>
              </div>
              <div className="row g-4">
                {courses.map((c) => (
                  <div className="col-xl-4 col-md-6 d-flex" key={c.id}>
                    <div className="course-item-two course-item mx-0 flex-fill border rounded-3 p-3 bg-white">
                      <Link to={`${all_routes.courseDetails}?id=${c.id}`}>
                        <img
                          src={c.image}
                          alt={c.fullname}
                          className="img-fluid rounded-2 w-100 mb-3"
                          style={{ height: 150, objectFit: 'cover' }}
                        />
                      </Link>
                      <span className="badge bg-primary-transparent text-primary mb-1">
                        {c.shortname}
                      </span>
                      <h6 className="fw-bold mb-2">
                        <Link to={`${all_routes.courseDetails}?id=${c.id}`}>{c.fullname}</Link>
                      </h6>
                      <p className="text-muted small mb-3">{c.instructor.fullname}</p>
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span className="fw-bold text-primary small">
                          {c.fee > 0 ? `${c.currency} ${c.fee.toLocaleString()}` : 'Free'}
                        </span>
                        <Link
                          to={`${all_routes.courseCheckout}?courseId=${c.id}`}
                          className="btn btn-sm btn-dark rounded-pill"
                        >
                          Enroll Now
                        </Link>
                      </div>
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

export default StudentWishlist;
