import React from 'react'
import { Link } from 'react-router-dom'
import { all_routes } from '../../router/all_routes'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'

import { useAuth } from '../../../core/auth/authContext'

const ProfileCard = () => {
  const { user } = useAuth();
  const displayName = user?.name || "Dr. Amina Kilindo";
  const displayTitle = user?.title || "Senior Lecturer & Researcher • Faculty of Science";
  const displayAvatar = user?.avatar || "assets/img/user/user-01.jpg";

  return (
    <div className="instructor-profile">
    <div className="instructor-profile-bg">
      <ImageWithBasePath
        src="assets/img/bg/card-bg-01.png"
        className="instructor-profile-bg-1"
        alt=""
      />
    </div>
    <div className="row align-items-center row-gap-3">
      <div className="col-md-6">
        <div className="d-flex align-items-center">
          <span className="avatar flex-shrink-0 avatar-xxl avatar-rounded me-3 border border-white border-3 position-relative">
            <ImageWithBasePath src={displayAvatar} alt={displayName} />
            <span className="verify-tick">
              <i className="isax isax-verify5" />
            </span>
          </span>
          <div>
            <h5 className="mb-1 text-white d-inline-flex align-items-center">
              {displayName}
              <Link
                to={all_routes.instructorProfile}
                className="link-light fs-16 ms-2"
              >
                <i className="isax isax-edit-2" />
              </Link>
            </h5>
            <p className="text-light">{displayTitle}</p>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="d-flex align-items-center flex-wrap gap-3 justify-content-md-end">
          <Link to={all_routes.addNewCourse} className="btn btn-white rounded-pill">
            Add New Course
          </Link>
          <Link
            to={all_routes.studentDashboard}
            className="btn btn-secondary rounded-pill"
          >
            Student Dashboard
          </Link>
        </div>
      </div>
    </div>
  </div>
  )
}

export default ProfileCard