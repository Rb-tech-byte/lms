import React, { useEffect, useState } from 'react';
import ImageWithBasePath from '../../../../core/common/imageWithBasePath';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';
import { courseService } from '../../../../core/api/courseService';

const AboutSection: React.FC = () => {
  const [totalCourses, setTotalCourses] = useState(8);

  useEffect(() => {
    let mounted = true;
    courseService.getPublicCatalog().then((res) => {
      if (mounted && res.stats?.totalCourses) {
        setTotalCourses(res.stats.totalCourses);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="about-section-two pb-0">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="p-3 p-sm-4 position-relative">
              <div className="position-absolute top-0 start-0 z-n1">
                <ImageWithBasePath src="assets/img/shapes/shape-1.svg" alt="shape" />
              </div>
              <div className="position-absolute bottom-0 end-0 z-n1">
                <ImageWithBasePath src="assets/img/shapes/shape-2.svg" alt="shape" />
              </div>
              <ImageWithBasePath
                src="assets/img/about/about-2.svg"
                className="img-fluid"
                alt="About Open University of Tanzania"
              />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="ps-0 ps-lg-2 pt-4 pt-lg-0 ps-xl-5">
              <div className="section-header">
                <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
                  About The Open University of Tanzania (OUT)
                </span>
                <h2>Pioneering Open &amp; Distance Higher Education in East Africa</h2>
                <p>
                  Established by an Act of Parliament in 1992, The Open University of Tanzania is a
                  fully accredited public university offering certificate, diploma, undergraduate,
                  and postgraduate programmes across 30 Regional Centres ({totalCourses}+ live
                  digital courses).
                </p>
              </div>
              <div className="d-flex align-items-center about-us-banner">
                <div>
                  <span className="bg-primary-transparent rounded-3 p-2 about-icon d-flex justify-content-center align-items-center">
                    <i className="isax isax-book-1 fs-24" />
                  </span>
                </div>
                <div className="ps-3">
                  <h6 className="mb-2">Blended &amp; Self-Paced Digital Learning</h6>
                  <p>
                    Study from anywhere in Tanzania or abroad using our Moodle 5.3 headless digital
                    classroom, interactive quizzes, and video lectures.
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center about-us-banner">
                <div>
                  <span className="bg-secondary-transparent rounded-3 p-2 about-icon d-flex justify-content-center align-items-center">
                    <i className="isax isax-bookmark5 fs-24" />
                  </span>
                </div>
                <div className="ps-3">
                  <h6 className="mb-2">TCU Accredited University Degrees</h6>
                  <p>
                    All academic programmes are accredited by the Tanzania Commission for
                    Universities (TCU) and recognized internationally.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link to={all_routes.courseGrid} className="btn btn-primary rounded-pill px-4">
                  Explore Academic Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
