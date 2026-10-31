import React from "react";
import Breadcrumb from "../../../../core/common/Breadcrumb/breadcrumb";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { all_routes } from "../../../router/all_routes";

const InstructorDetails = () => {

  const route = all_routes

    const instructorDetailsSlider = {
        infinite: true,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              infinite: true,
              dots: false,
            },
          },
        ],
      };
    

  return (
    <>
      <Breadcrumb title="Instructor Details" />
     
        {/* Instructor */}
        <div className="instructor-detail-content">
          <div className="container">
            <div className="row">
              <div className="col-lg-8">
                <div className="card bg-light mb-4">
                  <div className="card-body instructor-details">
                    <div className="instructor-img">
                      <Link to="#">
                        <ImageWithBasePath
                          src="assets/img/user/user-61.jpg"
                          alt="img"
                          className="img-fluid"
                        />
                      </Link>
                      <Link to="#" className="btn heart">
                        <i className="isax isax-heart5 text-danger" />
                      </Link>
                    </div>
                    <div className="flex-fill">
                      <div className="pb-3 border-bottom mb-3">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <h6 className="fw-bold">
                            <Link to="#">Rolands Granger</Link>
                          </h6>
                        </div>
                        <div className="d-flex align-items-center mb-1">
                          <Link to="#" className="fs-14 me-2">
                            Developer
                          </Link>
                          <span className="me-2">
                            <i className="fa-solid fa-star text-warning" />
                          </span>
                          <span className="fs-14">4.9 (200 Reviews)</span>
                        </div>
                        <div>
                          <p>
                            I am a web developer with a vast array of knowledge
                            in many different front end and back end languages,
                            responsive frameworks, databases, and best code
                            practices.
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div className="d-flex align-items-center counts-details">
                          <span className="d-flex align-items-center me-4">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                            </span>
                            12+ Lesson
                          </span>
                          <span className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-profile-2user5 fs-16 text-secondary me-2" />
                            </span>
                            50 Students
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <span>
                            <Link
                              to="#"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center me-2"
                            >
                              <i className="fa-brands fa-facebook-f" />
                            </Link>
                          </span>
                          <span>
                            <Link
                              to="#"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center me-2"
                            >
                              <i className="fa-brands fa-instagram" />
                            </Link>
                          </span>
                          <span>
                            <Link
                              to="#"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center me-2"
                            >
                              <i className="fa-brands fa-x-twitter" />
                            </Link>
                          </span>
                          <span>
                            <Link
                              to="#"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center me-2"
                            >
                              <i className="fa-brands fa-youtube" />
                            </Link>
                          </span>
                          <span>
                            <Link
                              to="#"
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                            >
                              <i className="fa-brands fa-linkedin-in" />
                            </Link>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <h5 className="mb-3">About Me</h5>
                    <p className="mb-3">
                      Very well thought out and articulate communication. Clear
                      milestones, deadlines and fast work. Patience. Infinite
                      patience. No shortcuts. Even if the client is being
                      careless. Some quick example text to build on the card
                      title and bulk the card's content Moltin gives you
                      platform.
                    </p>
                    <Link to="#" className="read-more-btn">
                      Read More
                    </Link>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <h5 className="mb-3">Education</h5>
                    <div className="education-flow">
                      <div className="ps-4 pb-4 timeline-flow">
                        <div>
                          <h6 className="mb-1">
                            BCA - Bachelor of Computer Applications
                          </h6>
                          <p className="fs-14">
                            International University - (2004 - 2010)
                          </p>
                        </div>
                      </div>
                      <div className="ps-4 pb-4 timeline-flow">
                        <div>
                          <h6 className="mb-1">
                            MCA - Master of Computer Application
                          </h6>
                          <p className="fs-14">
                            International University - (2010 - 2012)
                          </p>
                        </div>
                      </div>
                      <div className="ps-4 timeline-flow">
                        <div>
                          <h6 className="mb-1">Design Communication Visual</h6>
                          <p className="fs-14">
                            International University - (2012-2015)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <h5 className="mb-3">Experience</h5>
                    <div className="d-flex align-items-center mb-4">
                      <span className="bg-light border avatar avatar-lg text-gray-9 flex-shrink-0 me-3">
                        <i className="isax isax-briefcase" />
                      </span>
                      <div>
                        <h6 className="mb-1">
                          Web Design &amp; Development Team Leader
                        </h6>
                        <p>Creative Agency - (2013 - 2016)</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="bg-light border avatar avatar-lg text-gray-9 flex-shrink-0 me-3">
                        <i className="isax isax-briefcase" />
                      </span>
                      <div>
                        <h6 className="mb-1">Project Manager</h6>
                        <p>CJobcy Technology Pvt.Ltd - (Present)</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card border-0">
                  <div className="card-body p-0">
                    <h5 className="mb-3">Courses</h5>
                    <Slider {...instructorDetailsSlider} className="course-carousal">
                      <div>
                        <div className="course-item course-item-three mx-2 mb-0">
                          <div className="course-carousal-img position-relative overflow-hidden rounded-3 mb-3">
                            <Link to={route.courseDetails}>
                              <ImageWithBasePath
                                className="img-fluid rounded-3"
                                src="./assets/img/course/course-02.jpg"
                                alt="img"
                              />
                            </Link>
                            <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2">
                              <Link className="like" to="#">
                                <i className="isax isax-heart color-active" />
                              </Link>
                            </div>
                          </div>
                          <div className="d-flex flex-wrap align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm rounded-circle">
                                <ImageWithBasePath
                                  className="img-fluid rounded-circle object-fit-cover"
                                  src="./assets/img/avatar/avatar2.jpg"
                                  alt="img"
                                />
                              </div>
                              <p className="ms-2">
                                <Link to={route.instructorDetails}>Ana Reyes</Link>
                              </p>
                            </div>
                            <span className="tag-btn">Wordpress</span>
                          </div>
                          <h5 className="mt-3 mb-2 text-truncate line-clamb-2">
                            <Link to={route.courseDetails}>
                              Wordpress for Beginners - Master Wordpress Quickly
                            </Link>
                          </h5>
                          <div className="d-flex align-items-center">
                            <i className="ti ti-star-filled text-warning" />
                            <p className="ms-2">4.4 (160 Reviews)</p>
                          </div>
                          <div className="d-flex justify-content-between mt-3 align-items-center">
                            <h6 className="fs-16 text-secondary">$140</h6>
                            <Link
                              to={route.courseGrid}
                              className="btn view-course-btn"
                            >
                              View Course
                              <i className="fs-8 fas fa-angle-right ms-2" />
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="course-item course-item-three mx-2 mb-0">
                          <div className="course-carousal-img position-relative overflow-hidden rounded-3 mb-3">
                            <Link to={route.courseDetails}>
                              <ImageWithBasePath
                                className="img-fluid rounded-3"
                                src="./assets/img/course/course-03.jpg"
                                alt="img"
                              />
                            </Link>
                            <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2">
                              <Link className="like" to="#">
                                <i className="isax isax-heart color-active" />
                              </Link>
                            </div>
                          </div>
                          <div className="d-flex flex-wrap align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm rounded-circle">
                                <ImageWithBasePath
                                  className="img-fluid rounded-circle object-fit-cover"
                                  src="./assets/img/avatar/avatar3.jpg"
                                  alt="img"
                                />
                              </div>
                              <p className="ms-2">
                                <Link to={route.instructorDetails}>
                                  Andrew Pirtle
                                </Link>
                              </p>
                            </div>
                            <span className="tag-btn">Design</span>
                          </div>
                          <h5 className="mt-3 mb-2 text-truncate line-clamb-2">
                            <Link to={route.courseDetails}>
                              Sketch from A to Z (2024): Become an app designer
                            </Link>
                          </h5>
                          <div className="d-flex align-items-center">
                            <i className="ti ti-star-filled text-warning" />
                            <p className="ms-2">4.6 (170 Reviews)</p>
                          </div>
                          <div className="d-flex justify-content-between mt-3 align-items-center">
                            <h6 className="fs-16 text-secondary">$160</h6>
                            <Link
                              to={route.courseGrid}
                              className="btn view-course-btn"
                            >
                              View Course
                              <i className="fs-8 fas fa-angle-right ms-2" />
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="course-item course-item-three mx-2 mb-0">
                          <div className="course-carousal-img position-relative overflow-hidden rounded-3 mb-3">
                            <Link to={route.courseDetails}>
                              <ImageWithBasePath
                                className="img-fluid rounded-3"
                                src="./assets/img/course/course-04.jpg"
                                alt="img"
                              />
                            </Link>
                            <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2">
                              <Link className="like" to="#">
                                <i className="isax isax-heart color-active" />
                              </Link>
                            </div>
                          </div>
                          <div className="d-flex flex-wrap align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm rounded-circle">
                                <ImageWithBasePath
                                  className="img-fluid rounded-circle object-fit-cover"
                                  src="./assets/img/avatar/avatar4.jpg"
                                  alt="img"
                                />
                              </div>
                              <p className="ms-2">
                                <Link to={route.instructorDetails}>Christy</Link>
                              </p>
                            </div>
                            <span className="tag-btn">Programming</span>
                          </div>
                          <h5 className="mt-3 mb-2">
                            <Link
                              to={route.courseDetails}
                              className=" text-truncate line-clamb-2"
                            >
                              Build Responsive Real World Websites with Crash
                              Course
                            </Link>
                          </h5>
                          <div className="d-flex align-items-center">
                            <i className="ti ti-star-filled text-warning" />
                            <p className="ms-2">4.2 (220 Reviews)</p>
                          </div>
                          <div className="d-flex justify-content-between mt-3 align-items-center">
                            <h6 className="fs-16 text-secondary">$200</h6>
                            <Link
                              to={route.courseGrid}
                              className="btn view-course-btn"
                            >
                              View Course
                              <i className="fs-8 fas fa-angle-right ms-2" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Slider>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="mb-3">Certifications</h5>
                    <div className="d-flex align-items-center">
                      <div className="certificate-img rounded-circle me-2">
                        <ImageWithBasePath
                          src="assets/img/certificates/certificate-01.svg"
                          alt="img"
                          className="img-fluid"
                        />
                      </div>
                      <div className="certificate-img rounded-circle me-2">
                        <ImageWithBasePath
                          src="assets/img/certificates/certificate-02.svg"
                          alt="img"
                          className="img-fluid"
                        />
                      </div>
                      <div className="certificate-img rounded-circle me-2">
                        <ImageWithBasePath
                          src="assets/img/certificates/certificate-03.svg"
                          alt="img"
                          className="img-fluid"
                        />
                      </div>
                      <div className="certificate-img rounded-circle">
                        <ImageWithBasePath
                          src="assets/img/certificates/certificate-01.svg"
                          alt="img"
                          className="img-fluid"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <h5 className="mb-3">Contact Details</h5>
                    <div className="d-flex align-items-center mb-4">
                      <span className="contact-icon rounded-circle d-flex align-items-center justify-content-center me-3">
                        <i className="fa-regular fa-envelope" />
                      </span>
                      <div>
                        <h6 className="mb-0">Email</h6>
                        <p className="mb-0">jennywilson@example.com</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-4">
                      <span className="contact-icon rounded-circle d-flex align-items-center justify-content-center me-3">
                        <i className="isax isax-location" />
                      </span>
                      <div>
                        <h6 className="fs-16 fw-medium text-gray-9 mb-0">
                          Address
                        </h6>
                        <p className="mb-0 text-truncate">
                          877 Ferry Street, Huntsville, Alabama
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="contact-icon rounded-circle d-flex align-items-center justify-content-center me-3">
                        <i className="isax isax-call" />
                      </span>
                      <div>
                        <h6 className="fs-16 fw-medium text-gray-9 mb-0">
                          Phone
                        </h6>
                        <p className="mb-0">+1(452) 125-6789</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Instructor */}
     
    </>
  );
};

export default InstructorDetails;
