import React from 'react'
import { Link } from 'react-router-dom'
import { all_routes } from '../../router/all_routes'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'

import { useAuth } from '../../../core/auth/authContext'

const ProfileCard = () => {
  const { user } = useAuth();
  const displayName = user?.name || "Baraka Mkwawa";
  const displayTitle = user?.title || "Undergraduate Student • BSc. ICT";
  const displayAvatar = user?.avatar || "assets/img/user/user-02.jpg";

  return (
    <div className="profile-card overflow-hidden bg-blue-gradient2 mb-5 p-5">
    <div className="profile-card-bg">
      <ImageWithBasePath
        src="assets/img/bg/card-bg-01.png"
        className="profile-card-bg-1"
        alt=""
      />
    </div>
    <div className="row align-items-center row-gap-3">
      <div className="col-lg-6">
        <div className="d-flex align-items-center">
          <span className="avatar avatar-xxl avatar-rounded me-3 border border-white border-2 position-relative">
            <ImageWithBasePath src={displayAvatar} alt={displayName} />
            <span className="verify-tick">
              <i className="isax isax-verify5" />
            </span>
          </span>
          <div>
            <h5 className="mb-1 text-white d-inline-flex align-items-center">
              <Link to={all_routes.studentProfile}>{displayName}</Link>
              <Link
                to={all_routes.studentProfile}
                className="link-light fs-16 ms-2"
              >
                <i className="isax isax-edit-2" />
              </Link>
            </h5>
            <p className="text-light">{displayTitle}</p>
          </div>
        </div>
      </div>
      <div className="col-lg-6">
        <div className="d-flex align-items-center justify-content-lg-end flex-wrap gap-2">
          <Link
            to={all_routes.becomeAnInstructor}
            className="btn btn-white rounded-pill me-3"
          >
            Become an Instructor
          </Link>
          <Link
            to={all_routes.instructorDashboard}
            className="btn btn-secondary rounded-pill"
          >
            Instructor Dashboard
          </Link>
        </div>
      </div>
    </div>
  </div>
  )
}

export default ProfileCard