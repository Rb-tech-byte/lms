import React, { useState } from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import StudentSidebar from "../common/studentSidebar";
import { all_routes } from "../../router/all_routes";


const StudentCourse = () => {

  const route = all_routes;

  
    const [selectedItems, setSelectedItems] = useState(Array(10).fill(false));
    const handleItemClick = (index: number) => {
        setSelectedItems((prevSelectedItems) => {
            const updatedSelectedItems = [...prevSelectedItems];
            updatedSelectedItems[index] = !updatedSelectedItems[index];
            return updatedSelectedItems;
        });
    };

  return (
    <>
      <Breadcrumb title="Enrolled Courses" />

      <div className="content">
        <div className="container">
          {/* profile box */}
          <div className="profile-card overflow-hidden bg-blue-gradient2 mb-5 p-5">
            <div className="profile-card-bg">
              <ImageWithBasePath
                src="assets/img/bg/card-bg-01.png"
                className="profile-card-bg-1"
                alt=""
              />
            </div>
            <div className="row align-items-center row-gap-3">
              <div className="col-lg-6">
                <div className="d-flex align-items-center">
                  <span className="avatar avatar-xxl avatar-rounded me-3 border border-white border-2 position-relative">
                    <ImageWithBasePath
                      src="assets/img/user/user-02.jpg"
                      alt=""
                    />
                    <span className="verify-tick">
                      <i className="isax isax-verify5" />
                    </span>
                  </span>
                  <div>
                    <h5 className="mb-1 text-white d-inline-flex align-items-center">
                      Ronald Richard
                      <Link
                        to={route.instructorProfile}
                        className="link-light fs-16 ms-2"
                      >
                        <i className="isax isax-edit-2" />
                      </Link>
                    </h5>
                    <p className="text-light">Student</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="d-flex align-items-center justify-content-lg-end flex-wrap gap-2">
                  <Link
                    to={route.becomeAnInstructor}
                    className="btn btn-white rounded-pill me-3"
                  >
                    Become an Instructor
                  </Link>
                  <Link
                    to={route.instructorDashboard}
                    className="btn btn-secondary rounded-pill"
                  >
                    Instructor Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* profile box */}
          <div className="row">
            {/* sidebar */}
            <StudentSidebar />
            {/* sidebar */}
            <div className="col-lg-9">
              <div className="page-title d-flex flex-wrap gap-3 align-items-center justify-content-between">
                <h5>Enrolled Courses</h5>
                <div className="tab-list">
                  <ul className="nav mb-0 gap-2" role="tablist">
                    <li className="nav-item mb-0" role="presentation">
                      <Link
                        to="#"
                        className="active"
                        data-bs-toggle="tab"
                        data-bs-target="#enroll-courses"
                        aria-selected="true"
                        role="tab"
                      >
                        Enrolled (09)
                      </Link>
                    </li>
                    <li className="nav-item mb-0" role="presentation">
                      <Link
                        to="#"
                        data-bs-toggle="tab"
                        data-bs-target="#active-courses"
                        aria-selected="false"
                        role="tab"
                        className=""
                        tabIndex={-1}
                      >
                        Active (06)
                      </Link>
                    </li>
                    <li className="nav-item mb-0" role="presentation">
                      <Link
                        to="#"
                        data-bs-toggle="tab"
                        data-bs-target="#complete-courses"
                        aria-selected="false"
                        role="tab"
                        className=""
                        tabIndex={-1}
                      >
                        Completed (03)
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="tab-content">
                <div
                  className="tab-pane fade active show"
                  id="enroll-courses"
                  role="tabpanel"
                >
                  <div className="row">
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-01.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={1} onClick={() => handleItemClick(1)}>
                            <div className="badge text-bg-danger">15% off</div>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[1]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-29.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Brenda Slaton
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Design
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Information About UI/UX Design Degree
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.9 (200 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$120</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-02.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3"  key={2} onClick={() => handleItemClick(2)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[2]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-30.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Ana Reyes
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Wordpress
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Wordpress for Beginners - Master Wordpress Quickly
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (160 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$140</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-03.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={3} onClick={() => handleItemClick(3)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[3]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-31.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Andrew Pirtle
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Design
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Sketch from A to Z (2024): Become an app designer
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (160 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$140</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-04.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={4} onClick={() => handleItemClick(4)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[4]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-32.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Christy Garner
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Programming
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Build Responsive Real World Websites with Crash
                              Course
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.2 (220 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$200</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-05.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={5} onClick={() => handleItemClick(5)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[5]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-32.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Justin Gregory
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Programming
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Learn JavaScript and Express to become a Expert
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (180 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$130</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-06.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={6} onClick={() => handleItemClick(6)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[6]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-33.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Carolyn Hines
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Programming
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Introduction to Python Programming
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (180 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$130</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-07.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={7} onClick={() => handleItemClick(7)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[7]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-34.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Rafael Miller
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Programming
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Build Responsive Websites with HTML5 and CSS3
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (180 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$170</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-08.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={8} onClick={() => handleItemClick(8)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[8]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-35.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Nancy Duarte
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Design
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Information About Photoshop Design Degree
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (180 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$170</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-09.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={9} onClick={() => handleItemClick(9)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[9]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-36.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  James Kagan
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Design
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              C# Developers Double Your Coding with Visual
                              Studio
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (180 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$180</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="active-courses"
                  role="tabpanel"
                >
                  <div className="row">
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-01.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={10} onClick={() => handleItemClick(10)}>
                            <div className="badge text-bg-danger">15% off</div>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[10]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-29.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Brenda Slaton
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Design
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Information About UI/UX Design Degree
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.9 (200 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$120</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-02.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={11} onClick={() => handleItemClick(11)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[11]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-30.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Ana Reyes
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Wordpress
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Wordpress for Beginners - Master Wordpress Quickly
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (160 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$140</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-03.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={12} onClick={() => handleItemClick(12)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[12]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-31.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Andrew Pirtle
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Design
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Sketch from A to Z (2024): Become an app designer
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (160 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$140</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-04.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={13} onClick={() => handleItemClick(13)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[13]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-32.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Christy Garner
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Programming
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Build Responsive Real World Websites with Crash
                              Course
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.2 (220 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$200</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-05.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={14} onClick={() => handleItemClick(14)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[14]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-32.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Justin Gregory
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Programming
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Learn JavaScript and Express to become a Expert
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (180 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$130</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-06.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={15} onClick={() => handleItemClick(15)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[15]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-33.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Carolyn Hines
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Programming
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Introduction to Python Programming
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (180 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$130</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="complete-courses"
                  role="tabpanel"
                >
                  <div className="row">
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-04.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={16} onClick={() => handleItemClick(16)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[16]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-32.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Christy Garner
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Programming
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Build Responsive Real World Websites with Crash
                              Course
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.2 (220 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$200</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-05.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={17} onClick={() => handleItemClick(17)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[17]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-32.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Justin Gregory
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Programming
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Learn JavaScript and Express to become a Expert
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (180 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$130</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-4 col-md-6">
                      <div className="course-item-two course-item mx-0">
                        <div className="course-img">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              src="assets/img/course/course-06.jpg"
                              alt="img"
                              className="img-fluid"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3" key={18} onClick={() => handleItemClick(18)}>
                            <Link to="#" className={`fav-icon ms-auto ${selectedItems[18]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                              <Link
                                to={route.instructorDetails}
                                className="avatar avatar-sm"
                              >
                                <ImageWithBasePath
                                  src="assets/img/user/user-33.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />
                              </Link>
                              <div className="ms-2">
                                <Link
                                  to={route.instructorDetails}
                                  className="link-default fs-14"
                                >
                                  Carolyn Hines
                                </Link>
                              </div>
                            </div>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              Programming
                            </span>
                          </div>
                          <h6 className="title mb-2">
                            <Link to={route.courseDetails}>
                              Introduction to Python Programming
                            </Link>
                          </h6>
                          <p className="d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star text-warning me-2" />
                            4.4 (180 Reviews)
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0">$130</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              View Course
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /pagination */}
              <div className="row align-items-center mt-2">
                <div className="col-md-2">
                  <p className="pagination-text">Page 1 of 2</p>
                </div>
                <div className="col-md-10">
                  <ul className="pagination lms-page justify-content-center justify-content-md-end mt-2 mt-md-0">
                    <li className="page-item prev">
                      <Link
                        className="page-link"
                        to="#"
                        tabIndex={-1}
                      >
                        <i className="fas fa-angle-left" />
                      </Link>
                    </li>
                    <li className="page-item first-page active">
                      <Link className="page-link" to="#">
                        1
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        2
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        3
                      </Link>
                    </li>
                    <li className="page-item next">
                      <Link className="page-link" to="#">
                        <i className="fas fa-angle-right" />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              {/* /pagination */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentCourse;
