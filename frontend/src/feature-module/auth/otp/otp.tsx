import {  Input } from "antd";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
// type OTPProps = GetProps<typeof Input.OTP>;

const Otp = () => {
  const loginSLider = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    // autoplay: true, // Uncomment if needed
  };

  const route = all_routes;
  const navigate = useNavigate();
  const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault(); 
      const Path = route.instructorDashboard; 
      navigate(Path);
    };
  
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (seconds > 0) {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [seconds]);

  const formatTime = (time: number) => {
    // Add leading zero for single-digit numbers
    return time < 10 ? `0${time}` : time;
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
                    <div className="topic">
                      <h1 className="fs-32 fw-bold mb-3">Email OTP</h1>
                      <p className="fs-14 fw-normal mb-0">
                        OTP sent to your Email Address
                        ending&nbsp;******doe@example.com
                      </p>
                    </div>
                    <form onSubmit={handleSubmit} className="mb-3 pb-3">
                      <div className="d-flex align-items-center mb-3">
                        {/* <input
                          type="text"
                          className="form-control otp"
                          maxLength={1}
                        />
                        <input
                          type="text"
                          className="form-control otp"
                          maxLength={1}
                        />
                        <input
                          type="text"
                          className="form-control otp"
                          maxLength={1}
                        />
                        <input
                          type="text"
                          className="form-control otp"
                          maxLength={1}
                        /> */}
                        <Input.OTP
                          length={4}
                          formatter={(str) => str.toUpperCase()}
                        />
                      </div>
                      <div className="timer-cover d-flex align-items-center justify-content-center">
                        <div className="badge badge-soft-danger rounded-pill d-flex align-items-center">
                          <i className="isax isax-clock me-1" />
                          <span id="otp_timer">09:{formatTime(seconds)}</span>{" "}
                          <span className="ms-1">s</span>
                        </div>
                      </div>
                      <div className="d-grid">
                        <button
                          className="btn btn-secondary btn-lg"
                          type="submit"
                        >
                          Verify &amp; Proceed
                          <i className="isax isax-arrow-right-3 ms-1" />
                        </button>
                      </div>
                    </form>
                    <div className="fs-14 fw-normal d-flex align-items-center justify-content-center">
                      Didn’t get the OTP?
                      <Link to="#" className="link-2 ms-1">
                        {" "}
                        Resend OTP
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

export default Otp;
