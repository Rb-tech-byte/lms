import React from "react";
import { all_routes } from "../../router/all_routes";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";
import { Link } from "react-router-dom";
import SettingsLinks from "./settingsLinks/settingsLinks";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import CustomSelect from "../../../core/common/commonSelect";
import { Gender } from "../../../core/common/selectOption/json/selectOption";
import { DatePicker } from "antd";
import SettingsModal from "./settingsModal/settingsModal";

const StudentSettings = () => {
  const route = all_routes;

  const getModalContainer = () => {
    const modalElement = document.getElementById("add_assignment");
    return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
  };

  return (
    <>
      <Breadcrumb title="Settings" />
      <div className="content">
        <div className="container">
          {/* profile box */}
          <ProfileCard />
          {/* profile box */}
          <div className="row">
            {/* sidebar */}
            <StudentSidebar />
            {/* sidebar */}
            <div className="col-lg-9">
              <div className="mb-3">
                <h5>Settings</h5>
              </div>
              <SettingsLinks />
              <div className="card">
                <div className="card-body">
                  <form >
                    <div className="profile-upload-group">
                      <div className="d-flex align-items-center">
                        <Link
                          to={route.studentProfile}
                          className="avatar flex-shrink-0 avatar-xxxl avatar-rounded border me-3"
                        >
                          <ImageWithBasePath
                            src="assets/img/user/user-02.jpg"
                            alt="Img"
                            className="img-fluid"
                          />
                        </Link>
                        <div className="profile-upload-head">
                          <h6>
                            <Link to={route.studentProfile}>Profile Photo</Link>
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
                        <h5 className="mb-1">Personal Details</h5>
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
                              defaultValue="Ronald"
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
                              defaultValue="Richard"
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
                              defaultValue="studentdemo"
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
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Gender <span className="text-danger"> *</span>
                            </label>
                            <CustomSelect
                              options={Gender}
                              className="select d-flex"
                              placeholder="Select"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              DOB <span className="text-danger"> *</span>
                            </label>
                            <div className="input-icon-end position-relative">
                              <DatePicker
                                className="form-control datetimepicker"
                                getPopupContainer={getModalContainer}
                                placeholder="dd/mm/yyyy"
                              />
                              <span className="input-icon-addon">
                                <i className="isax isax-calendar" />
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Bio <span className="text-danger"> *</span>
                            </label>
                            <textarea
                              rows={4}
                              className="form-control"
                              defaultValue={
                                "Hello! I'm Ronald Richard. I'm passionate about developing innovative software solutions, analyzing classic literature. I aspire to become a software developer, work as an editor. In my free time, I enjoy coding, reading, hiking etc."
                              }
                            />
                          </div>
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
                  </form>
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
            </div>
          </div>
        </div>
      </div>
      <SettingsModal />
    </>
  );
};

export default StudentSettings;
