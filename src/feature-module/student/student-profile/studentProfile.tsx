import React from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import StudentSidebar from "../common/studentSidebar";

const StudentProfile = () => {

    const route = all_routes;

  return (
    <>
      <Breadcrumb title="My Profile" />

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
                    <ImageWithBasePath src="assets/img/user/user-02.jpg" alt="" />
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
            <StudentSidebar/>
            {/* sidebar */}
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5 className="fw-bold">My Profile</h5>
                <Link to="#" className="edit-profile-icon">
                  <i className="isax isax-edit-2" />
                </Link>
              </div>
              <div className="card mb-0">
                <div className="card-body">
                  <h6 className="fs-18 page-title fw-bold">
                    Basic Information
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>First Name</h6>
                        <span>Ronald</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Last Name</h6>
                        <span>Richard</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Registration Date</h6>
                        <span>16 Jan 2024, 11:15 AM</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>User Name</h6>
                        <span>studentdemo</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Phone Number</h6>
                        <span>90154-91036</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Email</h6>
                        <span>studentdemo@example.com</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Gender</h6>
                        <span>Male</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>DOB</h6>
                        <span>16 Jan 2020</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <h6>Age</h6>
                        <span>24</span>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div>
                        <h6>Bio</h6>
                        <span>
                          Hello! I'm Ronald Richard. I'm passionate about
                          developing innovative software solutions, analyzing
                          classic literature. I aspire to become a software
                          developer, work as an editor. In my free time, I enjoy
                          coding, reading, hiking etc.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentProfile;
