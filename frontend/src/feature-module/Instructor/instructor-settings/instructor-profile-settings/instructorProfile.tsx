import React from "react";
import Breadcrumb from "../../../../core/common/Breadcrumb/breadcrumb";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import ProfileCard from "../../common/profileCard";
import InstructorSidebar from "../../common/instructorSidebar";
import InstructorSettingsLink from "../settings-link/instructorSettingsLink";
import { Link } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import { DatePicker } from "antd";

const InstructorProfileSettings = () => {
  const route = all_routes;
  const getModalContainer = () => {
    const modalElement = document.getElementById("add_assignment");
    return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
  };

  return (
    <>
      <Breadcrumb title="My Profile" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            {/* Sidebar */}
            <InstructorSidebar />
            {/* /Sidebar */}
            <div className="col-lg-9">
              <div className="mb-3">
                <h5>Settings</h5>
              </div>
              <InstructorSettingsLink />
              <form>
                <div className="card">
                  <div className="card-body">
                    <div className="profile-upload-group">
                      <div className="d-flex align-items-center">
                        <Link
                          to={route.studentProfile}
                          className="avatar flex-shrink-0 avatar-xxxl avatar-rounded border me-3"
                        >
                          <ImageWithBasePath
                            src="assets/img/user/user-01.jpg"
                            alt="Img"
                            className="img-fluid"
                          />
                        </Link>
                        <div className="profile-upload-head">
                          <h6>
                            <Link to={route.studentProfile}>Your Avatar</Link>
                          </h6>
                          <p className="fs-14 mb-0">
                            PNG or JPG no bigger than 800px width and height
                          </p>
                          <div className="new-employee-field">
                            <div className="d-flex align-items-center mt-2">
                              <div className="image-upload position-relative mb-0 me-2">
                                <input type="file" />
                                <Link
                                  to="#"
                                  className="btn bg-gray-100 btn-sm rounded-pill image-uploads"
                                >
                                  Upload
                                </Link>
                              </div>
                              <div className="img-delete">
                                <Link
                                  to="#"
                                  className="btn btn-secondary btn-sm rounded-pill"
                                >
                                  Delete
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="edit-profile-info mb-3">
                        <h5 className="mb-1 fs-18">Personal Details</h5>
                        <p>Edit your personal information</p>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              First Name <span className="text-danger"> *</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="Eugene"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Last Name <span className="text-danger"> *</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="Andre"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              User Name <span className="text-danger"> *</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="instructordemo"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Phone Number{" "}
                              <span className="text-danger"> *</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="90154-91036"
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-4">
                            <label className="form-label">
                              Bio <span className="text-danger"> *</span>
                            </label>
                            <textarea
                              rows={4}
                              className="form-control"
                              defaultValue={
                                "I am a web developer with a vast array of knowledge in many different front end and back end languages, responsive frameworks, databases, and best code practices."
                              }
                            />
                          </div>
                        </div>
                        <div className="mt-3 mb-3">
                          <h5 className="mb-1 fs-18">Educational Details</h5>
                          <p>Edit your Educational information</p>
                        </div>
                        <div className="col-md-12">
                          <div className="row">
                            <div className="col-xl-7">
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label">
                                      Degree
                                      <span className="text-danger"> *</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue=""
                                    />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label">
                                      University
                                      <span className="text-danger"> *</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue=""
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-xl-5">
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label">
                                      From Date
                                      <span className="text-danger"> *</span>
                                    </label>
                                    <div className="input-icon position-relative calender-input">
                                      <span className="input-icon-addon">
                                        <i className="isax isax-calendar z-1" />
                                      </span>
                                      <DatePicker
                                        className="form-control datetimepicker"
                                        getPopupContainer={getModalContainer}
                                        placeholder="dd/mm/yyyy"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label">
                                      To Date
                                      <span className="text-danger"> *</span>
                                    </label>
                                    <div className="input-icon position-relative calender-input">
                                      <span className="input-icon-addon calender-input">
                                        <i className="isax isax-calendar z-1" />
                                      </span>
                                      <DatePicker
                                        className="form-control datetimepicker"
                                        getPopupContainer={getModalContainer}
                                        placeholder="dd/mm/yyyy"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Link
                            to="#"
                            className="d-inline-flex align-items-center text-secondary fw-medium mb-3"
                            id="add-new-topic-btn"
                          >
                            <i className="isax isax-add me-1" /> Add New
                          </Link>
                        </div>
                        <div className="mt-3 mb-3">
                          <h5 className="mb-1 fs-18">Experience</h5>
                          <p>Edit your Experience</p>
                        </div>
                        <div className="col-md-12">
                          <div className="row">
                            <div className="col-xl-7">
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label">
                                      Company
                                      <span className="text-danger"> *</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue=""
                                    />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label">
                                      Position
                                      <span className="text-danger"> *</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue=""
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-xl-5">
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label">
                                      From Date
                                      <span className="text-danger"> *</span>
                                    </label>
                                    <div className="input-icon position-relative calender-input">
                                      <span className="input-icon-addon">
                                        <i className="isax isax-calendar z-1" />
                                      </span>
                                      <DatePicker
                                        className="form-control datetimepicker"
                                        getPopupContainer={getModalContainer}
                                        placeholder="dd/mm/yyyy"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label">
                                      To Date
                                      <span className="text-danger"> *</span>
                                    </label>
                                    <div className="input-icon position-relative calender-input">
                                      <span className="input-icon-addon calender-input">
                                        <i className="isax isax-calendar z-1" />
                                      </span>
                                      <DatePicker
                                        className="form-control datetimepicker"
                                        getPopupContainer={getModalContainer}
                                        placeholder="dd/mm/yyyy"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Link
                            to="#"
                            className="d-inline-flex align-items-center text-secondary fw-medium mb-3"
                            id="add-new-topic-btn2"
                          >
                            <i className="isax isax-add me-1" /> Add New
                          </Link>
                        </div>
                        <div className="col-md-12">
                          <button
                            className="btn btn-secondary rounded-pill"
                            type="submit"
                          >
                            Update Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card mb-0">
                  <div className="card-body">
                    <h5 className="fs-18 mb-3">Delete Account</h5>
                    <h6 className="mb-1">
                      Are you sure you want to delete your account?
                    </h6>
                    <p className="mb-3">
                      Refers to the action of permanently removing a user's
                      account and associated data from a system, service and
                      platform.
                    </p>
                    <Link
                      to="#"
                      className="btn btn-secondary"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_account"
                    >
                      Delete Account
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorProfileSettings;
