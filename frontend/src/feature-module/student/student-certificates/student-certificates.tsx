import React from "react";
import { all_routes } from "../../router/all_routes";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import StudentSidebar from "../common/studentSidebar";

const StudentCertificates = () => {
  const route = all_routes;

  return (
    <>
      <Breadcrumb title="My Certificates" />

      <div className="content">
        <div className="container">
          {/* Profile */}
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
                        to={route.studentProfile}
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
          {/* /Profile */}
          <div className="row">
            {/* Sidebar */}
            <StudentSidebar />
            {/* sidebar */}
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5>My Certificates</h5>
              </div>
              <div className="table-responsive custom-table">
                <table className="table">
                  <thead className="thead-light">
                    <tr>
                      <th>ID</th>
                      <th>Certificate Name</th>
                      <th>Date</th>
                      <th>Marks</th>
                      <th>Out of</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>01</td>
                      <td>
                        <Link to="#" className="fw-semibold">
                          UI/UX Design Certificate
                        </Link>
                      </td>
                      <td>22 Aug 2025</td>
                      <td>20</td>
                      <td>20</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="d-inline-flex fs-14 me-1 action-icon"
                            data-bs-toggle="modal"
                            data-bs-target="#view_certificate"
                          >
                            <i className="isax isax-eye" />
                          </Link>
                          <Link
                            to="#"
                            className="d-inline-flex fs-14 action-icon"
                          >
                            <i className="isax isax-import" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>02</td>
                      <td>
                        <Link to="#" className="fw-semibold">
                          Wordpress Certificate
                        </Link>
                      </td>
                      <td>10 Aug 2025</td>
                      <td>18</td>
                      <td>20</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="d-inline-flex fs-14 me-1 action-icon"
                            data-bs-toggle="modal"
                            data-bs-target="#view_certificate"
                          >
                            <i className="isax isax-eye" />
                          </Link>
                          <Link
                            to="#"
                            className="d-inline-flex fs-14 action-icon"
                          >
                            <i className="isax isax-import" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>03</td>
                      <td>
                        <Link to="#" className="fw-semibold">
                          HTML CSS Certificate
                        </Link>
                      </td>
                      <td>26 Jul 2025</td>
                      <td>25</td>
                      <td>30</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="d-inline-flex fs-14 me-1 action-icon"
                            data-bs-toggle="modal"
                            data-bs-target="#view_certificate"
                          >
                            <i className="isax isax-eye" />
                          </Link>
                          <Link
                            to="#"
                            className="d-inline-flex fs-14 action-icon"
                          >
                            <i className="isax isax-import" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>04</td>
                      <td>
                        <Link to="#" className="fw-semibold">
                          JavaScript Certificate
                        </Link>
                      </td>
                      <td>14 Jul 2025</td>
                      <td>15</td>
                      <td>20</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="d-inline-flex fs-14 me-1 action-icon"
                            data-bs-toggle="modal"
                            data-bs-target="#view_certificate"
                          >
                            <i className="isax isax-eye" />
                          </Link>
                          <Link
                            to="#"
                            className="d-inline-flex fs-14 action-icon"
                          >
                            <i className="isax isax-import" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>05</td>
                      <td>
                        <Link to="#" className="fw-semibold">
                          Photoshop Certificate
                        </Link>
                      </td>
                      <td>19 Jun 2025</td>
                      <td>20</td>
                      <td>30</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="d-inline-flex fs-14 me-1 action-icon"
                            data-bs-toggle="modal"
                            data-bs-target="#view_certificate"
                          >
                            <i className="isax isax-eye" />
                          </Link>
                          <Link
                            to="#"
                            className="d-inline-flex fs-14 action-icon"
                          >
                            <i className="isax isax-import" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>06</td>
                      <td>
                        <Link to="#" className="fw-semibold">
                          Python Certificate
                        </Link>
                      </td>
                      <td>12 Jun 2025</td>
                      <td>20</td>
                      <td>20</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="d-inline-flex fs-14 me-1 action-icon"
                            data-bs-toggle="modal"
                            data-bs-target="#view_certificate"
                          >
                            <i className="isax isax-eye" />
                          </Link>
                          <Link
                            to="#"
                            className="d-inline-flex fs-14 action-icon"
                          >
                            <i className="isax isax-import" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Certificate */}
      <div className="modal fade" id="view_certificate">
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5>View Certificate</h5>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="isax isax-close-circle5" />
              </button>
            </div>
            <div className="modal-body">
              <div>
                <ImageWithBasePath
                  src="assets/img/icon/certificate.svg"
                  className="img-fluid"
                  alt=""
                />
              </div>
              <div className="text-end mt-4">
                <Link to="#" className="btn btn-secondary rounded-pill">
                  <i className="isax isax-import me-2" />
                  Download
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /View Certificate */}
    </>
  );
};

export default StudentCertificates;
