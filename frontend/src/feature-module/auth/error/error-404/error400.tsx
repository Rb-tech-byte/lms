import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../../core/common/imageWithBasePath';
import { all_routes } from '../../../router/all_routes';
import { courseService } from '../../../../core/api/courseService';

const Error400: React.FC = () => {
  useEffect(() => {
    courseService.getRestV2OpenApiInfo().catch(() => null);
  }, []);

  return (
    <div className="error-bg">
      <div className="error-box">
        <div className="error-logo">
          <Link to={all_routes.home}>
            <ImageWithBasePath
              src="assets/img/logo.svg"
              className="img-fluid"
              alt="OUT Logo"
            />
          </Link>
        </div>
        <div className="error-img">
          <ImageWithBasePath
            src="/assets/img/error/error-01.svg"
            className="img-fluid"
            alt="404 Not Found"
          />
        </div>
        <h3 className="h2 mb-3">404 — Academic Resource Not Found</h3>
        <p className="h4 font-weight-normal">
          The requested Open University of Tanzania page or course module could not be found.
        </p>
        <div className="d-flex justify-content-center gap-2 mt-3">
          <Link to={all_routes.home} className="btn back-to-home-btn">
            <i className="isax isax-arrow-left-2 me-1" /> Back to OUT Home
          </Link>
          <Link to={all_routes.courseGrid} className="btn btn-outline-primary">
            Browse Course Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error400;
