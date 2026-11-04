import React, { useState, useEffect } from "react";
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
import { useAuth } from "../../../core/auth/authContext";

const StudentSettings: React.FC = () => {
  const route = all_routes;
  const { user, updateUser } = useAuth();
  const nameParts = (user?.name || "Baraka Mkwawa").split(" ");
  const defaultFirst = nameParts[0] || "Baraka";
  const defaultLast = nameParts.slice(1).join(" ") || "Mkwawa";

  const [firstName, setFirstName] = useState(defaultFirst);
  const [lastName, setLastName] = useState(defaultLast);
  const [phone, setPhone] = useState(user?.phone || "+255 712 345 678");
  const [email, setEmail] = useState(user?.email || "student@out.ac.tz");
  const [bio, setBio] = useState(
    "Undergraduate scholar studying at the Open University of Tanzania (OUT). Focused on algorithms, software architecture, and corporate finance."
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const parts = user.name.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateUser) {
      updateUser({
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
      });
    }
    setSuccessMsg("Academic profile updated successfully! Settings synchronized.");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const getModalContainer = () => {
    const modalElement = document.getElementById("add_assignment");
    return modalElement ? modalElement : document.body;
  };

  return (
    <>
      <Breadcrumb title="Account Settings" />
      <div className="content">
        <div className="container">
          {/* Dynamic Profile Header */}
          <ProfileCard />

          <div className="row">
            {/* Student Sidebar */}
            <StudentSidebar />

            <div className="col-lg-9">
              <div className="mb-3">
                <h5 className="fs-20 fw-bold text-dark">Student Account Settings</h5>
              </div>

              <SettingsLinks />

              {successMsg && (
                <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
                  <i className="isax isax-tick-circle fs-18" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="profile-upload-group mb-4 pb-4 border-bottom">
                      <div className="d-flex align-items-center">
                        <Link
                          to={route.studentProfile}
                          className="avatar flex-shrink-0 avatar-xxxl avatar-rounded border me-3 overflow-hidden"
                        >
                          <ImageWithBasePath
                            src={user?.avatar || "assets/img/user/user-02.jpg"}
                            alt={user?.name || "Student"}
                            className="img-fluid"
                          />
                        </Link>
                        <div className="profile-upload-head">
                          <h6 className="fw-bold mb-1">
                            <Link to={route.studentProfile} className="text-dark text-decoration-none">
                              {user?.name || "Baraka Mkwawa"}
                            </Link>
                          </h6>
                          <p className="fs-14 text-muted mb-2">
                            OUT Student Registration: <strong>{(user as any)?.regNumber || "OUT/2024/04812"}</strong>
                          </p>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-1">
                              Enrolled Scholar
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="edit-profile-info mb-4">
                        <h5 className="mb-1 fs-17 fw-bold text-dark">Personal Academic Details</h5>
                        <p className="text-muted small mb-0">Update your student information on the OUT portal</p>
                      </div>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <div>
                            <label className="form-label small fw-semibold">
                              First Name <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div>
                            <label className="form-label small fw-semibold">
                              Last Name <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div>
                            <label className="form-label small fw-semibold">
                              OUT Student Email <span className="text-danger">*</span>
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div>
                            <label className="form-label small fw-semibold">
                              Phone Number <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div>
                            <label className="form-label small fw-semibold">Gender</label>
                            <CustomSelect
                              options={Gender}
                              className="select d-flex"
                              placeholder="Select Gender"
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div>
                            <label className="form-label small fw-semibold">Date of Birth</label>
                            <div className="input-icon-end position-relative">
                              <DatePicker
                                className="form-control datetimepicker w-100"
                                getPopupContainer={getModalContainer}
                                placeholder="DD/MM/YYYY"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div>
                            <label className="form-label small fw-semibold">Academic Bio</label>
                            <textarea
                              rows={4}
                              className="form-control"
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="col-md-12 pt-2">
                          <button className="btn btn-primary rounded-pill px-4" type="submit">
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Security & Account Protection Box */}
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="fs-17 fw-bold text-dark mb-2">Account Security & Protection</h5>
                  <p className="text-muted small mb-3">
                    Your OUT LMS authentication is secured with dynamic bearer token authorization.
                  </p>
                  <Link
                    to={route.studentChangePassword}
                    className="btn btn-outline-secondary rounded-pill px-4 btn-sm"
                  >
                    <i className="isax isax-lock me-1" />
                    Change Password
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
