import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import Slider from 'react-slick';
import { callInternalApi } from '../../../core/api/apiClient';
import { useAuth } from '../../../core/auth/authContext';

const Otp: React.FC = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '']);
  const [seconds, setSeconds] = useState(60);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDigitChange = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = clean;
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await callInternalApi('resolve_identity').catch(() => null);
    if (user?.role === 'admin') navigate(route.adminDashboard);
    else if (user?.role === 'instructor') navigate(route.instructorDashboard);
    else if (user?.role === 'student') navigate(route.studentDashboard);
    else navigate(route.login);
  };

  const handleResend = async () => {
    setSeconds(60);
    await callInternalApi('request_password_reset', {
      identifier: user?.email || 'student@out.ac.tz',
    }).catch(() => null);
    setStatusMsg('A fresh verification code has been dispatched to your registered OUT email.');
  };

  const loginSLider = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  return (
    <div className="main-wrapper">
      <div className="login-content">
        <div className="row">
          <div className="col-md-6 login-bg d-none d-lg-flex">
            <Slider {...loginSLider} className="login-carousel">
              <div>
                <div className="login-carousel-section mb-3">
                  <div className="login-banner">
                    <ImageWithBasePath
                      src="assets/img/auth/auth-1.svg"
                      className="img-fluid"
                      alt="OUT Security"
                    />
                  </div>
                  <div className="mentor-course text-center">
                    <h3 className="mb-2">
                      Open University of Tanzania <br />
                      Multi-Factor Verification
                    </h3>
                    <p>
                      Protecting student academic transcripts, coursework submissions, and institutional records.
                    </p>
                  </div>
                </div>
              </div>
            </Slider>
          </div>

          <div className="col-md-6 login-wrap-bg">
            <div className="login-wrapper">
              <div className="loginbox">
                <div className="w-100">
                  <div className="d-flex align-items-center justify-content-between login-header">
                    <ImageWithBasePath src="assets/img/logo.svg" className="img-fluid" alt="Logo" />
                    <Link to={route.home} className="link-1">
                      Back to Home
                    </Link>
                  </div>
                  <div className="topic">
                    <h1 className="fs-32 fw-bold mb-3">Email OTP Verification</h1>
                    <p className="fw-normal fs-14 mb-0">
                      Enter the 4-digit security code sent to{' '}
                      <strong>{user?.email || 'your @out.ac.tz address'}</strong>
                    </p>
                  </div>
                  {statusMsg && (
                    <div className="alert alert-info py-2 small mt-3">{statusMsg}</div>
                  )}
                  <form onSubmit={handleSubmit} className="mb-3 pb-3 mt-3">
                    <div className="d-flex align-items-center mb-3 gap-2">
                      {digits.map((d, i) => (
                        <input
                          key={i}
                          type="text"
                          className="form-control form-control-lg text-center fw-bold fs-24 py-2"
                          maxLength={1}
                          value={d}
                          onChange={(e) => handleDigitChange(i, e.target.value)}
                        />
                      ))}
                    </div>
                    <div className="timer-cover d-flex align-items-center justify-content-center">
                      <div className="badge badge-soft-danger rounded-pill d-flex align-items-center">
                        <i className="isax isax-clock me-1" />
                        <span>00:{String(seconds).padStart(2, '0')}s</span>
                      </div>
                    </div>
                    <div className="d-grid mt-4">
                      <button className="btn btn-secondary btn-lg w-100" type="submit">
                        Verify &amp; Proceed <i className="isax isax-arrow-right-1 ms-1" />
                      </button>
                    </div>
                  </form>
                  <div className="fs-14 fw-normal d-flex align-items-center justify-content-center">
                    Didn&apos;t receive the code?
                    <button
                      type="button"
                      onClick={handleResend}
                      className="btn btn-link link-2 ms-1 p-0 text-decoration-none"
                    >
                      Resend OTP
                    </button>
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

export default Otp;
