import React, { useEffect } from 'react';
import ImageWithBasePath from '../../../../core/common/imageWithBasePath';
import { courseService } from '../../../../core/api/courseService';

const Benefits: React.FC = () => {
  useEffect(() => {
    courseService.getRestV2OpenApiInfo().catch(() => null);
  }, []);

  return (
    <section className="benefit-section">
      <div className="container">
        <div className="section-header text-center">
          <div className="section-badge">Why Study at OUT</div>
          <h2>Pillars of the OUT Digital Learning Ecosystem</h2>
          <p>
            Combining academic excellence, nationwide regional study centres, and modern Moodle 5.3
            learning technology.
          </p>
        </div>
        <div className="row">
          <div className="col-lg-4 col-md-6">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="position-absolute top-0 end-0 mt-n3 me-n4">
                  <ImageWithBasePath src="./assets/img/shapes/bg-1.png" alt="bg" />
                </div>
                <div className="p-4 rounded-pill bg-primary-transparent d-inline-flex">
                  <i className="isax isax-book-1 fs-24 text-primary" />
                </div>
                <h5 className="mt-3 mb-1">Flexible Distance Modules</h5>
                <p>
                  Balance career, family, and higher education with structured online modules and
                  self-paced digital study materials.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="position-absolute top-0 end-0 mt-n3 me-n4">
                  <ImageWithBasePath src="assets/img/shapes/bg-2.png" alt="bg" />
                </div>
                <div className="p-4 rounded-pill bg-secondary-transparent d-inline-flex">
                  <i className="isax isax-bookmark5 fs-24 text-secondary" />
                </div>
                <h5 className="mt-3 mb-1">Distinguished Faculty Supervision</h5>
                <p>
                  Receive academic guidance, coursework grading, and research supervision from
                  experienced OUT professors and senior lecturers.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="position-absolute top-0 end-0 mt-n3 me-n4">
                  <ImageWithBasePath src="assets/img/shapes/bg-3.png" alt="bg" />
                </div>
                <div className="p-4 rounded-pill bg-skyblue-transparent d-inline-flex">
                  <i className="isax isax-chart-26 fs-24 text-skyblue" />
                </div>
                <h5 className="mt-3 mb-1">Verified Academic Credentials</h5>
                <p>
                  Earn TCU-accredited degrees, diplomas, and instant verifiable digital certificates
                  recognized across East Africa and globally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
