import React, { useEffect, useState } from "react";
import Breadcrumb from "../../../../core/common/Breadcrumb/breadcrumb";
import ProfileCard from "../../common/profileCard";
import InstructorSidebar from "../../common/instructorSidebar";
import InstructorSettingsLink from "../settings-link/instructorSettingsLink";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";

const hasNumber = (value: string): boolean => {
  return /[0-9]/.test(value);
};

const hasMixed = (value: string): boolean => {
  return /[a-z]/.test(value) && /[A-Z]/.test(value);
};

const hasSpecial = (value: string): boolean => {
  return /[!#@$%^&*)(+=._-]/.test(value);
};

const strengthColor = (count: number): string => {
  if (count < 1) return "poor";
  if (count < 2) return "weak";
  if (count < 3) return "strong";
  if (count < 4) return "heavy";
  return "poor"; // Default return to ensure it's always a string
};

const InstructorChangePassoword = () => {

  const [eye, setEye] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [validationError, setValidationError] = useState<number>(0);
  const [strength, setStrength] = useState<string>("");
  const [eyeConfirmPassword, setEyeConfirmPassword] = useState<boolean>(true);

  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const onEyeClick = () => {
    setEye((prev) => !prev);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setValidationError(1);
    } else if (value.length < 8) {
      setValidationError(2);
    } else if (!/[0-9]/.test(value)) {
      setValidationError(3);
    } else if (!/[!@#$%^&*()]/.test(value)) {
      setValidationError(4);
    } else {
      setValidationError(5);
    }
  };

  const messages = () => {
    switch (validationError) {
      case 2:
        return (
          <span
            id="poor"
            className="active mt-2"
            style={{ fontSize: 14, color: "#DC3545", marginTop: "8px" }}
          >
            <ImageWithBasePath
              src="assets/img/icon/angry.svg"
              className="me-2"
              alt=""
            />{" "}
            Weak. Must contain at least 8 characters
          </span>
        );
      case 3:
        return (
          <span
            id="weak"
            className="active  mt-2"
            style={{ fontSize: 14, color: "#FFC107", marginTop: "8px" }}
          >
            <ImageWithBasePath
              src="assets/img/icon/anguish.svg"
              className="me-2"
              alt=""
            />{" "}
            Average. Must contain at least 1 letter or number
          </span>
        );
      case 4:
        return (
          <span
            id="strong"
            className="active  mt-2"
            style={{ fontSize: 14, color: "#0D6EFD", marginTop: "8px" }}
          >
            <ImageWithBasePath
              src="assets/img/icon/smile.svg"
              className="me-2"
              alt=""
            />{" "}
            Almost. Must contain special symbol
          </span>
        );
      case 5:
        return (
          <span
            id="heavy"
            className="active  mt-2"
            style={{ fontSize: 14, color: "#4BB543", marginTop: "8px" }}
          >
            <ImageWithBasePath
              src="assets/img/icon/smile.svg"
              className="me-2"
              alt=""
            />{" "}
            Awesome! You have a secure password.
          </span>
        );
      default:
        return null;
    }
  };

  const strengthIndicator = (value: string): number => {
    let strengths = 0;
    if (value.length >= 8) strengths = 1;
    if (hasNumber(value) && value.length >= 8) strengths = 2;
    if (hasSpecial(value) && value.length >= 8 && hasNumber(value))
      strengths = 3;
    if (
      hasMixed(value) &&
      hasSpecial(value) &&
      value.length >= 8 &&
      hasNumber(value)
    )
      strengths = 3;
    return strengths;
  };

  useEffect(() => {
    if (password) {
      let strengthValue = strengthIndicator(password);
      let color = strengthColor(strengthValue);
      setStrength(color);
    } else {
      setStrength("");
    }
  }, [password]);

  return (
    <div>
      <Breadcrumb title="Settings" />
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
              <div className="card mb-0">
                <div className="card-body">
                  <div className="border-bottom mb-4 pb-4">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="mb-3">
                          <h5 className="mb-1 fs-18">Change Password</h5>
                          <p>
                            Can't remember your current password?&nbsp;
                            <Link to="#" className="text-decoration-underline">
                              Reset your password via email
                            </Link>
                          </p>
                        </div>
                        <form>
                          <div className="mb-3 position-relative">
                            <label className="form-label">
                              Current Password{" "}
                              <span className="text-danger"> *</span>
                            </label>
                            <div className="position-relative">
                              <input
                                type={isPasswordVisible ? "text" : "password"}
                                className="form-control form-control-lg pass-input"
                              />
                              <span
                                className={`input-icon-addon toggle-password fs-14`}
                                onClick={togglePasswordVisibility}
                              >
                                <i
                                  className={`isax ${
                                    isPasswordVisible
                                      ? "isax-eye"
                                      : "isax-eye-slash"
                                  }`}
                                ></i>
                              </span>
                            </div>
                          </div>
                          <div className="mb-3 position-relative">
                            <label className="form-label">
                              New Password{" "}
                              <span className="text-danger"> *</span>
                            </label>
                            <div
                              className="position-relative"
                              id="passwordInput"
                            >
                              <input
                                className="form-control pass-input"
                                type={eye ? "password" : "text"}
                                onChange={handlePasswordChange}
                              />
                              <span
                                onClick={onEyeClick}
                                className={`toggle-passwords text-gray-7 fs-14 isax isax-eye-slash" ${
                                  eye ? "isax-eye-slash" : "isax-eye"
                                }`}
                              />
                            </div>
                            <div
                              id="passwordStrength"
                              style={{ display: "flex" }}
                              className={`password-strength ${
                                strength === "poor"
                                  ? "poor-active"
                                  : strength === "weak"
                                  ? "avg-active"
                                  : strength === "strong"
                                  ? "strong-active"
                                  : strength === "heavy"
                                  ? "heavy-active"
                                  : ""
                              }`}
                            >
                              <span id="poor" className="active"></span>
                              <span id="weak" className="active"></span>
                              <span id="strong" className="active"></span>
                              <span id="heavy" className="active"></span>
                            </div>
                            <div id="passwordInfo">{messages()}</div>
                          </div>
                          <div className="mb-3 position-relative">
                            <label className="form-label">
                              Confirm Password{" "}
                              <span className="text-danger"> *</span>
                            </label>
                            <div className="position-relative">
                              <input
                                type={eyeConfirmPassword ? "password" : "text"}
                                className="pass-inputa form-control form-control-lg"
                                value={confirmPassword}
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
                              />
                              <span
                                className={`isax toggle-passworda ${
                                  eyeConfirmPassword
                                    ? "isax-eye-slash"
                                    : "isax-eye"
                                } text-gray-7 fs-14`}
                                onClick={() =>
                                  setEyeConfirmPassword((prev) => !prev)
                                }
                                style={{
                                  cursor: "pointer",
                                  position: "absolute",
                                  right: "10px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <button className="btn btn-secondary" type="submit">
                              Change Password
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <h5 className="mb-1 fs-18">Change Email</h5>
                        <p>
                          Your current email address is&nbsp;
                          <Link to="#" className="fw-semibold">
                            richard@example.com
                          </Link>
                        </p>
                      </div>
                      <form>
                        <div className="mb-3">
                          <label className="form-label">
                            New Email Address{" "}
                            <span className="text-danger"> *</span>
                          </label>
                          <input type="text" className="form-control" />
                        </div>
                        <div>
                          <button className="btn btn-secondary" type="submit">
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorChangePassoword;
