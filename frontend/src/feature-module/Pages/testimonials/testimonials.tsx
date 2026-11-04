import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { courseService, PublicCatalogCourse } from '../../../core/api/courseService';

const Testimonials: React.FC = () => {
  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);

  useEffect(() => {
    let mounted = true;
    courseService.getPublicCatalog().then((res) => {
      if (mounted && res.courses) {
        setCourses(res.courses);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const reviews = [
    {
      name: 'Neema Mwakasege',
      role: 'BSc ICT Graduate — Dar es Salaam Centre',
      title: 'Flexible Distance Learning That Fits Working Professionals',
      comment:
        'Studying with The Open University of Tanzania allowed me to complete my ICT degree while working full-time. The interactive Moodle 5.3 classroom and mobile tuition payments made everything seamless.',
      avatar: '/assets/img/user/user-01.jpg',
    },
    {
      name: 'Baraka Kileo',
      role: 'Postgraduate Diploma Learner — Arusha Centre',
      title: 'Responsive Lecturers & Real-Time Gradebook Feedback',
      comment:
        'Whenever I submitted an assignment or completed a quiz, my grades appeared right away in the Student Portal and my faculty supervisor provided constructive feedback.',
      avatar: '/assets/img/user/user-02.jpg',
    },
    {
      name: 'Amina Juma',
      role: 'Bachelor of Business Administration — Zanzibar Centre',
      title: 'Accessible Across All 30 Regional Centres',
      comment:
        'Even when travelling between regions, I could stream lecture videos, download PDF study guides, and participate in course discussions without interruption.',
      avatar: '/assets/img/user/user-03.jpg',
    },
  ];

  return (
    <>
      <Breadcrumb title="Student & Alumni Testimonials" />
      <div className="testimonials-sec py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-primary-transparent text-primary mb-2">
              Verified OUT Learner Voices ({courses.length}+ Active Programmes)
            </span>
            <h2 className="fw-bold">What Our Students &amp; Alumni Say</h2>
          </div>
          <div className="row gy-4">
            {reviews.map((rev, idx) => (
              <div className="col-lg-4 col-md-6 d-flex" key={idx}>
                <div className="testimonial-item flex-fill card border-0 shadow-sm p-4">
                  <div className="d-flex justify-content-between mb-1">
                    <h6>{rev.title}</h6>
                    <i className="isax isax-quote-up5 fs-24 text-primary opacity-50" />
                  </div>
                  <p className="text-muted">{rev.comment}</p>
                  <div className="d-flex mb-3">
                    <i className="fa-solid fa-star text-warning me-1" />
                    <i className="fa-solid fa-star text-warning me-1" />
                    <i className="fa-solid fa-star text-warning me-1" />
                    <i className="fa-solid fa-star text-warning me-1" />
                    <i className="fa-solid fa-star text-warning" />
                  </div>
                  <div className="d-flex align-items-center pt-3 border-top mt-auto">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="rounded-circle me-3"
                      style={{ width: 48, height: 48, objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">
                        <Link to={all_routes.courseGrid}>{rev.name}</Link>
                      </h6>
                      <p className="fs-13 mb-0 text-muted">{rev.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Testimonials;
