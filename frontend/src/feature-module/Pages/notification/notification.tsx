import React from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";

const Notification = () => {

    const route = all_routes;

  return (
    <>
      <Breadcrumb title="Notifications" />

      {/* Notifications */}
      <div className="content">
        <div className="container">
          <div className="notification-content">
            <div className="notification-head">
              <div className="row align-items-center row-gap-3">
                <div className="col-lg-8">
                  <h2 className="fs-32 fw-bold">Notifications</h2>
                  <p>
                    Improve the way your work, discover a brand new tool and
                    drop the hassle once and for all.
                  </p>
                </div>
                <div className="col-lg-4">
                  <div className="d-flex justify-content-end">
                    <Link
                      to="#"
                      className="btn mark-all-btn btn-light rounded-pill me-2"
                    >
                      <i className="isax isax-tick-square me-2" /> Mark All as
                      Read
                    </Link>
                    <Link
                      to="#"
                      className="btn delete-all-btn btn-secondary rounded-pill"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_all_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="">
                <h6 className="fs-18 fw-semibold mb-3">Today</h6>
                <div className="notification-item mb-3">
                  <div className="row row-gap-3">
                    <div className="col-md-10">
                      <div className="d-flex align-items-center">
                        <Link
                          to={route.studentsDetails}
                          className="rounded-circle me-2"
                        >
                          <ImageWithBasePath
                            src="assets/img/user/user-11.jpg"
                            alt="img"
                            className="img-fluid rounded-circle"
                          />
                        </Link>
                        <div>
                          <Link
                            to={route.studentsDetails}
                            className="text-gray-5 fs-16 mb-0"
                          >
                            <span className="name-highlight">
                              Thompson Hicks
                            </span>{" "}
                            enroll a new course on Programming
                          </Link>
                          <p className="text-gray-5 fs-16 mb-0">05 mins ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 d-flex align-items-center justify-content-end">
                      <Link
                        to="#"
                        className="btn btn-delete-hidden rounded-pill"
                        data-bs-toggle="modal"
                        data-bs-target="#delete_modal"
                      >
                        <i className="isax isax-trash me-1" /> Delete
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="notification-item mb-3">
                  <div className="row">
                    <div className="col-md-10">
                      <div className="d-flex align-items-center">
                        <Link
                          to={route.studentsDetails}
                          className="rounded-circle me-2"
                        >
                          <ImageWithBasePath
                            src="assets/img/user/user-12.jpg"
                            alt="img"
                            className="img-fluid rounded-circle"
                          />
                        </Link>
                        <div>
                          <Link
                            to={route.studentsDetails}
                            className="text-gray-5 fs-16 mb-0"
                          >
                            <span className="name-highlight">
                              Jennifer Tovar
                            </span>{" "}
                            has submitted their assignment for UI/UX Course.
                          </Link>
                          <p className="text-gray-5 fs-16 mb-0">10 mins ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 d-flex align-items-center justify-content-end">
                      <Link
                        to="#"
                        className="btn btn-delete-hidden rounded-pill"
                        data-bs-toggle="modal"
                        data-bs-target="#delete_modal"
                      >
                        <i className="isax isax-trash me-1" /> Delete
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <h6 className="fs-18 fw-semibold mb-3">Yesterday</h6>
                <div className="notification-item mb-3">
                  <div className="row">
                    <div className="col-md-10">
                      <div className="d-flex align-items-center">
                        <Link
                          to={route.studentsDetails}
                          className="rounded-circle me-2"
                        >
                          <ImageWithBasePath
                            src="assets/img/user/user-13.jpg"
                            alt="img"
                            className="img-fluid rounded-circle"
                          />
                        </Link>
                        <div>
                          <Link
                            to={route.studentsDetails}
                            className="text-gray-5 fs-16 mb-0"
                          >
                            <span className="name-highlight">
                              James Schulte{" "}
                            </span>
                            has requested feedback for their assignment in
                            WordPress Course
                          </Link>
                          <p className="text-gray-5 fs-16 mb-0">20 Dec 2024</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 d-flex align-items-center justify-content-end">
                      <Link
                        to="#"
                        className="btn btn-delete-hidden rounded-pill"
                        data-bs-toggle="modal"
                        data-bs-target="#delete_modal"
                      >
                        <i className="isax isax-trash me-1" /> Delete
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="notification-item mb-3">
                  <div className="row">
                    <div className="col-md-10">
                      <div className="d-flex align-items-center">
                        <Link
                          to={route.studentsDetails}
                          className="rounded-circle me-2"
                        >
                          <ImageWithBasePath
                            src="assets/img/user/user-14.jpg"
                            alt="img"
                            className="img-fluid rounded-circle"
                          />
                        </Link>
                        <div>
                          <Link
                            to={route.studentsDetails}
                            className="text-gray-5 fs-16 mb-0"
                          >
                            You have a new message from{" "}
                            <span className="name-highlight">
                              William Aragon
                            </span>{" "}
                            regarding HTML Course.
                          </Link>
                          <p className="text-gray-5 fs-16 mb-0">05 mins ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 d-flex align-items-center justify-content-end">
                      <Link
                        to="#"
                        className="btn btn-delete-hidden rounded-pill"
                        data-bs-toggle="modal"
                        data-bs-target="#delete_modal"
                      >
                        <i className="isax isax-trash me-1" /> Delete
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="row">
                    <div className="col-md-10">
                      <div className="d-flex align-items-center">
                        <Link
                          to={route.studentsDetails}
                          className="rounded-circle me-2"
                        >
                          <ImageWithBasePath
                            src="assets/img/user/user-15.jpg"
                            alt="img"
                            className="img-fluid rounded-circle"
                          />
                        </Link>
                        <div>
                          <Link
                            to={route.studentsDetails}
                            className="text-gray-5 fs-16 mb-0"
                          >
                            <span className="name-highlight">Shirley Lis</span>{" "}
                            has completed Quiz in WordPress Course with a score
                            of 80%
                          </Link>
                          <p className="text-gray-5 fs-16 mb-0">05 mins ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-2 d-flex align-items-center justify-content-end">
                      <Link
                        to="#"
                        className="btn btn-delete-hidden rounded-pill"
                        data-bs-toggle="modal"
                        data-bs-target="#delete_modal"
                      >
                        <i className="isax isax-trash me-1" /> Delete
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Notifications */}
    </>
  );
};

export default Notification;
