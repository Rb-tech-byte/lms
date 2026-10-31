import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";

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

const SetPassword = () => {
  const loginSLider = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    // autoplay: true, // Uncomment if needed
  };

  const route = all_routes;
  const [eye, setEye] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [validationError, setValidationError] = useState<number>(0);
  const [strength, setStrength] = useState<string>("");
  const [eyeConfirmPassword, setEyeConfirmPassword] = useState<boolean>(true);
  const navigate = useNavigate();
  const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault(); 
      const Path = route.instructorDashboard; 
      navigate(Path);
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
            style={{ fontSize: 14, color: "#DC3545",marginTop:'8px' }}
          >
            <ImageWithBasePath src="assets/img/icon/angry.svg" className="me-2" alt="" /> Weak. Must contain at least 8 characters
          </span>
        );
      case 3:
        return (
          <span
            id="weak"
            className="active  mt-2"
            style={{ fontSize: 14, color: "#FFC107",marginTop:'8px' }}
          >
            <ImageWithBasePath src="assets/img/icon/anguish.svg" className="me-2" alt="" /> Average. Must contain at least 1 letter or number
          </span>
        );
      case 4:
        return (
          <span
            id="strong"
            className="active  mt-2"
            style={{ fontSize: 14, color: "#0D6EFD",marginTop:'8px' }}
          >
            <ImageWithBasePath src="assets/img/icon/smile.svg" className="me-2" alt="" /> Almost. Must contain special symbol
          </span>
        );
      case 5:
        return (
          <span
            id="heavy"
            className="active  mt-2"
            style={{ fontSize: 14, color: "#4BB543",marginTop:'8px' }}
          >
            <ImageWithBasePath src="assets/img/icon/smile.svg" className="me-2" alt="" /> Awesome! You have a secure password.
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
    <>
      {/* Main Wrapper */}
      <div className="main-wrapper">
        <div className="login-content">
          <div className="row">
            {/* Login Banner */}
            <div className="col-md-6 login-bg d-none d-lg-flex">
              <Slider {...loginSLider} className="login-carousel">
                <div>
                  <div className="login-carousel-section mb-3">
                    <div className="login-banner">
                      <ImageWithBasePath
                        src="assets/img/auth/auth-1.svg"
                        className="img-fluid"
                        alt="Logo"
                      />
                    </div>
                    <div className="mentor-course text-center">
                      <h3 className="mb-2">
                        Welcome to <br />
                        OUT <span className="text-secondary">LMS</span>{" "}
                        Courses.
                      </h3>
                      <p>
                        Platform designed to help organizations, educators, and
                        learners manage, deliver, and track learning and
                        training activities.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="login-carousel-section mb-3">
                    <div className="login-banner">
                      <ImageWithBasePath
                        src="assets/img/auth/auth-1.svg"
                        className="img-fluid"
                        alt="Logo"
                      />
                    </div>
                    <div className="mentor-course text-center">
                      <h3 className="mb-2">
                        Welcome to <br />
                        OUT <span className="text-secondary">LMS</span>{" "}
                        Courses.
                      </h3>
                      <p>
                        Platform designed to help organizations, educators, and
                        learners manage, deliver, and track learning and
                        training activities.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="login-carousel-section mb-3">
                    <div className="login-banner">
                      <ImageWithBasePath
                        src="assets/img/auth/auth-1.svg"
                        className="img-fluid"
                        alt="Logo"
                      />
                    </div>
                    <div className="mentor-course text-center">
                      <h3 className="mb-2">
                        Welcome to <br />
                        OUT <span className="text-secondary">LMS</span>{" "}
                        Courses.
                      </h3>
                      <p>
                        Platform designed to help organizations, educators, and
                        learners manage, deliver, and track learning and
                        training activities.
                      </p>
                    </div>
                  </div>
                </div>
              </Slider>
            </div>
            {/* /Login Banner */}
            <div className="col-md-6 login-wrap-bg">
              {/* Login */}
              <div className="login-wrapper">
                <div className="loginbox">
                  <div className="w-100">
                    <div className="d-flex align-items-center justify-content-between login-header">
                      <ImageWithBasePath
                        src="assets/img/logo.svg"
                        className="img-fluid"
                        alt="Logo"
                      />
                      <Link to={route.homeone} className="link-1">
                        Back to Home
                      </Link>
                    </div>
                    <div className="topic">
                      <h1 className="fs-32 fw-bold ">Set Password</h1>
                      <p className="fw-normal fs-14 mb-0">
                        Your new password must be different from previous
                        password
                      </p>
                    </div>
                    <form
                    onSubmit={handleSubmit}
                      className="mb-3 pb-3"
                    >
                      <div className="mb-3 position-relative">
                        <label className="form-label">
                          New Password <span className="text-danger"> *</span>
                        </label>
                        <div className="position-relative" id="passwordInput">
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
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <span
                            className={`isax toggle-passworda ${
                              eyeConfirmPassword ? "isax-eye-slash" : "isax-eye"
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
                      <div className="d-grid">
                        <button
                          className="btn btn-secondary btn-lg"
                          type="submit"
                        >
                          Reset Password{" "}
                          <i className="isax isax-arrow-right-3 ms-1" />
                        </button>
                      </div>
                    </form>
                    {/* /Login */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default SetPassword;
