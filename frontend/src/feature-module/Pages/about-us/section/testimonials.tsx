import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { all_routes } from '../../../router/all_routes';
import { courseService, PublicInstructor } from '../../../../core/api/courseService';

const Testimonials: React.FC = () => {
  const [instructors, setInstructors] = useState<PublicInstructor[]>([]);

  useEffect(() => {
    let mounted = true;
    courseService.getPublicInstructors().then((list) => {
      if (mounted && list) {
        setInstructors(list);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const testimonialslider = {
    infinite: instructors.length > 3,
    slidesToShow: Math.min(3, Math.max(1, instructors.length || 3)),
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(2, Math.max(1, instructors.length || 2)),
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="testimonials-section text-center">
      <div className="container">
        <div className="section-header text-center">
          <div className="section-badge">OUT Academic Leadership</div>
          <h2>Meet Our Faculty &amp; Course Coordinators</h2>
          <p>
            Experienced lecturers and researchers guiding learners across The Open University of
            Tanzania.
          </p>
        </div>
        <Slider {...testimonialslider} className="testimonials-slider lazy">
          {instructors.map((inst) => (
            <div className="px-2" key={inst.id}>
              <div className="card border-0 shadow-sm p-4 h-100">
                <img
                  src={inst.avatar}
                  alt={inst.fullname}
                  className="rounded-circle mx-auto mb-3"
                  style={{ width: 84, height: 84, objectFit: 'cover' }}
                />
                <span className="badge bg-primary-transparent text-primary mx-auto mb-2">
                  {inst.role}
                </span>
                <h6 className="mb-1 fw-bold">
                  <Link to={`${all_routes.instructorDetails}?id=${inst.id}`}>
                    {inst.fullname}
                  </Link>
                </h6>
                <p className="text-muted small mb-2">{inst.department}</p>
                <p className="small text-muted mb-0">{inst.bio}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Testimonials;
