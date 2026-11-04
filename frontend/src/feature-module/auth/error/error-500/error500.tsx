import React from 'react';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../../core/common/imageWithBasePath';
import { all_routes } from '../../../router/all_routes';

const Error500: React.FC = () => {
  return (
    <div className="error-bg">
      <div className="error-box">
        <div className="error-logo">
          <Link to={all_routes.home}>
            <ImageWithBasePath
              src="/assets/img/out-logo.png"
              className="img-fluid"
              alt="OUT Logo"
              style={{ maxHeight: 56 }}
            />
          </Link>
        </div>
        <div className="error-img">
          <ImageWithBasePath
            src="/assets/img/error/error-02.svg"
            className="img-fluid"
            alt="500 Server Error"
          />
        </div>
        <h3 className="h2 mb-3">500 — Moodle Service Temporarily Unavailable</h3>
        <p className="h4 font-weight-normal">
          An unexpected server condition occurred while communicating with the Moodle backend.
        </p>
        <div className="d-flex justify-content-center gap-2 mt-3">
          <Link to={all_routes.home} className="btn back-to-home-btn">
            <i className="isax isax-arrow-left-2 me-1" /> Back to OUT Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error500;
