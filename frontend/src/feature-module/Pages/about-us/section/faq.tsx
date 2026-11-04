import React, { useEffect } from 'react';
import ImageWithBasePath from '../../../../core/common/imageWithBasePath';
import { courseService } from '../../../../core/api/courseService';

const Faq: React.FC = () => {
  useEffect(() => {
    courseService.getRestV2OpenApiInfo().catch(() => null);
  }, []);

  return (
    <section className="faq-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-5 pe-md-5">
            <div className="position-relative">
              <ImageWithBasePath
                className="img-fluid rounded-4"
                src="assets/img/about/about-1.jpg"
                alt="OUT Campus"
              />
              <div className="bg-warning text-center p-3 rounded-5 position-absolute top-0 end-0 z-index-1 d-none d-sm-block my-3 mx-3">
                <ImageWithBasePath src="assets/img/icons/faq-icon.svg" alt="FAQ" />
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="section-header">
              <div className="section-badge">Frequently Asked Questions</div>
              <h2 className="mb-2">Studying with OUT Headless Moodle LMS</h2>
              <p>
                Key information regarding distance learning, regional examination centres, and
                mobile fee payments.
              </p>
            </div>
            <div
              className="accordion accordion-customicon1 accordions-items-seperate"
              id="accordionAboutFaq"
            >
              <div className="accordion-item">
                <h2 className="accordion-header" id="aboutFaqOne">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseAboutFaqOne"
                    aria-expanded="true"
                  >
                    How does blended and distance learning work at OUT?
                    <i className="isax isax-add fs-20 fw-semibold ms-1" />
                  </button>
                </h2>
                <div
                  id="collapseAboutFaqOne"
                  className="accordion-collapse collapse show"
                  data-bs-parent="#accordionAboutFaq"
                >
                  <div className="accordion-body">
                    Students access video lectures, SCORM modules, reading materials, and quizzes
                    online via our Moodle 5.3 portal while receiving face-to-face support and
                    examination services at any of our 30 Regional Centres.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="aboutFaqTwo">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseAboutFaqTwo"
                    aria-expanded="false"
                  >
                    How do I pay tuition fees and get enrolled?
                    <i className="isax isax-add fs-20 fw-semibold ms-1" />
                  </button>
                </h2>
                <div
                  id="collapseAboutFaqTwo"
                  className="accordion-collapse collapse"
                  data-bs-parent="#accordionAboutFaq"
                >
                  <div className="accordion-body">
                    Select your course and proceed to checkout to pay via Pesapal (M-Pesa, Tigo
                    Pesa, Airtel Money, or bank card). Your Moodle enrollment is activated
                    automatically upon payment confirmation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;
