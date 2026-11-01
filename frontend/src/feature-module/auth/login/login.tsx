import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Slider from "react-slick";
import { all_routes } from "../../router/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { useAuth } from "../../../core/auth/authContext";
import { DEMO_USERS } from "../../../core/auth/demoUsers";
type PasswordField = "password" | "confirmPassword";

const Login = () => {
  const loginSLider = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    // autoplay: true, // Uncomment if needed
  };

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const route = all_routes;
  const navigate = useNavigate();
  const location = useLocation();

  const handleDemoClick = async (roleKey: 'student' | 'instructor' | 'admin') => {
    const creds = DEMO_USERS[roleKey];
    setEmail(creds.email);
    setPassword(creds.password);
    setErrorMessage("");
    const ok = await login(creds.email, creds.password);
    if (ok) {
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(creds.dashboardUrl);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    const ok = await login(email || 'student@out.ac.tz', password);
    if (ok) {
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
        return;
      }
      const trimmed = (email || '').toLowerCase();
      if (trimmed.includes('admin') || trimmed === 'admin') {
        navigate(route.adminDashboard);
      } else if (trimmed.includes('instructor') || trimmed.includes('teacher')) {
        navigate(route.instructorDashboard);
      } else {
        navigate(route.studentDashboard);
      }
    } else {
      setErrorMessage("Authentication failed. Please check your username and password.");
    }
  };
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
                    <h1 className="fs-32 fw-bold topic">
                      Sign into Your Account
                    </h1>

                    {/* Quick Demo Access Box */}
                    <div className="bg-light p-3 rounded-3 mb-4 border">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-bold fs-13 text-dark">
                          <i className="isax isax-key text-primary me-1" /> One-Click Demo Access:
                        </span>
                        <span className="badge bg-primary text-white fs-10 px-2 py-1">Instant Demo</span>
                      </div>
                      <div className="row g-2">
                        <div className="col-4">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm w-100 py-2 d-flex flex-column align-items-center"
                            onClick={() => handleDemoClick('student')}
                          >
                            <span className="fs-18 mb-1">🎓</span>
                            <span className="fw-bold fs-11">Student</span>
                          </button>
                        </div>
                        <div className="col-4">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm w-100 py-2 d-flex flex-column align-items-center"
                            onClick={() => handleDemoClick('instructor')}
                          >
                            <span className="fs-18 mb-1">👨‍🏫</span>
                            <span className="fw-bold fs-11">Instructor</span>
                          </button>
                        </div>
                        <div className="col-4">
                          <button
                            type="button"
                            className="btn btn-outline-dark btn-sm w-100 py-2 d-flex flex-column align-items-center"
                            onClick={() => handleDemoClick('admin')}
                          >
                            <span className="fs-18 mb-1">🛡️</span>
                            <span className="fw-bold fs-11">Admin</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="alert alert-danger py-2 fs-13 mb-3 d-flex align-items-center">
                        <i className="isax isax-danger me-2 fs-16" />
                        {errorMessage}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mb-3 pb-3">
                      <div className="mb-3 position-relative">
                        <label className="form-label">
                          Email<span className="text-danger ms-1">*</span>
                        </label>
                        <div className="position-relative">
                          <input
                            type="email"
                            className="form-control form-control-lg"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="student@out.ac.tz"
                            required
                          />
                          <span>
                            <i className="isax isax-sms input-icon text-gray-7 fs-14" />
                          </span>
                        </div>
                      </div>
                      <div className="mb-3 position-relative">
                        <label className="form-label">
                          Password <span className="text-danger ms-1">*</span>
                        </label>
                        <div className="position-relative" id="passwordInput">
                          <input
                            type={
                              passwordVisibility.password ? "text" : "password"
                            }
                            className="form-control form-control-lg pass-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                          <span
                            className={`isax toggle-passwords fs-14 ${
                              passwordVisibility.password
                                ? "isax-eye"
                                : "isax-eye-slash"
                            }`}
                            onClick={() => togglePasswordVisibility("password")}
                          ></span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="remember-me d-flex align-items-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            defaultValue=""
                            id="flexCheckDefault"
                          />
                          <label
                            className="form-check-label ms-2"
                            htmlFor="flexCheckDefault"
                          >
                            Remember Me
                          </label>
                        </div>
                        <div className="">
                          <Link to={route.forgotpassword} className="link-2">
                            Forgot Password ?
                          </Link>
                        </div>
                      </div>
                      <div className="d-grid">
                        <button
                          className="btn btn-secondary btn-lg"
                          type="submit"
                        >
                          Login <i className="isax isax-arrow-right-3 ms-1" />
                        </button>
                      </div>
                    </form>
                    <div className="d-flex align-items-center justify-content-center or fs-14 mb-3">
                      Or
                    </div>
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <Link to="#" className="btn btn-light me-2">
                        <ImageWithBasePath
                          src="assets/img/icons/google.svg"
                          alt="img"
                          className="me-2"
                        />
                        Google
                      </Link>
                      <Link to="#" className="btn btn-light">
                        <ImageWithBasePath
                          src="assets/img/icons/facebook.svg"
                          alt="img"
                          className="me-2"
                        />
                        Facebook
                      </Link>
                    </div>
                    <div className="fs-14 fw-normal d-flex align-items-center justify-content-center">
                      Don't you have an account?
                      <Link to={route.register} className="link-2 ms-1">
                        {" "}
                        Sign up
                      </Link>
                    </div>
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

export default Login;
