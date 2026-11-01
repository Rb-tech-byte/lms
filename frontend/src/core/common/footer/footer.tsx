import React from 'react';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../imageWithBasePath';
import { all_routes } from '../../../feature-module/router/all_routes';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-bg">
        <ImageWithBasePath
          src="assets/img/bg/footer-bg-01.png"
          className="footer-bg-1"
          alt=""
        />
        <ImageWithBasePath
          src="assets/img/bg/footer-bg-02.png"
          className="footer-bg-2"
          alt=""
        />
      </div>
      <div className="footer-top">
        <div className="container">
          <div className="row row-gap-4">
            <div className="col-lg-4">
              <div className="footer-about">
                <div className="footer-logo mb-3">
                  <ImageWithBasePath src="assets/img/logo.svg" alt="Open University of Tanzania" />
                </div>
                <p className="text-muted fs-14">
                  The Open University of Tanzania (OUT) is a fully accredited public university
                  offering higher education through open and distance e-learning across East Africa.
                </p>
                <div className="mt-3">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fs-12 fw-medium">
                    🏛️ TCU &amp; NACTE Chartered University
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="row row-gap-4">
                <div className="col-lg-4 col-md-6">
                  <div className="footer-widget footer-menu">
                    <h5 className="footer-title">Academic Faculties</h5>
                    <ul>
                      <li>
                        <Link to={all_routes.courseCategory}>Science &amp; Technology</Link>
                      </li>
                      <li>
                        <Link to={all_routes.courseCategory}>Business Management</Link>
                      </li>
                      <li>
                        <Link to={all_routes.courseCategory}>Education &amp; Pedagogy</Link>
                      </li>
                      <li>
                        <Link to={all_routes.courseCategory}>Faculty of Law</Link>
                      </li>
                      <li>
                        <Link to={all_routes.courseCategory}>Arts &amp; Social Sciences</Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="footer-widget footer-menu">
                    <h5 className="footer-title">University Portals</h5>
                    <ul>
                      <li>
                        <Link to={all_routes.studentDashboard}>Student Academic Portal</Link>
                      </li>
                      <li>
                        <Link to={all_routes.instructorDashboard}>Faculty Instructor Portal</Link>
                      </li>
                      <li>
                        <Link to={all_routes.adminDashboard}>Senate &amp; Registrar Directorate</Link>
                      </li>
                      <li>
                        <Link to={all_routes.studentCertificates}>Graduation &amp; Transcripts</Link>
                      </li>
                      <li>
                        <Link to={all_routes.login}>Moodle Web Services Login</Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-4 col-md-12">
                  <div className="footer-widget footer-contact">
                    <h5 className="footer-title">Headquarters &amp; ICT</h5>
                    <div className="footer-contact-info">
                      <div className="footer-address d-flex align-items-start mb-2">
                        <i className="isax isax-location5 text-primary fs-18 me-2 mt-1" />
                        <p className="mb-0 fs-13">
                          Kawawa Road, Kinondoni<br />
                          P.O. Box 23409, Dar es Salaam, Tanzania
                        </p>
                      </div>
                      <div className="footer-address d-flex align-items-center mb-2">
                        <i className="isax isax-sms5 text-primary fs-18 me-2" />
                        <p className="mb-0 fs-13">helpdesk@out.ac.tz</p>
                      </div>
                      <div className="footer-address d-flex align-items-center">
                        <i className="isax isax-call5 text-primary fs-18 me-2" />
                        <p className="mb-0 fs-13">+255 22 266 8992</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <div className="row row-gap-2">
            <div className="col-md-6">
              <div className="text-center text-md-start">
                <p className="text-white mb-0">
                  Copyright © 2026 The Open University of Tanzania (OUT). All rights reserved.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <ul className="d-flex align-items-center justify-content-center justify-content-md-end footer-link mb-0">
                <li>
                  <Link to={all_routes.termsConditions}>Senate Academic Regulations</Link>
                </li>
                <li>
                  <Link to={all_routes.privacyPolicy}>Data Privacy Policy</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;